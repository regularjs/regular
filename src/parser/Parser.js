var _ = require("../util.js");
var node = require("./node.js");
var Lexer = require("./Lexer.js");
var varName = _.varName;
var isPath = _.makePredicate("STRING IDENT NUMBER");
var isKeyWord = _.makePredicate("true false undefined null");


function Parser(input, opts){
  opts = opts || {};
  this.input = input;
  this.tokens = new Lexer(input, opts).lex();
  this.pos = 0;
  this.length = this.tokens.length;
}

var op = Parser.prototype;


op.parse = function(){
  this.pos = 0;
  return this.program();
  
}

op.ll =  function(k){
  k = k || 1;
  if(k < 0) k = k + 1;
  var pos = this.pos + k - 1;
  if(pos > this.length - 1){
      return this.tokens[this.length-1];
  }
  return this.tokens[pos];
}
  // lookahead
op.la = function(k, value){
  return (this.ll(k) || '').type;
}

op.match = function(type, value){
  if(!(ll = this.eat(type, value))){
    var ll  = this.ll();
    this.error('expect [' + type + (value == null? '':':'+ value) + ']" -> got "[' + ll.type + (value==null? '':':'+ll.value) + ']', ll.pos)
  }else{
      return ll;
  }
}


// @TODO
op.error = function(msg, pos){
  throw "Parse Error: " + msg +  ':\n' + _.trackErrorPos(this.input, pos != null? pos: this.ll().pos);
}

op.next = function(k){
  k = k || 1;
  this.pos += k;
}
op.eat = function(type, value){
  var ll = this.ll();
  if(typeof type !== 'string'){
    for(var len = type.length ; len--;){
      if(ll.type == type[len]) {
        this.next();
        return ll;
      }
    }
  }else{
    if( ll.type == type 
        && (typeof value == 'undefined' || ll.value == value) ){
       this.next();
       return ll;
    }
  }
  return false;
}

op.isEmpty = function(value){
  return !value || value.length;
}




// program
//  :EOF
//  | (statement)* EOF
op.program = function(){
  var statements = [], statement, ll = this.ll();
  while(ll.type !== 'EOF' && ll.type !=='TAG_CLOSE'){
    statements.push(this.statement());
    ll = this.ll();
  }
  return statements;
}

op.statements = function(until){
  var ll, body = [];
  while( !(ll = this.eat('CLOSE', until)) ){
    body.push(this.statement());
  }
  return body;
}

// statement
//  : xml
//  | dust
//  | text
op.statement = function(){
  var ll = this.ll(),la;
  switch(ll.type){
    case 'NAME':
    case 'TEXT':
      var text = ll.value;
      this.next();
      while(ll = this.eat(['NAME', 'TEXT'])){
        text += ll.value;
      }
      return text;
    case 'TAG_OPEN':
      return this.xml();
    case 'OPEN': 
      return this.directive();
    case 'EXPR_OPEN':
      return this.interplation();
    default:
      this.error('Unexpected token: '+ this.la())
  }
}

// xml 
// stag statement* TAG_CLOSE?(if self-closed tag)
op.xml = function(){
  var name, attrs, children, selfClosed;
  name = this.match('TAG_OPEN').value;
  attrs = this.attrs();
  selfClosed = this.eat('/')
  this.match('>')
  if( !selfClosed ){
    children = this.program();
    if(!this.eat('TAG_CLOSE', name)) this.error('expect </'+name+'> got'+ 'no matched closeTag')
  }
  return node.element(name, attrs, children);
}

//     stag     ::=    '<' Name (S attr)* S? '>'  
//     attr    ::=     Name Eq attvalue
op.attrs = function(){
  var ll = this.ll();
  if(ll.type !=='NAME') return;
  var attrs = [],attr;

  do{
    attr = {name: ll.value}
    if(this.eat('=')) attr.value = this.attvalue();
    attrs.push(attr)

  }while(ll = this.eat('NAME'))
}

// attvalue
//  : STRING  
//  | NAME
op.attvalue = function(){
  var ll = this.ll();
  switch(ll.type){
    case "NAME":
    case "STRING":
      this.next();
      return ll.value;
    case "EXPR_OPEN":
      return this.interplation();
    default:
      this.error('Unexpected token: '+ this.la())
  }
  return ll.value;
}


op.directive = function(name){
  name = name || (this.ll().value);
  if(typeof this[name] == 'function'){
    return this[name]()
  }else{
    this.error('Undefined directive['+ name +']');
  }
}

op.interplation = function(){
  var escape = this.match('EXPR_OPEN').escape;
  var res = this.expr(true);
  this.match('END');
  return node.interplation(res, escape)
}


op.if = function(){
  this.next();
  var test = this.expr();
  var consequent = [], alternate=[];
  var container = consequent;

  this.match('END');

  var ll, type, close;
  while( ! (close = this.eat('CLOSE')) ){
    ll = this.ll();
    if(ll.type == 'OPEN'){
      switch(ll.value){
        case 'else':
          container = alternate;
          this.next();
          this.match('END');
          break;
        case 'elseif':
          alternate.push(this.if())
          return node.if(test, consequent, alternate)
        default:
          container.push(this.statement())
      }
    }else{
      container.push(this.statement());
    }
  }
  // if statement not matched
  if(close.value !== 'if') this.error('Unmatched if directive')
  return node.if(test, consequent, alternate);
}

// @mark   mustache syntax have natrure failutre, canot with expression
op.list = function(){
  this.next();
  // sequence can be a list or hash
  var sequence = this.expr(), variable, body, ll;
  var consequent = [], alternate=[];
  var container = consequent;

  this.match('IDENT', 'as');
  variable = this.match('IDENT').value;
  this.match('END');

  while( !(ll = this.eat('CLOSE')) ){
    if(this.eat('OPEN', 'else')){
      container =  alternate;
      this.match('END');
    }else{
      container.push(this.statement());
    }
  }
  if(ll.value !== 'list') this.error('expect ' + '{/list} got ' + '{/' + ll.value + '}', ll.pos );
  return node.list(sequence, variable ,consequent, alternate);
}



op.expr = function(filter){
  this.deps = [];
  var buffer;
  if(filter){
    buffer = this.filter();
  }else{
    buffer = this.condition();
  }
  if(!this.deps.length){
    // means no dependency
    return new Function("return (" + buffer + ")")();
  }
  return node.expression(buffer, this.deps)
}

op.filter = function(deps){
  var left = this.condition(deps);
  var ll = this.eat('|');
  var buffer, attr;
  if(ll){
    buffer = [
      ";(function(data){", 
          "var ", attr = _.attrName(), "=", this.condition(deps), ";"]
    do{

      buffer.push(attr + " = tn.f[" + this.match('IDENT').value+ "](" + attr) ;
      if(this.eat(':')){
        buffer.push(", "+ this.arguments(deps, "|").join(",") + ");")
      }else{
        buffer.push(');');
      }

    }while(ll = this.eat('|'))
    buffer.push("return " + attr + "}");
    return buffer.join("");
  }
  return left;
}


// or
// or ? assign : assign
op.condition = function(deps){

  var test = this.or();
  if(this.eat('?')){
    return [test + "?", 
      this.assign(deps), 
      this.match(":").type, 
      this.condition(deps)].join("");
  }

  return test;
}

// and
// and && or
op.or = function(){
  var left = this.and();
  if(this.eat('||')){
    return left + '||' + this.or();
  }
  return left;
}
// equal
// equal && and
op.and = function(){
  var left = this.equal();
  if(this.eat('&&')){
    return left + '&&' + this.and();
  }
  return left;
}
// relation
// 
// equal == relation
// equal != relation
// equal === relation
// equal !== relation
op.equal = function(){
  var left = this.relation();
  // @perf;
  if( ll = this.eat(['==','!=', '===', '!=='])){
    return left + ll.type + this.equal();
  }
  return left
}
// relation < additive
// relation > additive
// relation <= additive
// relation >= additive
// relation in additive
op.relation = function(){
  var left = this.additive(), la;
  // @perf
  if(ll = (this.eat(['<', '>', '>=', '<=']) || this.eat('IDENT', 'in') )){
    return left + ll.value + this.relation();
  }
  return left
}
// additive :
// multive
// additive + multive
// additive - multive
op.additive = function(){
  var left = this.multive() ,ll;
  if(ll= this.eat(['+','-']) ){
    return left + ll.value + this.additive();
  }
  return left
}
// multive :
// unary
// multive * unary
// multive / unary
// multive % unary
op.multive = function(){
  var left = this.unary() ,ll;
  if( ll = this.eat(['*', '/' ,'%']) ){
    return left + ll.type + this.multive();
  }
  return left
}
// lefthand
// + unary
// - unary
// ~ unary
// ! unary
op.unary = function(){
  var ll;
  if(ll = this.eat(['+','-','~', '!'])){
    return '(' + ll.type + this.unary() + ')';
  }else{
    return this.member()
  }
}


// call[lefthand] :
// member args
// member [ expression ]
// member . ident  

op.member = function( base, pathes ){
  // @TODO deps must determin in this step
  var ll, path, value;
  if(!base){
    path = this.primary();
    if(path.type === 'IDENT' && !isKeyWord(path.value)){
      pathes = [];
      pathes.push(path.value);
      base = varName + "['" + path.value + "']";
    }else{
      if(path.type) return path.type === 'STRING'? "'"+path.value+"'": path.value;
      else return path;
    }
  }
  if(ll = this.eat(['[', '.', '('])){
    switch(ll.type){
      case '.':
          // member(object, property, computed)
        base +=  "['" + (value = this.match('IDENT').value) + "']";
        pathes && pathes.push(value);
        return this.member( base , pathes);
      case '[':
          // member(object, property, computed)
        path = this.expr();
        base += "['" + (path.value || path) + "']";
        if(pathes && path.type && isPath(path.type)){
          pathes.push(path.value);
        }else{
          this.deps.push(pathes);
          pathes = null;
        }
        this.match(']')
        return this.member(base, pathes);
      case '(':
        // call(callee, args)
        base += "(" + this.arguments().join(",") + ")";
        this.match(')')
        this.deps.push(pathes);
        return this.member(base);
    }
  }
  if(pathes) this.deps.push(pathes);
  return base;
}

/**
 * 
 */
op.arguments = function(end){
  end = end || ')'
  var args = [], ll;
  do{
    if(this.la() !== end){
      args.push(this.condition())
    }
  }while( this.eat(','));
  return args
}


// primary :
// this 
// ident
// literal
// array
// object
// ( expression )

op.primary = function(){
  var ll = this.ll();
  switch(ll.type){
    case "{":
      return this.object();
    case "[":
      return this.array();
    case "(":
      return this.paren();
    // literal or ident
    case "IDENT":
    case 'STRING':
    case 'NUMBER':
      this.next();
      return ll;
    default: 
      this.error('Unexpected Token: '+ ll.type);
  }
}

// object
//  {propAssign [, propAssign] * [,]}

// propAssign
//  prop : assign

// prop
//  STRING
//  IDENT
//  NUMBER

op.object = function(){
  var code = [this.match('{').type];

  var ll;
  var props = [];
  while(true){
    ll = this.eat(['STRING', 'IDENT', 'NUMBER']);
    if(ll){
      code.push(ll.value + this.match(':').type);
      code.push(this.condition());
      if(this.eat(",")) code.push(",");
    }else{
      code.push(this.match('}').type);
      break;
    }
  }
  return code.join("");
}

// array
// [ assignment[,assignment]*]
op.array = function(){
  var code = [this.match('[').type]
  while(item = this.condition()){
    code.push(item);
    if(this.eat(',')) this.push(",");
  }
  code.push(this.match(']').type);
  return code.join("");
}
// '(' expression ')'
op.paren = function(){
  return this.match('(').type + this.expr() + this.match(')').type;
}



module.exports = Parser;

/**
@author	leeluolee
@version	0.0.1
@homepage	http://leeluolee.github.io/terminator
*/
;(function(){
'use strict';

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    throwError()
    return
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  function throwError () {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.exts = [
    '',
    '.js',
    '.json',
    '/index.js',
    '/index.json'
 ];

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  for (var i = 0; i < 5; i++) {
    var fullPath = path + require.exts[i];
    if (require.modules.hasOwnProperty(fullPath)) return fullPath;
    if (require.aliases.hasOwnProperty(fullPath)) return require.aliases[fullPath];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {

  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' === path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }
  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throwError()
    return
  }
  require.aliases[to] = from;

  function throwError () {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' === c) return path.slice(1);
    if ('.' === c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = segs.length;
    while (i--) {
      if (segs[i] === 'deps') {
        break;
      }
    }
    path = segs.slice(0, i + 2).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("terminator/src/browser.js", function(exports, require, module){
var common = require("./common");
});
require.register("terminator/src/common.js", function(exports, require, module){
var Lexer = require("./parser/lexer.js");
var Parser = require("./parser/parser.js");


});
require.register("terminator/src/util.js", function(exports, require, module){
var _  = module.exports;
var slice = [].slice;

_.uid = (function(){
  var _uid=0;
  return function(){
    return _uid++;
  }
})();


_.slice = function(obj, start, end){
  return slice.call(obj, start, end);
}

_.typeOf = function (o) {
  return o == null ? String(o) : ({}).toString.call(o).slice(8, -1).toLowerCase();
}

_.extend = function( o1, o2, override ){

  for(var i in o2){
    if( typeof o1[i] === "undefined" || override ){
      o1[i] = o2[i]
    }
  }
  return o1;
}

// // form acorn.js
// // ---------------------
// _.makePredicate = function makePredicate(words, prefix) {
//     if (typeof words === "string") {
//         words = words.split(" ");
//     }
//     var f = "",
//     cats = [];
//     out: for (var i = 0; i < words.length; ++i) {
//         for (var j = 0; j < cats.length; ++j){
//           if (cats[j][0].length === words[i].length) {
//               cats[j].push(words[i]);
//               continue out;
//           }
//         }
//         cats.push([words[i]]);
//     }
//     function compareTo(arr) {
//         if (arr.length === 1) return f += "return str === "" + arr[0] + "";";
//         f += "switch(str){";
//         for (var i = 0; i < arr.length; ++i){
//            f += "case "" + arr[i] + "":";
//         }
//         f += "return true}return false;";
//     }

//     // When there are more than three length categories, an outer
//     // switch first dispatches on the lengths, to save on comparisons.
//     if (cats.length > 3) {
//         cats.sort(function(a, b) {
//             return b.length - a.length;
//         });
//         f += "var prefix = " + (prefix ? "true": "false") + ";if(prefix) str = str.replace(/^-(?:\\w+)-/,"");switch(str.length){";
//         for (var i = 0; i < cats.length; ++i) {
//             var cat = cats[i];
//             f += "case " + cat[0].length + ":";
//             compareTo(cat);
//         }
//         f += "}";

//         // Otherwise, simply generate a flat `switch` statement.
//     } else {
//         compareTo(words);
//     }
//     return new Function("str", f);
// }

// linebreak
var lb = /\r\n|[\n\r\u2028\u2029]/g
_.trackErrorPos = function (input, pos){
  lb.lastIndex = 0;

  var line = 1, last = 0, nextLinePos;
  var len = input.length;

  var match;
  while ((match = lb.exec(input))) {
    if(match.index < pos){
      ++line;
      last = match.index + 1;
    }else{
      nextLinePos = match.index
    }
  }
  if(!nextLinePos)  nextLinePos = len - 1;

  var min = pos - 10;
  if(min < last) min = last;

  var max = pos + 10;
  if(max > nextLinePos) max = nextLinePos;

  var remain = input.slice(min, max);
  var prefix = line + "> " + (min >= last? "..." : "")
  var postfix = max < nextLinePos ? "...": "";

  return prefix + remain + postfix + "\n" + new Array( prefix.length + pos - min + 1).join(" ") + "^";
}


var ignoredRef = /\(\?\!|\(\?\:|\?\=/;
_.findSubCapture = function (regStr) {
  var left = 0,
    right = 0,
    len = regStr.length,
    ignored = regStr.split(ignoredRef).length - 1; //忽略非捕获匹配
  for (; len--;) {
    var letter = regStr.charAt(len);
    if (len === 0 || regStr.charAt(len - 1) !== "\\" || regStr.charAt(len+1) !== "?") { //不包括转义括号
      if (letter === "(") left++;
      if (letter === ")") right++;
    }
  }
  if (left !== right) throw "RegExp: "+ regStr + "'s bracket is not marched";
  else return left - ignored;
};


_.assert = function(test, msg){
  if(!test) throw msg;
  return true;
}
});
require.register("terminator/src/env.js", function(exports, require, module){

exports.svg = (function(){
  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
})();


exports.transition = function(){

}


});
require.register("terminator/src/dom.js", function(exports, require, module){
var dom = module.exports;
var env = require("./env.js");
var _ = require("./util");


dom.create = function(type, ns){
  return document[  !ns? "createElement": 
    _.assert( ns !== "svg" || evn.svg, "this browser has no svg support") && "createElementNS"](type, ns);
}

dom.attr = function(name, value){

}

dom.css = function(name, value){

}

dom.addClass = function(){

}

dom.delClass = function(){

}

dom.hasClass = function(){

}


});
require.register("terminator/src/parser/lexer.js", function(exports, require, module){
var _ = require('../util.js');

function wrapHander(handler){
  return function(all){
    return {type: handler, value: all }
  }
}
function wrapKeyValue(key, num){
  return function(){
    return {type: key, value: arguments[num] }
  }
}


function Lexer(input, opts){
  this.input = (input||'').trim();
  this.opts = opts || {};
  this.map = this.opts.mode != 2?  map1: map2;
}

var lo = Lexer.prototype

lo.skipspace = function(str){
  var index = 0,ch, input = str;
  ch = input.charCodeAt(index);
  while (ch && (ch===32 || ch===13 || ch === 10 || ch === 8232 || ch === 8233) ) {
    index++; 
    ch = input.charCodeAt(index);
  }
  this.index += index;
  return str.slice(index);
}

lo.lex = function(str){
  str = (str||this.input).trim();
  var tokens = [], remain = this.input = str, 
    TRUNK, split, test,mlen, token, state;
  // 初始化
  this.index=0;

  this.states = ['INIT']
  while(str){

    state = this.state();
    split = this.map[state] 
    test = split.TRUNK.exec(str);
    if(!test){
      console.log(tokens)
       this.error('Unrecoginized Token');
    }
    mlen = test[0].length;
    token = this._process.call(this, test, split)
    if(token) tokens.push(token)
    this.index += mlen;
    str = str.slice(mlen)
    // if(state == 'TAG' || state == 'JST') str = this.skipspace(str);
  }

  tokens.push({
    type: 'EOF'
  });

  return tokens;
}

lo.next = function(){

  var split = this.map[this.state()] 
  var test = split.TRUNK.exec(str);
  if(!test) this.error('Unrecoginized Token');
  var mlen = test[0].length;
  var token = this._process.apply(this, test)
  this.input = this.input.slice(mlen)
  return token;
}

lo.error = function(msg){
    throw "Parse Error: " + msg +  ':\n' + _.trackErrorPos(this.input, this.index);
}

lo._process = function(args, split){
  var links=split.links;

  for(var len = links.length, i=0;i<len ;i++){
    var link = links[i],
      handler = link[2],
      index = link[0];
    if( args[index] !=undefined ) {
      if(handler){
        var token = handler.apply(this, args.slice(index, index + link[1]))
        if(token)  token.pos = this.index;
      }
      break;
    }
  }
  return token;
}

lo.addRule = function(rules, forbid){
}
/**
 * 进入某种状态
 * @param  {[type]} state [description]
 * @return {[type]}
 */
lo.enter = function(state){
  // 如果有多层状态则 则这里用一个栈来标示，
  // 个人目前还没有遇到词法解析阶段需要多层判断的场景
  this.states.push(state)
  return this;
}
/**
 * 退出
 * @return {[type]}
 */

lo.state = function(){
  var states = this.states;
  return states[states.length-1];
}

/**
 * 退出某种状态
 * @return {[type]}
 */
lo.leave = function(){
  this.states.pop();
}

var macro = {
  'BEGIN': '{',
  'END': '}',
  //http://www.w3.org/TR/REC-xml/#NT-Name
  // ":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
  // 暂时不这么严格，提取合适范围
  // 'NAME': /(?:[:_A-Za-z\xC0-\u2FEF\u3001-\uD7FF\uF900-\uFFFF][-\.:_0-9A-Za-z\xB7\xC0-\u2FEF\u3001-\uD7FF\uF900-\uFFFF]*)/
  'NAME': /(?:[:_A-Za-z][-\.:_0-9A-Za-z]*)/,
  'IDENT': /[\$_A-Za-z][-_0-9A-Za-z\$]*/
}

function genMap(rules){
  var rule, map = {}, sign;
  for(var i = 0, len = rules.length; i < len ; i++){
    rule = rules[i];
    sign = rule[2] || 'INIT';
    ( map[sign] || (map[sign] = {rules:[], links:[]}) ).rules.push(rule);
  }
  return setup(map);
}

function setup(map){
  var split, rules, trunks, handler, reg, retain;

  for(var i in map){

    split = map[i];
    split.curIndex = 1;
    rules = split.rules;
    trunks = [];

    for(var i = 0,len = rules.length; i<len; i++){
      rule = rules[i]; 
      reg = rule[0];
      handler = rule[1];

      if(typeof handler == 'string'){
        if(~handler.indexOf(':')){
          var tmp = handler.split(':');
          var key = tmp[0], value = parseInt(tmp[1].replace('$', ''))
          handler = wrapKeyValue(key, value);
        }else{
          handler = wrapHander(handler);
        }
      }
      if(_.typeOf(reg) == 'regexp') reg = reg.toString().slice(1, -1);

      reg = reg.replace(/\{(\w+)\}/g, function(all, one){
        return typeof macro[one] == 'string'? escapeRegExp(macro[one]): String(macro[one]).slice(1,-1);
      })
      retain = _.findSubCapture(reg) + 1; 
      split.links.push([split.curIndex, retain, handler]); 
      split.curIndex += retain;
      trunks.push(reg);
    }
    split.TRUNK = new RegExp("^(?:(" + trunks.join(")|(") + "))")
  }
  return map;
}

/**
 * build the mode 1 and mode 2‘s tokenizer
 */
var rules = {

  // 1. INIT
  // ---------------
  COMMENT: [/<!--([^\x00]*?)-->/],

  // mode1's JST ENTER RULE
  ENTER_JST: [/[^\x00\<]*?(?={BEGIN})/, function(all,one){
    this.enter('JST');
    if(all) return {type: 'TEXT', value: all}
  }],

  // mode2's JST ENTER RULE
  ENTER_JST2: [/[^\x00]*?(?={BEGIN})/, function(all,one){
    this.enter('JST');
    if(all) return {type: 'TEXT', value: all}
  }],

  ENTER_TAG: [/[^\x00<>]*?(?=<)/, function(all){ 
    this.enter('TAG');
    if(all) return {type: 'TEXT', value: all}
  }],

  TEXT: [/[^\x00]+/, 'TEXT'],

  // 2. TAG
  // --------------------
  TAG_NAME: [/{NAME}/, 'NAME', 'TAG'],

  TAG_OPEN: [/<({NAME})\s*/, function(all, one){
    return {type: 'TAG_OPEN', value: one }
  }, 'TAG'],
  TAG_CLOSE: [/<\/({NAME})[\r\n\f ]*>/, function(all, one){
    this.leave();
    return {type: 'TAG_CLOSE', value: one }
  }, 'TAG'],

    // mode2's JST ENTER RULE
  TAG_ENTER_JST: [/(?={BEGIN})/, function(all,one){
    this.enter('JST');
  }, 'TAG'],


  TAG_PUNCHOR: [/[>\/=]/, function(all){
    if(all === '>') this.leave();
    return {type: all, value: all }
  }, 'TAG'],

  TAG_SPACE: [/[ \r\n\f]+/, null, 'TAG'],

  // 3. JST
  // -------------------
  JST_COMMENT: [/{!([^\x00]*?)!}/, null, 'JST'],

  JST_OPEN: ['{BEGIN}\s*({IDENT})', function(all, name){
    return {
      type: 'OPEN',
      value: name
    }
  }, 'JST'],
  JST_LEAVE: [/{END}/, function(){
    this.leave('JST');
    return {type: 'END'}
  }, 'JST'],
  JST_EXPR_OPEN: ['{BEGIN}([=-])',function(one){
    var escape = one == '=';
    return {
      type: 'EXPR_OPEN',
      escape: escape
    }
  }, 'JST'],

  JST_CLOSE: [/{BEGIN}\s*\/\s*({IDENT})\s*{END}/, function(all, one){
    this.leave('JST');
    return {
      type: 'CLOSE',
      value: one
    }
  }, 'JST'],

  JST_IDENT: ['{IDENT}', 'IDENT', 'JST'],

  JST_SPACE: [/[ \r\n\f]+/, null, 'JST'],

  JST_PUNCHOR: [/[=!]?==|[-=><+*\/%]?\=|\|\||&&|[\<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!,#]/, function(all){
    return { type: all, value: all }
  },'JST'],

  JST_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
    return {type: 'STRING', value: one || two}
  }, 'JST'],
  JST_NUMBER: [/[0-9]*\.[0-9]+|[0-9]+/, function(all){
    var value;
    if(typeof (value = parseInt(all)) =='number' && value === value ) return {type: 'NUMBER', value: value}
  }, 'JST']
}

//
var map1 = genMap([
  // INIT
  rules.COMMENT,
  rules.ENTER_JST,
  rules.ENTER_TAG,
  rules.TEXT,

  //TAG
  rules.TAG_NAME,
  rules.TAG_OPEN,
  rules.TAG_CLOSE,
  rules.TAG_PUNCHOR,
  rules.TAG_ENTER_JST,
  rules.TAG_SPACE,

  // JST
  rules.JST_OPEN,
  rules.JST_EXPR_OPEN,
  rules.JST_IDENT,
  rules.JST_SPACE,
  rules.JST_LEAVE,
  rules.JST_CLOSE,
  rules.JST_NUMBER,
  rules.JST_PUNCHOR,
  rules.JST_STRING,
  rules.JST_COMMENT
  ])

// ignored the tag-relative token
var map2 = genMap([
  // INIT no < restrict
  rules.ENTER_JST2,
  rules.TEXT,
  // JST
  rules.JST_OPEN,
  rules.JST_EXPR_OPEN,
  rules.JST_IDENT,
  rules.JST_SPACE,
  rules.JST_LEAVE,
  rules.JST_CLOSE,
  rules.JST_NUMBER,
  rules.JST_PUNCHOR,
  rules.JST_STRING,
  rules.JST_COMMENT
  ])

function escapeRegExp(string){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
  return string.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, function(match){
    return '\\' + match;
  });
};


module.exports = Lexer;

});
require.register("terminator/src/parser/node.js", function(exports, require, module){
module.exports = {
  element: function(name, attrs, children){
    return {
      type: 'element',
      tag: name,
      attrs: attrs,
      children: children
    }
  },
  if: function(test, consequent, alternate){
    return {
      type: 'if',
      test: test,
      consequent: consequent,
      alternate: alternate
    }
  },
  list: function(sequence, variable, body){
    return {
      type: 'list',
      sequence: sequence,
      variable: variable,
      body: body
    }
  },
  text: function(text){
    return text;
  },
  inteplation: function(expression){
    return {
      type: 'inteplation',
      expr:  expression
    }
  },
  filter: function(object, filters){
    return {
      type: 'filter',
      object: object,
      filters: filters
    }
  },
  //coi
  // expression
  condition: function(test, consequent, alternate){
    return {
      type: 'condition',
      test: test,
      consequent: consequent,
      alternate: alternate
    }

  },
  logic: function(op, left, right){
    return {
      type: 'logic',
      op: op,
      left: left,
      right: right
    }
  },
  binary: function(op, left, right){
    return {
      type: 'binary',
      op: op,
      left: left,
      right: right
    }
  },
  unary: function(op, arg){
    return {
      type: 'logic',
      op: op,
      arg: arg
    }
  },
  call: function(callee, args){
    return {
      type: 'call',
      callee: callee,
      args: args
    }

  },
  member: function(obj, prop, isComputed){
    return {
      type: 'member',
      obj: obj,
      prop: prop,
      isComputed: isComputed
    }
  }
}

});
require.register("terminator/src/parser/parser.js", function(exports, require, module){
var _ = require('../util.js');
var node = require('./node.js');
var Lexer = require('./lexer.js');


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
      return this.inteplation();
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
      return this.inteplation();
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

op.inteplation = function(){
  this.match('EXPR_OPEN');
  var res = this.filter();
  this.match('END');
  return res;
}


op.filter = function(){
  var left = this.expr(),ll = this.eat('|');
  if(ll){
    var filters = [], filter;
    do{
      filter = {};
      filter.name = this.match('IDENT').value;
      filter.args = this.arguments('|');
    }while(ll = this.eat('|'))
    return node.filter(left, filters)
  }else{
    return left;
  }
  // fitler(object, filters)
  
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



// 
// 
op.expr = function(){
  return this.condition();
}

// or
// or ? assign : assign
op.condition = function(){
  var test = this.or();
  if(this.eat('?')){
    var consequent = this.assign();
    this.match(':');
    var alternate = this.assign();
    return node.condition(test, consequent, alternate)
  }
  return test;
}

// and
// and && or
op.or = function(){
  var left = this.and();
  if(this.eat('||')){
    return node.logic('||',left, this.or())
  }
  return left;
}
// equal
// equal && and
op.and = function(){
  var left = this.equal();
  if(this.eat('&&')){
    return node.logic('&&',left, this.and());
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
    return node.logic(ll.type, left, this.equal())
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
    return node.logic(ll.value, left, this.relation());
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
    return node.binary(ll.type, left, this.additive());
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
    return node.binary(ll.type, left, this.multive());
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
    return node.unary(ll.type, this.unary())
  }else{
    return this.member()
  }
}


// call[lefthand] :
// member args
// member [ expression ]
// member . ident  

op.member = function( base ){
  base = base || this.primary();
  var ll;
  if(ll = this.eat(['[', '.', '('])){
    switch(ll.type){
      case '.':
          // member(object, property, computed)
        base = node.member( base, this.match('IDENT').value, false)
        return this.member( base );
      case '[':
          // member(object, property, computed)
        base = node.member( base, this.expr(), true )
        this.match(']')
        return this.member(base );
      case '(':
        // call(callee, args)
        base = node.call( base, this.arguments() )
        this.match(')')
        return this.member(base );
    }
  }
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
    case '{':
      return this.object();
    case '[':
      return this.array();
    case '(':
      return this.paren();
    // literal or ident
    case 'IDENT':
      this.next();
      switch(ll.value){
        case 'true':
          return true;
        case 'fasle':
          return false;
        case 'null':
          return null;
        case 'undefined':
          return undefined;
        case 'this':
          return node.this();
        default: 
          return ll;
      }
      break;
    case 'STRING':
    case 'NUMBER':
      this.next();
      return ll.value;
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
  this.match('{');
  var ll;
  var props = [];
  while(ll = this.eat(['STRING', 'IDENT', 'NUMBER'])){
    this.match(':');
    var value = this.condition();
    this.eat(',')
    props.push({key: ll.value, value: value});
  }
  var len = props.length;
  this.match('}');
  return node.object(props)
}

// array
// [ assignment[,assignment]*]
op.array = function(){
  this.match('[');
  var elements = [],item;
  while(item = this.assign()){
    this.eat(',')
    elements.push(item);
  }
  var len = elements.length;
  this.match(']')
  return node.array(elements);
}
// '(' expression ')'
op.paren = function(){
  this.match('(')
  var res= this.expr();
  this.match(')')
  return res;
}



module.exports = Parser;


});
require.alias("terminator/src/browser.js", "terminator/index.js");
if (typeof exports == 'object') {
  module.exports = require('terminator');
} else if (typeof define == 'function' && define.amd) {
  define(function(){ return require('terminator'); });
} else {
  window['terminator'] = require('terminator');
}})();
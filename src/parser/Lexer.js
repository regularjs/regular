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

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
var runtime = require("./common");


exports.dom = require('./dom.js');
exports.dom = require('./dom.js');
});
require.register("terminator/src/common.js", function(exports, require, module){
var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");
var dom = require("./dom.js");
var Scope = require('./Scope.js');
var _ = require('./util');




var Termin = function(template, data){

  var type = _.typeOf(template);
  if(type === 'object'){
    data = template;
    template = null;
  }
  if(template){
    if(type === "string"){
      template = new Parser(template).parse();
    }
    this.template = template;
  }
  this.data= {};
  _.extend(this.data , data || {});
  this.$watchers = [];
  this.$children = [];

  this.context = this.context || this;
  var fragment = this.compile(this.template);
  if(fragment.length === 1) this.node = fragment[0];
  else{
     this.node = dom.fragment();
     for(var i  = 0, len = fragment.length; i < len; i++){
      this.node.appendChild(fragment[i]);
     }
  }
  this.digest()
  if(this.init) this.init.apply(this, arguments);
}






// description
// -------------------------

// 1. Termin and derived Class use same filter
_.extend(Termin, {
  // private data stuff
  _decorators: {},
  _filters: {},
  _customers: {},

  __after__: function(supr, o) {

    var template;
    this.__after__ = supr.__after__;

    this._decorators = _.createObject( supr._decorators )
    this.exprCache = {};

    if(o.name) Termin.register(o.name, this);
    if(template = o.template){
      if(typeof template == 'string'){
        this.prototype.template = new Parser(template).parse();
      }
    }
  },
  derive: _.derive,
  decorate: function(name, cfg){
    var decorators = this._decorators;
    if(cfg == null) return decorators[name];
    decorators[name] = cfg;
    return this;

  },
  register: function(){

  },
  parse: function(expr){
    // @TODO cache
    var expr = expr.trim();
    return this.exprCache[expr] || (this.exprCache[expr] = new Parser(expr).expr());
  }
});


_.extend(Termin.prototype, {
  init: function(){

  },
  compile: function(ast){
    if(_.typeOf(ast) === 'array'){
      var res = [];
      for(var i = 0, len = ast.length; i < len; i++){
        res.push(this.compile(ast[i]));
      }
      return res;
    }
    if(typeof ast === 'string') return document.createTextNode(ast)
    return walkers[ast.type || "default"].call(this, ast);
  },
  parse: function(str){
    if(str && str.type === 'expression'){
      return str;
    }
    return new Parser(str, {state: 'JST'}).expr();
  },
  inject: function(node, direct){
    // node.appendChild(this.fragment);
  },
  set: function(path, value){
    if(typeof path === 'function' ){
      path.call(this);
      this.digest();
    }else{
      var base = this.data;
      if(typeof value !== 'undefined'){
        var spaths = path.split('.');
        for(var i=0,len=spaths.length-1;i<len;i++){
          if((base = base[spaths[i]]) == null) return ;
        }
        base[spaths[len]] = value
      }else if(~path.indexOf('.')){
        var spaths = path.split('.');
        for(var i=0,len=spaths.length;i<len;i++){
          if((base = base[spaths[i]]) == null) return ;
        }
      }else{
        base = base[path];
      }
      this.digest();
    }
  },
  get: function(path){

  },
  digest: function(){
    var watchers = this.$watchers;
    var children = this.$children;

    for(var i = 0, len = watchers.length;i<len; i++){
      var watcher = watchers[i];
      var now = watcher.get(this.data);
      var eq = true;
      if(watcher.deep && _.typeOf(now) == 'object'){
        if(!watcher.last){
           eq = false;
         }else{
          for(var j in now){
            if(watcher.last[j] !== now[j]){
              eq = false;
              break;
            }
          }
          if(eq !== false){
            for(var j in watcher.last){
              if(watcher.last[j] !== now[j]){
                eq = false;
                break;
              }
            }
          }
        }
      }else{
        eq = _.equals(now, watcher.last);
      }
      if(eq===false){
        watcher.fn(now, watcher.last);
        watcher.last = _.clone(now);
      }else{
        if(_.typeOf(eq)=='array' && eq.length){
          watcher.fn(now, eq);
          watcher.last = _.clone(now);
        }
      }
    }
    for(var i = 0, len = children.length; i < len ; i++){
      children[i].$digest(); 
    }
  },
  watch: function(expr, fn){
    if(typeof expr === "string") expr = new Parser(expr).expr(expr);
    var watcher = { get: expr.get.bind(this.context), fn: fn, pathes: expr.pathes };
    this.$watchers.push(watcher);
  }
});


var walkers = {};


walkers.list = function(ast){
  var placeholder = document.createComment("termin list");
  var Section =  Termin.derive({
    template: ast.body,
    context: this
  });
  var self = this;
  var pairs = [];
  this.watch(ast.sequence, function(value){
    var props = {};
    props[ast.variable] = "dajsidajsidasid";
    props["$index"] = 1;
    var data = _.createObject(self.data, props);
    var section = new Section(data);
    // section.inject(placeholder);
  });
  return placeholder;
}

walkers.if = function(){

}

walkers.expression = function(ast){
  console.log(ast.get)
  var node = document.createTextNode();
  this.watch(ast, function(newval){
    dom.text(node, "" + newval);
  })
  return node;
}

walkers.element = function(ast){
  var element = dom.create(ast.tag);
  var attrs = ast.attrs;
  var children = ast.children;
  var child;
  for(var i = 0, len = attrs.length; i < len; i++){
    bindAttrWatcher.call(this, element, attrs[i])
  }
  if(children){
    for(var i =0, len = children.length; i < len ;i++){
      child = this.compile(children[i])
      if(child !== null) element.appendChild(child);
    }
  }
  return element;
}

function bindAttrWatcher(element, attr){
  var scope = this.$scope, 
    name = attr.name,
    value = attr.value, decorator=Termin.decorate(name);
  if(decorator){
    decorator.call(this, element, value);
  }else{
    if( value && value.type == 'expression' ){
      this.watch(value, function(nvalue){
        dom.attr(element, name, nvalue);
      })
    }else{
      dom.attr(element, name, value);
    }
  }
}

var events = "click mouseover mouseout change focus blur keydown keyup keypress".split(" ");
events.forEach(function(item){
  Termin.decorate('t-'+item, function(elem, value){

    var fn = this.parse(value);
    dom.on(elem, item, function(ev){
      fn(this.data);
    });
  });
})

function initSelect(scope, elem, value, parseFn){
  // 初始化一次
  if(parseFn(scope)==null){
    parseFn.assign(elem.value)(scope);
  }

  scope.$watch(parseFn, function(newValue, oldValue){
    var children = e._$all('option',elem)
    children.forEach(function(node, index){
      if(node.value == newValue){
        elem.selectedIndex = index;
      }
    })
  });

  function handler(ev){
    parseFn.assign(this.value)(scope);
    if(!scope.$phase) scope.$digest()
  }
  v._$addEvent(elem, 'change', handler)
}

function initText(scope, elem, value, parseFn){


  scope.$watch(parseFn, function(newValue, oldValue){
    if(scope.$state('trigger') == elem) return;
    elem.value = nm.string(newValue);
  });

  var handler = throttle(function handler(ev){
    var value = this.value;
    scope.$set(value)
    scope.$apply(function(){
      parseFn.assign(value.trim())(scope);
    });
  })

  if(dom.msie !== 9 && 'oninput' in testNode ){
    elem.addEventListener('input', handler );
  }else{
    v._$addEvent(elem, 'paste', handler)
    v._$addEvent(elem, 'keyup', handler)
    v._$addEvent(elem, 'cut', handler)
  }
}

Termin.decorate('t-model', function(elem,value){
  var fn = this.parse(value);
  console.log(fn.get.toString())
})






module.exports = Termin;

});
require.register("terminator/src/util.js", function(exports, require, module){
var _  = module.exports;
var slice = [].slice;
var o2str = ({}).toString;

_.uid = (function(){
  var _uid=0;
  return function(){
    return _uid++;
  }
})();

_.varName = 'data';
// randomVar
_.randomVar = function(suffix){
  return (suffix || "var") + "_" + _.uid().toString(36);
}


_.host = "data";


_.slice = function(obj, start, end){
  return slice.call(obj, start, end);
}

_.typeOf = function (o) {
  return o == null ? String(o) : ({}).toString.call(o).slice(8, -1).toLowerCase();
}


_.extend = function( o1, o2, override ){
  if(_.typeOf(override) === 'array'){
   for(var i = 0, len = override.length; i < len; i++ ){
    var key = override[i];
    o1[key] = o2[key];
   } 
  }else{
    for(var i in o2){
      if( typeof o1[i] === "undefined" || override === true ){
        o1[i] = o2[i]
      }
    }
  }
  return o1;
}

// form acorn.js
_.makePredicate = function makePredicate(words, prefix) {
    if (typeof words === "string") {
        words = words.split(" ");
    }
    var f = "",
    cats = [];
    out: for (var i = 0; i < words.length; ++i) {
        for (var j = 0; j < cats.length; ++j){
          if (cats[j][0].length === words[i].length) {
              cats[j].push(words[i]);
              continue out;
          }
        }
        cats.push([words[i]]);
    }
    function compareTo(arr) {
        if (arr.length === 1) return f += "return str === " + arr[0] + ";";
        f += "switch(str){";
        for (var i = 0; i < arr.length; ++i){
           f += "case '" + arr[i] + "':";
        }
        f += "return true}return false;";
    }

    // When there are more than three length categories, an outer
    // switch first dispatches on the lengths, to save on comparisons.
    if (cats.length > 3) {
        cats.sort(function(a, b) {
            return b.length - a.length;
        });
        f += "var prefix = " + (prefix ? "true": "false") + ";if(prefix) str = str.replace(/^-(?:\\w+)-/,'');switch(str.length){";
        for (var i = 0; i < cats.length; ++i) {
            var cat = cats[i];
            f += "case " + cat[0].length + ":";
            compareTo(cat);
        }
        f += "}";

        // Otherwise, simply generate a flat `switch` statement.
    } else {
        compareTo(words);
    }
    return new Function("str", f);
}

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

  var remain = input.slice(min, max+1);
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

_.escapeRegExp = function(string){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
  return string.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, function(match){
    return '\\' + match;
  });
};



_.assert = function(test, msg){
  if(!test) throw msg;
  return true;
}


_.walk = function(proto){
  var walkers = {};
  proto.walk = function walk(ast, arg){
    if(o2str.call(ast) === "[object Array]"){
      var res = [];
      for(var i = 0, len = ast.length; i < len; i++){
        res.push(this.walk(ast[i]));
      }
      return res;
    }
    return walkers[ast.type || "default"].call(this, ast, arg);
  }
  return walkers;
}



_.isEmpty = function(obj){
  return !obj || obj.length === 0;
}


// simple get accessor
_.compileGetter = function(paths){
  var base = "obj";
  var code = "if(" +base+ " != null";
  for(var i = 0, len = paths.length; i < len; i++){
    base += "['" +paths[i]+ "']";
    code += "&&" + base + "!=null";
  }
  code += ") return " + base + ";\n";
  code += "else return undefined";
  return new Function("obj", code);
}

_.createObject = function(o, props){
    function foo() {}
    foo.prototype = o;
    var res = new foo;
    if(props){
      _.extend(res, props)
    }
    return res;
}

_.createProto = function(fn, o){
    function foo() { this.constructor = fn;}
    foo.prototype = o;
    return (fn.prototype = new foo());
}

// (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org

// klass: a classical JS OOP façade
// https://github.com/ded/klass
// License MIT (c) Dustin Diaz 2014
  
// inspired by backbone's extend and klass
_.derive = (function(){
var fnTest = /xy/.test(function(){xy}) ? /\bsupr\b/ : /.*/,
  isFn = function(o){return typeof o === 'function'};

  function wrap(k, fn, supro) {
    return function () {
      var tmp = this.supr;
      this.supr = supro[k];
      var ret = fn.apply(this, arguments);
      this.supr = tmp;
      return ret;
    }
  }
  function process( what, o, supro ) {
    for ( var k in o ) {
      if (o.hasOwnProperty(k)) {

        what[k] = isFn( o[k] ) && isFn( supro[k] )
          && fnTest.test( o[k] ) ? wrap(k, o[k], supro) : o[k];
      }
    }
  }

  return function derive(o){
    var supr = this, proto,
      supro = supr.prototype;

    function fn() {
      supr.apply(this, arguments);
    }

    proto = _.createProto(fn, supro);

    (fn.methods = function (o) {
      process(proto, o, supro);
    })(o);

    if(supr.__after__) supr.__after__.call(fn, supr, o);
    fn.derive = supr.derive;
    // _.extend(fn, supr, supr.__statics__ || []);
    return fn;
  }
})();



/**
clone
*/
_.clone = function clone(obj){
    var type = _.typeOf(obj);
    if(type == 'array'){
      var cloned = [];
      for(var i=0,len = obj.length; i< len;i++){
        cloned[i] = obj[i]
      }
      return cloned;
    }
    if(type == 'object'){
      var cloned = {};
      for(var i in obj) if(obj.hasOwnProperty(i)){
        cloned[i] = obj[i];
      }
      return cloned;
    }
    return obj;
  }


_.equals = function(now, old){
  if(_.typeOf(now) == 'array'){
    var splices = ld(now, old||[]);
    return splices;
  }
  return now === old;
}


//Levenshtein_distance
//=================================================
//1. http://en.wikipedia.org/wiki/Levenshtein_distance
//2. github.com:polymer/observe-js

var ld = (function(){
  function equals(a,b){
    return a === b;
  }
  function ld(array1, array2){
    var n = array1.length;
    var m = array2.length;
    var matrix = [];
    for(var i = 0; i <= n; i++){
      matrix.push([i]);
    }
    for(var j=1;j<=m;j++){
      matrix[0][j]=j;
    }
    for(var i = 1; i <= n; i++){
      for(var j = 1; j <= m; j++){
        if(equals(array1[i-1], array2[j-1])){
          matrix[i][j] = matrix[i-1][j-1];
        }else{
          matrix[i][j] = Math.min(
            matrix[i-1][j]+1, //delete
            matrix[i][j-1]+1//add
            )
        }
      }
    }
    return matrix;
  }
  function whole(arr2, arr1) {
      var matrix = ld(arr1, arr2)
      var n = arr1.length;
      var i = n;
      var m = arr2.length;
      var j = m;
      var edits = [];
      var current = matrix[i][j];
      while(i>0 || j>0){
        // 最后一列
          if (i == 0) {
            edits.unshift(3);
            j--;
            continue;
          }
          // 最后一行
          if (j == 0) {
            edits.unshift(2);
            i--;
            continue;
          }
          var northWest = matrix[i - 1][j - 1];
          var west = matrix[i - 1][j];
          var north = matrix[i][j - 1];

          var min = Math.min(north, west, northWest);

          if (min == northWest) {
            if (northWest == current) {
              edits.unshift(0); //no change
            } else {
              edits.unshift(1); //update
              current = northWest;
            }
            i--;
            j--;
          } else if (min == west) {
            edits.unshift(2); //delete
            i--;
            current = west;
          } else {
            edits.unshift(3); //add
            j--;
            current = north;
          }
          
        }
        var LEAVE = 0;
        var ADD = 3;
        var DELELE = 2;
        var UPDATE = 1;
        var n = 0;m=0;
        var steps = [];
        var step = {index: null, add:0, removed:[]};

        for(var i=0;i<edits.length;i++){
          if(edits[i]>0 ){
            if(step.index == null){
              step.index = m;
            }
          }
          else {
            if(step.index != null){
              steps.push(step)
              step = {index: null, add:0, removed:[]};
            }
          }
          switch(edits[i]){
            case LEAVE:
              n++;
              m++;
              break;
            case ADD:
              step.add++;
              m++;
              break;
            case DELELE:
              step.removed.push(arr1[n])
              n++;
              break;
            case UPDATE:
              step.add++;
              step.removed.push(arr1[n])
              n++;
              m++;
              break;
          }
        }
        if(step.index != null){
          steps.push(step)
        }
        return steps
      }
      return whole;
  })();

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
var tNode = document.createElement('div')

dom.tNode = tNode;

dom.msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
if (isNaN(dom.msie)) {
  dom.msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
}

// createElement 
dom.create = function(type, ns){
  return document[  !ns? "createElement": 
    _.assert( ns !== "svg" || evn.svg, "this browser has no svg support") && "createElementNS"](type, ns);
}

// documentFragment
dom.fragment = function(){
  return document.createDocumentFragment();
}

dom.append = function(parent, el){
  if(_.typeOf(el) === 'array'){
    for(var i = 0, len = el.length; i < len ;i++){
      dom.append(parent ,el[i]);
    }
  }else{
    if(el) parent.appendChild(el);
  }
}


// attribute Setter & Getter
dom.attr = function(node, name, value){
  if(value === undefined){
    return node.getAttribute(name, value);
  }
  if(value === null){
    return node.removeAttribute(name)
  }
  return node.setAttribute(name, value);
}


dom.on = function(node, type, handler, capture){
  if (node.addEventListener) node.addEventListener(type, handler, !!capture);
  else node.attachEvent('on' + type, handler);
}

dom.off = function(node, type, handler, capture){
  if (node.removeEventListener) node.removeEventListener(type, handler, !!capture);
  else node.detachEvent('on' + type, handler);
}


dom.text = (function (){
      var map = {};
      if (dom.msie && dom.msie < 9) {
        map[1] = 'innerText';    
        map[3] = 'nodeValue';    
      } else {
        map[1] =                
        map[3] = 'textContent';  
      }
  
  return function (element, value) {
    var textProp = map[element.nodeType];
    if (value == null) {
      return textProp ? element[textProp] : '';
    }
    element[textProp] = value;
  }
})();




var mapSetterGetter = {
  "html": "innerHTML"
}

dom.html = function(){
  if(text === undefined){
    return node.innerHTML
  }else{
    node.innerHTML = text;
  }
}

// css Settle & Getter
dom.css = function(name, value){

}

dom.addClass = function(){

}

dom.delClass = function(){

}

dom.hasClass = function(){

}




});
require.register("terminator/src/Scope.js", function(exports, require, module){
var _ = require('./util.js');
var Parser = require('./parser/Parser.js');

function Scope(context){
  this.$id = _.uid('scope');
  this.$watchers = [];
  this.$children = [];
  this.$context = context;

}


_.extend(Scope.prototype, {

  $watch: function(expr, fn, deep){
    if(typeof expr === "string") expr = new Parser(expr).expr(expr);
    var watcher = { get: expr.body.bind(this.$context), fn: fn, pathes: expr.pathes };
    this.$watchers.push(watcher);
  },

  $set: function(path, value){
    if(typeof path === 'function' ){
      path.call(this);
      this.$digest();
    }else{
      this.$pathValue(path, value);
      this.$digest();
    }
  },
  $get: function(pathes){
    if(_.typeOf( pathes ) !== 'array'){
      pathes = pathes.split(".");
    }
    var base = this[pathes[0]];

    for(var i =i,len = pathes.length; i < len ; i++){
      if(!base) return base;
      base = base[pathes[i]];
    }
    return base;
  },

  $digest: function(path){
    var watchers = this.$watchers;
    var children = this.$children;

    for(var i = 0, len = watchers.length;i<len; i++){
      var watcher = watchers[i];
      var now = watcher.get(this);
      var eq = true;
      if(watcher.deep && _.typeOf(now) == 'object'){
        if(!watcher.last){
           eq = false;
         }else{
          for(var j in now){
            if(watcher.last[j] !== now[j]){
              eq = false;
              break;
            }
          }
          if(eq !== false){
            for(var j in watcher.last){
              if(watcher.last[j] !== now[j]){
                eq = false;
                break;
              }
            }
          }
        }
      }else{
        eq = _.equals(now, watcher.last);
      }
      if(eq===false){
        watcher.fn(now, watcher.last);
        watcher.last = _.clone(now);
      }else{
        if(_.typeOf(eq)=='array' && eq.length){
          watcher.fn(now, eq);
          watcher.last = _.clone(now);
        }
      }
    }

    for(var i = 0, len = children.length; i < len ; i++){
      children[i].$digest(); 
    }
  },

  $destroy: function(){
    var $parent = this.$parent;

    if($parent){
      var childs = $parent.$chidren;
      var index = childs.indexOf(this);
      if(~index) childs.splice(index,1);
    }
    this.$chidren = null;
    this.$context = null;
    this.$watcher = null;
    this.$parent  =null;
  },

  $new: function(before){
    var child = _.create(this);
    child.$root = this.$root;
    child.$id = _.uid('scope')
    child.$parent = this;
    this.$children.push(child)
    child.$watcher = [];
    child.$children = [];
    child.$context = this.$context;
    return child;
  },
  /**
   * 设置某个path的属性值
   * @param  {String} path  如name.hello
   * @param  {Mix} value 所有设置值
   */
  $pathValue: function(path, value){
    var base = this;
    if(typeof value !== 'undefined'){
      var spaths = path.split('.');
      for(var i=0,len=spaths.length-1;i<len;i++){
        if((base = base[spaths[i]]) == null) return ;
      }
      base[spaths[len]] = value
      return;
    }
    if(~path.indexOf('.')){
      var spaths = path.split('.');
      for(var i=0,len=spaths.length;i<len;i++){
        if((base = base[spaths[i]]) == null) return ;
      }
    }else{
      base = base[path];
    }
    if(typeof base === 'function') return base();
    return base;
  }

});


module.exports = Scope;
});
require.register("terminator/src/parser/Lexer.js", function(exports, require, module){
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
  this.states = ['INIT']
  if(opts.state) this.states.push(opts.state);
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
lo.leave = function(state){
  var states = this.states;
  if(!state || states[states.length-1] === state) states.pop()
}

var macro = {
  'BEGIN': '{{',
  'END': '}}',
  //http://www.w3.org/TR/REC-xml/#NT-Name
  // ":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
  // 暂时不这么严格，提取合适范围
  // 'NAME': /(?:[:_A-Za-z\xC0-\u2FEF\u3001-\uD7FF\uF900-\uFFFF][-\.:_0-9A-Za-z\xB7\xC0-\u2FEF\u3001-\uD7FF\uF900-\uFFFF]*)/
  'NAME': /(?:[:_A-Za-z][-\.:_0-9A-Za-z]*)/,
  'IDENT': /[\$_A-Za-z][-_0-9A-Za-z\$]*/,
  'SPACE': /[\r\n\f ]/
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
        return typeof macro[one] == 'string'? _.escapeRegExp(macro[one]): String(macro[one]).slice(1,-1);
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
  TAG_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
    return {type: 'STRING', value: one || two}
  }, 'TAG'],

  TAG_SPACE: [/{SPACE}+/, null, 'TAG'],

  // 3. JST
  // -------------------
  JST_COMMENT: [/{!([^\x00]*?)!}/, null, 'JST'],

  JST_OPEN: ['{BEGIN}#{SPACE}*({IDENT})', function(all, name){
    return {
      type: 'OPEN',
      value: name
    }
  }, 'JST'],
  JST_PART_OPEN: ['{BEGIN}>{SPACE}*({IDENT})', function(all, name){
    return {
      type: 'PART_OPEN',
      value: name
    }
  }, 'JST'],
  JST_LEAVE: [/{END}/, function(){
    this.leave('JST');
    return {type: 'END'}
  }, 'JST'],

  JST_CLOSE: [/{BEGIN}\s*\/\s*({IDENT})\s*{END}/, function(all, one){
    this.leave('JST');
    return {
      type: 'CLOSE',
      value: one
    }
  }, 'JST'],
  JST_EXPR_OPEN: ['{BEGIN}',function(all, one){
    var escape = one == '=';
    return {
      type: 'EXPR_OPEN',
      escape: escape
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
  JST_NUMBER: [/-?(?:[0-9]*\.[0-9]+|[0-9]+)/, function(all){
    return {type: 'NUMBER', value: parseFloat(all, 10)};
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
  rules.TAG_STRING,
  rules.TAG_SPACE,

  // JST
  rules.JST_OPEN,
  rules.JST_PART_OPEN,
  rules.JST_CLOSE,
  rules.JST_EXPR_OPEN,
  rules.JST_IDENT,
  rules.JST_SPACE,
  rules.JST_LEAVE,
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
  rules.JST_PART_OPEN,
  rules.JST_CLOSE,
  rules.JST_EXPR_OPEN,
  rules.JST_IDENT,
  rules.JST_SPACE,
  rules.JST_LEAVE,
  rules.JST_NUMBER,
  rules.JST_PUNCHOR,
  rules.JST_STRING,
  rules.JST_COMMENT
  ])



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
  attribute: function(name, value){
    return {
      type: 'attribute',
      name: name,
      value: value
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
  expression: function(get, set,  depend){
    return {
      type: "expression",
      get: get,
      set: set,
      depend: depend

    }
  },
  text: function(text){
    return text;
  },
  interplation: function(expression){
    return {
      type: 'interplation',
      expression:  expression
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
require.register("terminator/src/parser/Parser.js", function(exports, require, module){
var _ = require("../util.js");
var node = require("./node.js");
var Lexer = require("./Lexer.js");
var varName = _.varName;
var isPath = _.makePredicate("STRING IDENT NUMBER");
var isKeyWord = _.makePredicate("true false undefined null this Array Date JSON Math NaN RegExp decodeURI decodeURIComponent encodeURI encodeURIComponent parseFloat parseInt");


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

  var attrs = [], attr, ll;
  while( ll = this.eat('NAME') ){
    attr = { name: ll.value }
    if( this.eat('=') ) attr.value = this.attvalue();
    attrs.push( attr )
  }
  return attrs;
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
  var nowatch = this.match('EXPR_OPEN').nowatch;
  var res = this.expr(true);
  this.match('END');
  return res;
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
  this.depend = [];
  var buffer;
  if(filter){
    buffer = this.filter();
  }else{
    buffer = this.condition();
  }

  var body = new Function(_.varName ,"return (" + buffer + ")");

  if(!this.depend.length){
    // means no dependency
    return body();
  }else{
    return node.expression(body,null, this.depend)
  }
  
}

op.filter = function(depend){
  var left = this.condition(depend);
  var ll = this.eat('|');
  var buffer, attr;
  if(ll){
    buffer = [
      ";(function(data){", 
          "var ", attr = _.attrName(), "=", this.condition(depend), ";"]
    do{

      buffer.push(attr + " = this.f[" + this.match('IDENT').value+ "](" + attr) ;
      if(this.eat(':')){
        buffer.push(", "+ this.arguments(depend, "|").join(",") + ");")
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
op.condition = function(){

  var test = this.or();
  if(this.eat('?')){
    return [test + "?", 
      this.condition(), 
      this.match(":").type, 
      this.condition()].join("");
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
  var left = this.relation(), ll;
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
  var left = this.additive(), la,ll;
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
  // @TODO depend must determin in this step
  var ll, path, value;
  if(!base){
    path = this.primary();
    if(path.type === 'IDENT'){
      if(!isKeyWord(path.value)){
        pathes = [];
        pathes.push(path.value);
        base = varName + "['" + path.value + "']";
      }else{
        base = path.value
      }
    }else{
        base = path.type === 'STRING'? "'"+path.value+"'": path.value;
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
        base += "['" + path + "']";

        if(pathes && path.type && isPath(path.type)){
          pathes.push(path.value);
        }else{
          this.depend.push(pathes);
          pathes = false;
        }
        this.match(']')
        return this.member(base, pathes);
      case '(':
        // call(callee, args)
        base += "(" + this.arguments().join(",") + ")";
        this.match(')')
        this.depend.push(pathes);
        return this.member(base);
    }
  }
  if(pathes) this.depend.push(pathes);
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

});
require.register("terminator/src/compiler/Compiler1.js", function(exports, require, module){
// compiler1 for mode 1;
var _ = require("../util.js"); 
var dom = require("../dom");
var Parser = require("../parser/Parser.js");


function Compiler(ast, opts){
  if(typeof ast == "string") ast = new Parser(ast).parse();
  this.ast = ast;
}

function compile(ast){
  if(typeof ast == "string") ast = new Parser(ast).parse();
  var fragment = dom.fragment();
  dom.append(fragment, walk.call(this, ast) );
  return fragment;
}




function walk(ast){

}





var co = Compiler.prototype;

co.compile = function(){
}


var wk = _.walk(co);

wk.default = function(){

}


wk.interplation = function(ast){

}

wk.expression = function(){

}

module.exports = Compiler;
});
require.register("terminator/src/compiler/Compiler2.js", function(exports, require, module){
var _ = require('../util.js'); 
var Parser = require('../parser/Parser.js');


function Compiler(input){
   this.ast = new Parser(input, {mode: 2}).parse();
}

var co = Compiler.prototype;

co.compile = function(){

}

co.walk =_.walk; 


module.exports = Compiler;
});
require.alias("terminator/src/browser.js", "terminator/index.js");
if (typeof exports == 'object') {
  module.exports = require('terminator');
} else if (typeof define == 'function' && define.amd) {
  define(function(){ return require('terminator'); });
} else {
  window['terminator'] = require('terminator');
}})();
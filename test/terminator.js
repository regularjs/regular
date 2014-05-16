/**
@author	leeluolee
@version	0.0.1
@homepage	http://leeluolee.github.io/terminator
*/

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
require.register("terminator/src/common.js", function(exports, require, module){
var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");
var node = require("./parser/node.js");
var dom = require("./dom.js");
var Scope = require('./Scope.js');
var Group = require('./group.js');
var _ = require('./util');
var Event = require('./helper/event.js');




var Termin = function(template, data){

  var type = _.typeOf(template);
  if(type === 'object'){
    data = template;
    template = null;
  }
  if(template){
    if(type === "string"){
      template = Termin.getTemplate(template);
      template = new Parser(template).parse();
    }
    this.template = template;
  }

  this.data= {};
  _.extend(this.data , data || {});
  this.$watchers = [];
  this.$children = [];

  this.context = this.context || this;

  this.group = this.$compile(this.template);
  this.node = this.group.generate();
  this.$digest()
  if(this.init) this.init.apply(this, arguments);
}






// description
// -------------------------

// 1. Termin and derived Class use same filter
_.extend(Termin, {
  // private data stuff
  _decorators: {},
  _components: {},
  _filters: {},
  _customers: {},
  _exprCache:{},

  __after__: function(supr, o) {

    var template;
    this.__after__ = supr.__after__;

    this._decorators = _.createObject( supr._decorators )

    if(o.name) Termin.component(o.name, this);
    if(template = o.template){
      template = Termin.getTemplate(template);
      if(typeof template == 'string'){
        this.prototype.template = new Parser(template).parse();
      }
    }

  },
  getTemplate: function(template){
    if(/^\w{1,20}$/.test(template)){
      return document.getElementById(template).innerHTML;
    }else{
      return template;
    }
  },
  derive: _.derive,
  decorate: function(name, cfg){
    var decorators = this._decorators;
    if(cfg == null) return decorators[name];
    decorators[name] = cfg;
    return this;

  },
  component: function(name, Component){
    if(!Component) return this._components[name];
    this._components[name] = Component;
    return this;

  },
  parse: function(expr){
    // @TODO cache
    if(expr.type === 'expression') return expr;
    var expr = expr.trim();
    var res = this._exprCache[expr] || (this._exprCache[expr] = new Parser(expr,{state: 'JST'}).expression());
    return res;
  }
});


Event.mixTo(Termin)
_.extend( Termin.prototype, {
  init: function(){},
  $compile: function(ast){
    if(_.typeOf(ast) === 'array'){
      var res = [];
      for(var i = 0, len = ast.length; i < len; i++){
        res.push(this.$compile(ast[i]));
      }
      return new Group(res);
    }
    if(typeof ast === 'string') return document.createTextNode(ast)
    return walkers[ast.type || "default"].call(this, ast);
  },
  $inject: function(node, direct){
    direct = direct || 'bottom';
    // node.appendChild(this.fragment);
  },
  generate: function(){
    return this.node || this.group.generate();
  },
  $apply: function(){

  },
  set: function(path, value){
    if(typeof path === 'function' ){
      path.call(this, this.data);
    }else{
      var base = this.data;
      var path = Termin.parse(path);
      path.set(this, value);
    }
    this.$digest(path);
  },
  _path: _._path,
  $digest: function(path){
    var watchers = this.$watchers;
    var children = this.$children;
    if(this.$phase === 'digest')  return;

    this.$phase = 'digest';
    var dirty = false;
    this.$trigger('digest');

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
        }else{
          eq = true;
        }
      }
      if(eq !== true) dirty = true;
    }
    this.$phase = null;
    if(dirty) this.$digest();

  },
  destroy: function(){
    this.group.destroy();
    this.$watchers = null;
    this.template = null;
  },
  $watch: function(expr, fn){
    var uid = _.uid('w_');
    var expr = Termin.parse(expr);
    var watcher = { get: expr.get, fn: fn, pathes: expr.pathes , id: uid};
    this.$watchers.push(watcher);
    return uid;
  },
  $unwatch: function(uid){
    var watchers = this.$watchers;
    if(!uid || !watchers) return;
    for(var len = watchers.length; len-- ;){
      if(watchers[len] && watchers[len].id === uid) return watchers.splice(len, 1);
    }
  },

  inject: function(node, position){
    position = position || 'bottom';
    var firstChild,lastChild, parentNode, next;
    switch(position){
      case 'bottom':
        node.appendChild(this.node)
        break;
      case 'top':
        if(firstChild = node.firstChild){
          node.insertBefore(this.node, node.firstChild)
        }else{
          node.appendChild(this.node);
        }
        break;
      case 'after':
        if(next = node.nextSibling){
          next.parentNode.insertBefore(this.node, next);
        }else{
          next.parentNode.appendChild(this.node);
        }
        break;
      case 'before':
        node.parentNode.insertBefore(this.node, node);
    }
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
  var group = new Group();
  this.$watch(ast.sequence, function(newValue, splices){
    if(!splices || !splices.length) return;
    var cur = placeholder;
    var m = 0,
      len=newValue.length,
      mIndex = splices[0].index;
    for(var i=0; i < splices.length; i++){ //init
      var splice = splices[i];
      var index = splice.index;

      for(var k=m; k<index; k++){ // no change
        var sect = group.get(k);
        sect.set('$index', k);
      }
      for(var j=0,jlen = splice.removed.length; j< jlen; j++){ //removed
        var removed = group.children.splice(index,1)[0];
        removed.destroy();
      }

      for(var o=index; o < index + splice.add; o++){ //add
        // prototype inherit
        var item = _.createObject(newValue[o]);
        var data = {};
        data.$index = o;
        data[ast.variable] = item;
        var section = new Section(data);
        window.section = section
        var insert = group.get(o-1)? group.get(o-1).group.get(-1): placeholder;
        placeholder.parentNode.insertBefore(section.node, insert.nextSibling);
        group.children.splice(o, 0, section);
      }
      m = index + splice.add - splice.removed.length;
      m  = m < 0? 0 : m;
    }
    if(m < len){
      for(var i = m; i < len; i++){
        var pair = group.get(i);
        pair.set('$index', i);
      }
    }
   
  });
  this.$on('digest', function(){
    group.children.forEach(function(section){
      section.$digest();
    })
  })

  return {
    generate: function(){
      return placeholder;
    },
    destroy: function(){
      group.destroy();
    }
  }
}


walkers.partial = function(ast){
  var content = ast.content, compiled;
  if(content){
    compiled = this.$compile(new Parser(content.get(this)).parse());
  }
  return {
    generate: function(){
      return compiled.generate();
    },
    destroy: function(){
      compiled.destroy();
    }
  }
}


walkers.if = function(ast){
  var test, consequent, alternate, node;
  var placeholder = document.createComment("termin list");
  var self = this;
  this.$watch(ast.test, function(nvalue){
    if(!!nvalue){ //true
      consequent = self.$compile( ast.consequent )
      node = consequent.generate(); //return group
      if(alternate){ alternate.destroy() };
      // @TODO
      placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
    }else{ //false
      if(consequent){ consequent.destroy() }
      if(ast.alternate) alternate = self.$compile(ast.alternate);
      node = alternate.generate();
      placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
    }
    self.$digest();
  });

  return {
    generate: function(){
      return placeholder;
    },
    destroy: function destroy(){
      if(alternate) alternate.destroy();
      if(consequent) consequent.destroy();
    }
  }

}


walkers.expression = function(ast){
  var node = document.createTextNode("");
  var watchid = this.$watch(ast, function(newval){
    dom.text(node, "" + (newval||""));
  })
  return {
    generate: function(){
      return node;
    },
    destroy: function(){

    }
  }
}

walkers.element = function(ast){
  var attrs = ast.attrs;
  var Component = Termin.component(ast.tag) 
  if(Component ){
    var component = new Component({});
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      if(value.type === 'expression'){
        this.$watch(value,function(nvalue){
          component.set(attr.name, nvalue);
        });
      }else{
        component.set(attr.name, value);
      }
    }
    return component;
  }
  var element = dom.create(ast.tag);
  var children = ast.children;
  var child;
  var group = new Group;
  // @TODO must mark the attr bind;
  var directive = [];
  for(var i = 0, len = attrs.length; i < len; i++){
    bindAttrWatcher.call(this, element, attrs[i])
  }
  if(children){
    var group = group;
    for(var i =0, len = children.length; i < len ;i++){
      child = this.$compile(children[i]);
      if(child !== null) group.push(child);
    }
  }
  return {
    generate: function(){
      if(group) element.appendChild(group.generate());
      return element;
    },
    destroy: function(){
      if(group) group.destroy();
      dom.remove(element)
    }
  }
}

// dada
walkers.string = function(){}


function bindAttrWatcher(element, attr){
  var name = attr.name,
    value = attr.value || "", decorator=Termin.decorate(name);
  if(decorator){
    decorator.call(this, element, value);
  }else{
    if(value.type == 'expression' ){
      this.$watch(value, function(nvalue){
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
    if(!value) return;
    var self = this;
    dom.on(elem, item, function(){
      value.get(self);
      self.$digest();
    });
    
  })
});


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
    if(!scope.$phase) scope.$digest();
  }
  v._$addEvent(elem, 'change', handler)
}

function initText(elem, parsed){
  var inProgress = false;
  var self = this;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    elem.value = newValue == null? "": "" + newValue;
  });

  var handler = _.throttle(function handler(ev){
    var value = this.value;
    parsed.set(self, value);
    inProgress= true;
    self.$digest();
    inProgress = false;
  })

  if(dom.msie !== 9 && 'oninput' in dom.tNode ){
    elem.addEventListener('input', handler );
  }else{
    dom.on(elem, 'paste', handler)
    dom.on(elem, 'keyup', handler)
    dom.on(elem, 'cut', handler)
  }
}

Termin.decorate('t-model', function(elem,value){
  var sign = elem.tagName.toLowerCase();
  if(typeof value === 'string') value = Termin.parse(value);

  switch(sign){
    case "select":
      initSelect.call(this, elem, value);
      break;
    default:
      initText.call(this,elem, value);
  }
}).decorate('proxy', function(elem, value){
});


var Modal = Termin.derive({

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

_.varName = 'd_'+_.uid();
_.setName = 'p_'+_.uid();

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


_._path = function(base, path){
  return base ==undefined? base: base[path];
}


_.throttle = function throttle(func, wait){
    var wait = wait || 100;
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function() {
      previous = +new Date;
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = + new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

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

  if(name === 'class') node.className = value;
  else node.setAttribute(name, value);
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

dom.replace = function(node, replaced){
  if(replaced.parentNode) replaced.parentNode.replaceChild(node, replaced);
}

dom.remove = function(node){
  if(node.parentNode) node.parentNode.removeChild(node);
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
require.register("terminator/src/group.js", function(exports, require, module){
var _ = require('./util');
var dom = require('./dom');

function Group(list){
  this.children = list || [];
}

_.extend(Group.prototype, {
  destroy: function(){

    var children = this.children, child;

    for(var i = 0, len = children.length; i < len; i++){
      child = children[i];
      if(typeof child.destroy === 'function'){ // destroy interface

        child.destroy();

      }else if(child.nodeType == 3){ // textnode

        dom.remove(child);

      }else{// TODO 
      }
    }
    this.children = null;
  },
  generate: function(){
    var children = this.children, child, node, 
      fragment = dom.fragment();

    for(var i = 0, len = children.length; i < len; i++){

      var node = null;
      child = children[i];
      if(child.generate) node = child.generate();
      else if(typeof child.nodeType == 'number') node = child;
      if(node) fragment.appendChild(node);

    }
    return fragment;
  },
  get: function(index){
    if(index < 0) index = this.children.length + index;
    return this.children[index];
  },
  first: function(){
    
  },
  splice: function(){

  },
  push: function(item){
    this.children.push( item );
  }
})



module.exports = Group;



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
  if(this.opts.state) this.states.push(this.opts.state);
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
  JST_PART_OPEN: ['{BEGIN}~', function(all, name){
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
  JST_PUNCHOR: [/[=!]?==|[-=><+*\/%\!]?\=|\|\||&&|[\<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!]/, function(all){
    return { type: all, value: all }
  },'JST'],

  JST_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
    return {type: 'STRING', value: one || two}
  }, 'JST'],
  JST_NUMBER: [/-?(?:[0-9]*\.[0-9]+|[0-9]+)(e\d+)?/, function(all){
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
require.register("terminator/src/helper/event.js", function(exports, require, module){
// simplest event emitter 60 lines
// ===============================
var slice = [].slice, _ = require('../util.js');
var API = {
    $on: function(event, fn) {
        if(typeof event === 'object'){
            for (var i in event) {
                this.$on(i, event[i]);
            }
        }else{
            var handles = this._handles || (this._handles = {}),
                calls = handles[event] || (handles[event] = []);
            calls.push(fn);
        }
        return this;
    },
    $off: function(event, fn) {
        if(event) this._handles = [];
        if(!this._handles) return;
        var handles = this._handles,
            calls;

        if (calls = handles[event]) {
            if (!fn) {
                handles[event] = [];
                return this;
            }
            for (var i = 0, len = calls.length; i < len; i++) {
                if (fn === calls[i]) {
                    calls.splice(i, 1);
                    return this;
                }
            }
        }
        return this;
    },
    $trigger: function(event){
        var args = slice.call(arguments, 1),
            handles = this._handles,
            calls;
        if (!handles || !(calls = handles[event])) return this;
        for (var i = 0, len = calls.length; i < len; i++) {
            calls[i].apply(this, args)
        }
        return this;
    }
}
// container class
function Event(handles) {
    if (arguments.length) this.$on.apply(this, arguments);
};
_.extend(Event.prototype, API)

Event.mixTo = function(obj){
    obj = typeof obj == "function" ? obj.prototype : obj;
    _.extend(obj, API)
}
module.exports = Event;
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
  partial: function(template){
    return {
      type: 'partial',
      content: template
    }
  }
  // filter: function(object, filters){
  //   return {
  //     type: 'filter',
  //     object: object,
  //     filters: filters
  //   }
  // },
  // //coi
  // // expression
  // condition: function(test, consequent, alternate){
  //   return {
  //     type: 'condition',
  //     test: test,
  //     consequent: consequent,
  //     alternate: alternate
  //   }

  // },
  // logic: function(op, left, right){
  //   return {
  //     type: 'logic',
  //     op: op,
  //     left: left,
  //     right: right
  //   }
  // },
  // binary: function(op, left, right){
  //   return {
  //     type: 'binary',
  //     op: op,
  //     left: left,
  //     right: right
  //   }
  // },

  // unary: function(op, arg){
  //   return {
  //     type: 'logic',
  //     op: op,
  //     arg: arg
  //   }
  // },
  // call: function(callee, args){
  //   return {
  //     type: 'call',
  //     callee: callee,
  //     args: args
  //   }

  // },
  // member: function(obj, prop, isComputed){
  //   return {
  //     type: 'member',
  //     obj: obj,
  //     prop: prop,
  //     isComputed: isComputed
  //   }
  // }
}

});
require.register("terminator/src/parser/Parser.js", function(exports, require, module){
var _ = require("../util.js");
var node = require("./node.js");
var Lexer = require("./Lexer.js");
var varName = _.varName;
var ctxName = _.randomVar('c');
var isPath = _.makePredicate("STRING IDENT NUMBER");
var isKeyWord = _.makePredicate("true false undefined null this Array Date JSON Math NaN RegExp decodeURI decodeURIComponent encodeURI encodeURIComponent parseFloat parseInt");
var exports = {_path: _._path}


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

// dada
// dadad
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
    case 'PART_OPEN':
      return this.partial();
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

// stag     ::=    '<' Name (S attr)* S? '>'  
// attr    ::=     Name Eq attvalue
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
      var value = ll.value;
      if(value.type !== "expression" && ~value.indexOf('{{')){
        var parsed = new Parser(value, {mode:2}).parse();
        // @TODO deps;
        var get = function(self){
          var res= parsed.map(function(item){
            if(item && item.get) return item.get(self);
            else return item || "";
          }).join("");
          return res;
        }
        value = node.expression(get, null)
      }
      return value;
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
  var res = this.expression(true);
  this.match('END');
  return res;
}

op.partial = function(){
  this.next();
  var content = this.expression();
  this.match('END');
  return node.partial(content);
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


op.expression = function(){
  var expression = this.expr();
  if(!expression.depend) return expression.get;
  else return expression;
}

op.expr = function(filter){
  this.depend = [];
  var buffer = this.filter();
  var body = buffer.get || buffer;
  var prefix = this.depend.length? ("var "+varName+"="+ctxName+".data;" ): "";
  var get = new Function(ctxName, prefix + "try {return (" + body + ")}catch(e){return undefined}");


  if(buffer.set) var set =  new Function(ctxName, _.setName ,prefix +";try {return (" + buffer.set + ")}catch(e){}");

  if(!this.depend.length){
    // means no dependency
    return node.expression(get.call(exports))
  }else{
    return node.expression(get, set, this.depend)
  }
}


op.filter = function(){
  var left = this.assign();
  var ll = this.eat('|');
  var buffer, attr;
  if(ll){
    buffer = [
      ";(function(data){", 
          "var ", attr = _.attrName(), "=", this.condition(depend).get, ";"]
    do{

      buffer.push(attr + " = this.f[" + this.match('IDENT').value+ "](" + attr) ;
      if(this.eat(':')){
        buffer.push(", "+ this.arguments(depend, "|").join(",") + ");")
      }else{
        buffer.push(');');
      }

    }while(ll = this.eat('|'))
    buffer.push("return " + attr + "}");
    return this.getset(buffer.join(""));
  }
  return left;
}

op.assign = function(){
  var left = this.condition(), ll;
  if(ll = this.eat(['=', '+=', '-=', '*=', '/=', '%='])){
    if(!left.set) this.error('invalid lefthand expression in assignment expression');
    return this.getset('(' + left.get + ll.type  + this.condition().get + ')', left.set);
  }
  return left;
}

// or
// or ? assign : assign
op.condition = function(){

  var test = this.or();
  if(this.eat('?')){
    return this.getset([test.get + "?", 
      this.assign().get, 
      this.match(":").type, 
      this.assign().get].join(""));
  }

  return test;
}

// and
// and && or
op.or = function(){

  var left = this.and();

  if(this.eat('||')){
    return this.getset(left.get + '||' + this.or().get);
  }

  return left;
}
// equal
// equal && and
op.and = function(){

  var left = this.equal();

  if(this.eat('&&')){
    return this.getset(left.get + '&&' + this.and().get);
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
    return this.getset(left.get + ll.type + this.equal().get);
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
    return this.getset(left.get + ll.value + this.relation().get);
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
    return this.getset(left.get + ll.value + this.additive().get);
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
    return this.getset(left.get + ll.type + this.multive().get);
  }
  return left;
}
// lefthand
// + unary
// - unary
// ~ unary
// ! unary
op.unary = function(){
  var ll;
  if(ll = this.eat(['+','-','~', '!'])){
    return this.getset('(' + ll.type + this.unary().get + ')') ;
  }else{
    return this.member()
  }
}

// call[lefthand] :
// member args
// member [ expression ]
// member . ident  

op.member = function(base, last, pathes){
  // @TODO depend must determin in this step
  var ll, path, value;
  var first = !base;

  if(!base){ //first
    path = this.primary();
    var type = typeof path;
    if(type === 'string'){ // no keyword ident
      pathes = [];
      if(path === '$self'){ // $self.1
        pathes.push('*');
        base = varName;
      }else{ // keypath **
        pathes.push(path);
        last = path;
        base = varName + "['" + path + "']";
      }
    }else{ //Primative Type
      if(path.get === 'this'){
        base = ctxName;
        pathes = ['this'];
      }else{
        pathes = null;
        base = path.get;
      }
      
    }
  }else{ // not first enter
    if(typeof last === 'string' && isPath( last) ){ // is valid path
      pathes.push(last);
    }else{
      if(pathes && pathes.length) this.depend.push(pathes);
      pathes = null;
    }
  }
  if(ll = this.eat(['[', '.', '('])){
    switch(ll.type){
      case '.':
          // member(object, property, computed)
        var tmpName = this.match('IDENT').value;
          base += "['" + tmpName + "']";
        return this.member( base, value, pathes );
      case '[':
          // member(object, property, computed)
        path = this.expr();
        base += "['" + path.get + "']";
        this.match(']')
        return this.member(base, path, pathes);
      case '(':
        // call(callee, args)
        var args = this.arguments();
        base = base + ("(" + args.join(",") + ")");
        this.match(')')
        return this.member(base, null, pathes);
    }
  }
  if(pathes && pathes.length) this.depend.push(pathes);
  var res =  {get: base};
  if(last) res.set = base + '=' + _.setName;
  return res;
}

/**
 * 
 */
op.arguments = function(end){
  end = end || ')'
  var args = [], ll;
  do{
    if(this.la() !== end){
      args.push(this.assign().get)
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
    case 'STRING':
      this.next();
      return this.getset("'" + ll.value + "'")
    case 'NUMBER':
      this.next();
      return this.getset(ll.value);
    case "IDENT":
      this.next();
      if(isKeyWord(ll.value)){
        return this.getset( ll.value );
      }
      return ll.value;
    default: 
      this.error('Unexpected Token: ' + ll.type);
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
      code.push("'" + ll.value + "'" + this.match(':').type);
      code.push(this.condition().get);
      if(this.eat(",")) code.push(",");
    }else{
      code.push(this.match('}').type);
      break;
    }
  }
  return {get: code.join("")}
}

// array
// [ assign[,assign]*]
op.array = function(){
  var code = [this.match('[').type]
  while(item = this.condition()){
    code.push(item.get);
    if(this.eat(',')) this.push(",");
  }
  code.push(this.match(']').type);
  return {get: code.join("")};
}

// '(' expression ')'
op.paren = function(){
  this.match('(');
  var res = this.filter()
  res.get = '(' + res.get + ')';
  this.match(')');
  return res;
}

op.getset = function(get, set){
  return {
    get: get,
    set: set
  }
}

op.flatenDepend = function(depend){
  for(var i = 0, len = depend.length; i < len; i++){

  }
}



module.exports = Parser;

});
require.alias("terminator/src/common.js", "terminator/index.js");
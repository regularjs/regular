/**
@author	leeluolee
@version	0.0.1
@homepage	http://leeluolee.github.io/regular
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
require.register("regularjs/src/Regular.js", function(exports, require, module){
var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");
var node = require("./parser/node.js");
var dom = require("./dom.js");
var Group = require('./group.js');
var _ = require('./util');
var Event = require('./helper/event.js');
var combine = require('./helper/combine.js');





var Regular = function(template, data){
  var type = _.typeOf(template);
  if(type === 'object'){
    data = template;
    template = null;
  }
  if(template){
    if(type === "string"){
      template = Regular.getTemplate(template);
      template = new Parser(template).parse();
    }
    this.template = template;
  }
  this.data= data || {};
  this.$watchers = [];
  this.context = this.context || this;
  this.group = this.$compile(this.template);
  this.element = combine.node(this);
  this.$digest()
  if(this.init) this.init.apply(this, arguments);
}






// description
// -------------------------

// 1. Regular and derived Class use same filter
_.extend(Regular, {
  // private data stuff
  _directors: {},
  _components: {},
  _filters: {},
  _customers: {},
  _exprCache:{},

  __after__: function(supr, o) {

    var template;
    this.__after__ = supr.__after__;

    this._directors = _.createObject( supr._directors )

    if(o.name) Regular.component(o.name, this);
    if(template = o.template){
      template = Regular.getTemplate(template);
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
  directive: function(name, cfg){
    var directors = this._directors;
    if(cfg == null) return directors[name];
    directors[name] = cfg;
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
  },
  Parser: Parser,
  Lexer: Lexer
});


Event.mixTo(Regular)
_.extend( Regular.prototype, {
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
  set: function(path, value){
    if(typeof path === 'function' ){
      path.call(this, this.data);
    }else{
      var base = this.data;
      var path = Regular.parse(path);
      path.set(this, value);
    }
    this.$digest(path);
  },
  _path: _._path,
  $digest: function(path){
    var watchers = this.$watchers;
    if(this.$phase === 'digest' || !this.$watchers)  return;

    this.$phase = 'digest';
    var dirty = false;
    this.$trigger('digest');

    for(var i = 0, len = watchers.length;i<len; i++){
      var watcher = watchers[i];
      if(!watcher) continue;
      var now = watcher.get(this);
      // if(now && now.length )debugger
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
    this.$trigger('destroy');
    this.group.destroy();
    this.$watchers = null;
  },
  $watch: function(expr, fn){
    var uid = _.uid('w_');
    var expr = Regular.parse(expr);
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
    var fragment = this.element || combine.node(this);
    if(typeof node === 'string') node = document.getElementById(node);
    switch(position){
      case 'bottom':
        node.appendChild(fragment)
        break;
      case 'top':
        if(firstChild = node.firstChild){
          node.insertBefore(fragment, node.firstChild)
        }else{
          node.appendChild(fragment);
        }
        break;
      case 'after':
        if(next = node.nextSibling){
          next.parentNode.insertBefore(fragment, next);
        }else{
          next.parentNode.appendChild(fragment);
        }
        break;
      case 'before':
        node.parentNode.insertBefore(fragment, node);
    }
  }
});



var walkers = {};


walkers.list = function(ast){
  var placeholder = document.createComment("Regular list");
  var Section =  Regular.derive({
    template: ast.body,
    context: this
  });
  var self = this;
  var group = new Group();
  // group.push(placeholder);

  function update(newValue, splices){
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
        sect.data.$index = k;
      }
      for(var j = 0,jlen = splice.removed.length; j< jlen; j++){ //removed
        var removed = group.children.splice( index, 1)[0];
        // var removed = group.children.splice(j,1)[0];
        removed.destroy();
        removed = null;
      }

      for(var o=index; o < index + splice.add; o++){ //add
        // prototype inherit
        var item = newValue[o];
        var data = _.createObject(self.data);
        data.$index = o;
        data[ast.variable] = item;
        var section = new Section(data);

        section.$on('digest', function(){
          self.$digest();
        });

        var insert = group.children.length && o !== 0? combine.last(group) : placeholder;
        placeholder.parentNode.insertBefore(combine.node(section), insert.nextSibling);
        group.children.splice(o , 0, section);
      }
      m = index + splice.add - splice.removed.length;
      m  = m < 0? 0 : m;
    }
    if(m < len){
      for(var i = m; i < len; i++){
        var pair = group.get(i);
        pair.data.$index = i;
      }
    }
   
  }

  if(ast.sequence && ast.sequence.type === 'expression'){
    var watchid = this.$watch(ast.sequence, update);
  }else{
    update(ast.sequence , _.equals( ast.sequence, []));
  }
  function notifyChild(){
    group.children.forEach(function(section){
      section.$digest();
    })
  }
  this.$on('digest', notifyChild)

  return {
    node: function(){
      return placeholder;
    },
    group: group,
    destroy: function(){
      group.destroy();
      if(watchid) self.$unwatch(watchid);
      self.$off('digest', notifyChild);
      self = null;
    }
  }
}



walkers.partial = function(ast){
  var content = ast.content, compiled;
  var placeholder = document.createComment('haha');
  var compiled;
  if(content){
    var self = this;
    this.$watch(content, function(value){
      if(compiled) compiled.destroy();
      compiled = self.$compile(new Parser(value).parse()); 
      node = combine.node(compiled);
      placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
    });
  }
  return {
    node: function(){
      return placeholder;
    },
    last: function(){
      return compiled.last();
    },
    destroy: function(){
      compiled && compiled.destroy();
    }
  }
};


walkers['if'] = function(ast){
  var test, consequent, alternate, node;
  var placeholder = document.createComment("Regular if");
  var self = this;
  this.$watch(ast.test, function(nvalue){
    if(!!nvalue){ //true
      consequent = self.$compile( ast.consequent )
      node = combine.node(consequent); //return group
      if(alternate){ alternate.destroy() };
      alternate = null;
      // @TODO
      placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
    }else{ //false
      if(consequent){ consequent.destroy(); }
      consequent = null;
      if(ast.alternate) alternate = self.$compile(ast.alternate);
      node = combine.node(alternate);
      placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
    }
    self.$digest();
  });

  return {
    node: function(){
      return placeholder;
    },
    last: function(){
      var group = consequent || alternate;
      return group && group.last();
    },
    destroy: function destroy(){
      if(alternate) alternate.destroy();
      if(consequent) consequent.destroy();
    }
  }
}


walkers.expression = function(ast){
  var self = this;
  var node = document.createTextNode("");
  var watchid = this.$watch(ast, function(newval){
    dom.text(node, "" + (newval||""));
  })
  return {
    node: function(){
      return node;
    },
    destroy: function(){
      self.$unwatch(watchid)
    }
  }
}



walkers.element = function(ast){
  var attrs = ast.attrs;
  var Component = Regular.component(ast.tag) 
  var watchids = [];
  if(Component ){
    var component = new Component({});
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      if(value.type === 'expression'){
        watchids.push(this.$watch(value, component.set.bind(component,attr.name)));
      }else{
        component.set(attr.name, value);
      }
    }
    return component;
  }
  var element = dom.create(ast.tag);
  var children = ast.children;
  var child;
  var self = this;
  // @TODO must mark the attr bind;
  var directive = [];
  for(var i = 0, len = attrs.length; i < len; i++){
    watchids.push.apply(watchids,bindAttrWatcher.call(this, element, attrs[i]))
  }
  if(children && children.length){
    var group = new Group;
    for(var i =0, len = children.length; i < len ;i++){
      child = this.$compile(children[i]);
      if(child !== null) group.push(child);
    }
  }
  return {
    node: function(){
      if(group && !_.isVoidTag(ast.tag)) element.appendChild(combine.node(group));
      return element;
    },
    last: function(){
      return element;
    },
    destroy: function(){
      if(group) group.destroy();
      for(var i = 0,len = watchids.length; i< len ;i++){
        self.$unwatch(watchids[i]);
      }
      dom.remove(element)
    }
  }
}

// dada


function bindAttrWatcher(element, attr){
  var name = attr.name,
    value = attr.value || "", decorator=Regular.directive(name);
  var watchids = [];
  if(decorator){
    decorator.call(this, element, value);
  }else{
    if(value.type == 'expression' ){
      watchids.push(this.$watch(value, function(nvalue){
        dom.attr(element, name, nvalue);
      }))
    }else{
      dom.attr(element, name, value);
    }
  }
  return watchids;
}









module.exports = Regular;

});
require.register("regularjs/src/util.js", function(exports, require, module){
require('./helper/shim.js');
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


var ignoredRef = /\(\?\!|\(\?\:|\?\=/g;
_.findSubCapture = function (regStr) {
  var left = 0,
    right = 0,
    len = regStr.length,
    ignored = regStr.match(ignoredRef); //忽略非捕获匹配
  if(ignored) ignored = ignored.length
  else ignored = 0;
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

// hogan escape
// ==============
_.escape = (function(){
  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos = /\'/g,
      rQuot = /\"/g,
      hChars = /[&<>\"\']/;

  return function(str) {
    return hChars.test(str) ?
      str
        .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }
})();


//http://www.w3.org/html/wg/drafts/html/master/single-page.html#void-elements
_.isVoidTag = _.makePredicate("area base br col embed hr img input keygen link menuitem meta param source track wbr");


});
require.register("regularjs/src/env.js", function(exports, require, module){
// some fixture test;
// ---------------
exports.svg = (function(){
  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
})();


exports.transition = (function(){
  
})();


});
require.register("regularjs/src/index.js", function(exports, require, module){
module.exports = require('./Regular.js');
require('./directive/base.js')


});
require.register("regularjs/src/dom.js", function(exports, require, module){

// thanks for angular && mootools for some concise&cross-platform  implemention
// =====================================

// The MIT License
// Copyright (c) 2010-2014 Google, Inc. http://angularjs.org

// ---
// license: MIT-style license. http://mootools.net
// requires: [Window, Document, Array, String, Function, Object, Number, Slick.Parser, Slick.Finder]

var dom = module.exports;
var env = require("./env.js");
var _ = require("./util");
var tNode = document.createElement('div')
var addEvent, removeEvent, isFixEvent;

dom.tNode = tNode;

if(tNode.addEventListener){
  addEvent = function(node, type, fn) {
    node.addEventListener(type, fn, false);
  }
  removeEvent = function(node, type, fn) {
    node.removeEventListener(type, fn, false) 
  }
}else{
  addEvent = function(node, type, fn) {
    node.attachEvent('on' + type, fn);
  }
  removeEvent = function(node, type, fn) {
    node.detachEvent('on' + type, fn); 
  }
}


dom.msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
if (isNaN(dom.msie)) {
  dom.msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
}

//http://stackoverflow.com/questions/11068196/ie8-ie7-onchange-event-is-triggered-only-after-repeated-selection
function fixEventName(elem, name){
  return (name == 'change'  &&  dom.msie < 9 && 
      (elem && elem.tagName && elem.tagName.toLowerCase()==='input' && 
        (elem.type === 'checkbox' || elem.type === 'radio')
      )
    )? 'click': name;
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

var BOOLEAN_ATTR = {};
'multiple,selected,checked,disabled,readOnly,required,open'.split(',').forEach(function(value) {
  BOOLEAN_ATTR[value] = value;
});

// attribute Setter & Getter
dom.attr = function(node, name, value){
  name = name.toLowerCase();
  if (BOOLEAN_ATTR[name]) {
    if (typeof value !== 'undefined') {
      if (!!value) {
        node[name] = true;
        node.setAttribute(name, name);
      } else {
        node[name] = false;
        node.removeAttribute(name);
      }
    } else {
      return (node[name] ||
               (node.attributes.getNamedItem(name)|| noop).specified)
             ? name
             : undefined;
    }
  } else if (typeof (value) !== 'undefined') {
    if(name === 'class') node.className = value;
    else node.setAttribute(name, value);
  } else if (node.getAttribute) {
    // the extra argument "2" is to get the right thing for a.href in IE, see jQuery code
    // some elements (e.g. Document) don't have get attribute, so return undefined
    var ret = node.getAttribute(name, 2);
    // normalize non-existing attributes to undefined (as jQuery)
    return ret === null ? undefined : ret;
  }
}

// @TODO: event fixed,  context proxy , etc...
var handlers = {};

dom.on = function(node, type, handler){
  type = fixEventName(node, type);
  if("attachEvent" in node) handler.real = handler.bind(node);
  addEvent.call(dom, node, type, handler.real || handler);
}
dom.off = function(node, type, handler){
  type = fixEventName(node, type);
  if("detachEvent" in node) handler = handler.real;
  removeEvent.call(dom, node, type, handler);
}


dom.text = (function (){
  var map = {};
  if (dom.msie && dom.msie < 9) {
    map[1] = 'innerText';    
    map[3] = 'nodeValue';    
  } else {
    map[1] = map[3] = 'textContent';
  }
  
  return function (node, value) {
    var textProp = map[node.nodeType];
    if (value == null) {
      return textProp ? node[textProp] : '';
    }
    node[textProp] = value;
  }
})();


dom.html = function(html){
  if(typeof html === "undefined"){
    return node.innerHTML;
  }else{
    node.innerHTML = html;
  }
}

dom.replace = function(node, replaced){
  if(replaced.parentNode) replaced.parentNode.replaceChild(node, replaced);
}

dom.remove = function(node){
  if(node.parentNode) node.parentNode.removeChild(node);
}

// css Settle & Getter from angular
// =================================
dom.css = function(node, name, value){
  if (typeof value === "undefined") {
    node.style[name] = value;
  } else {
    var val;
    if (dom.msie <= 8) {
      // this is some IE specific weirdness that jQuery 1.6.4 does not sure why
      val = node.currentStyle && node.currentStyle[name];
      if (val === '') val = 'auto';
    }
    val = val || node.style[name];
    if (dom.msie <= 8) {
      val = val === '' ? undefined : val;
    }
    return  val;
  }
}

dom.addClass = function(node, className){
  var current = node.className || "";
  if ((" " + current + " ").indexOf(" " + className + " ") === -1) {
    node.className = current + " " + className;
  }
}

dom.delClass = function(node, className){
  var current = node.className || "";
  node.className = (" " + current + " ").replace(" " + className + " ", " ").trim();
}

dom.hasClass = function(node, className){
  var current = node.className || "";
  return (" " + current + " ").indexOf(" " + className + " ") !== -1;
}


});
require.register("regularjs/src/group.js", function(exports, require, module){
var _ = require('./util');
var dom = require('./dom');

function Group(list){
  this.children = list || [];
}


_.extend(Group.prototype, {
  destroy: function(){
    var children = this.children, child;
    if(!this.children) return;
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
  get: function(i){
    return this.children[i]
  },
  push: function(item){
    this.children.push( item );
  }
})



module.exports = Group;



});
require.register("regularjs/src/parser/Lexer.js", function(exports, require, module){
var _ = require('../util.js');

var test = /a|(b)/.exec('a');
var testSubCapure = test && test[1] === undefined? 
  function(str){ return str !== undefined }
  :function(str){return !!str};

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


lo.lex = function(str){
  str = (str||this.input).trim();
  var tokens = [], remain = this.input = str, 
    TRUNK, split, test,mlen, token, state;
  // 初始化
  this.index=0;
  var i = 0;
  while(str){
    i++
    state = this.state();
    split = this.map[state] 
    test = split.TRUNK.exec(str);
    if(!test){
      this.error('Unrecoginized Token');
    }
    mlen = test[0].length;
    str = str.slice(mlen)
    token = this._process.call(this, test, split, str)
    if(token) tokens.push(token)
    this.index += mlen;
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

lo._process = function(args, split,str){
  // console.log(args.join(","), this.state())
  var links = split.links,marched = false;

  for(var len = links.length, i=0;i<len ;i++){
    var link = links[i],
      handler = link[2],
      index = link[0];
    // if(args[6] === '>' && index === 6) console.log('haha')
    if(testSubCapure(args[index])) {
      marched = true;
      if(handler){
        var token = handler.apply(this, args.slice(index, index + link[1]))
        if(token)  token.pos = this.index;
      }
      break;
    }
  }
  if(!marched){ // in ie lt8 . sub capture is "" but ont 
    switch(str.charAt(0)){
      case "<":
        this.enter("TAG");
        break;
      default:
        this.enter("JST");
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
  var split, rules, trunks, handler, reg, retain, rule;

  for(var i in map){

    split = map[i];
    split.curIndex = 1;
    rules = split.rules;
    trunks = [];

    for(var j = 0,len = rules.length; j<len; j++){
      rule = rules[j]; 
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
    return {type: 'TAG_OPEN', value: one.toLowerCase() }
  }, 'TAG'],
  TAG_CLOSE: [/<\/({NAME})[\r\n\f ]*>[\r\n\f ]*/, function(all, one){
    this.leave();
    return {type: 'TAG_CLOSE', value: one }
  }, 'TAG'],

    // mode2's JST ENTER RULE
  TAG_ENTER_JST: [/(?={BEGIN})/, function(all,one){
    this.enter('JST');
  }, 'TAG'],


  TAG_PUNCHOR: [/[\>\/=]/, function(all){
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
  JST_PUNCHOR: [/[=!]?==|[-=><+*\/%\!]?\=|\|\||&&|[\<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!,]/, function(all){
    return { type: all, value: all }
  },'JST'],

  JST_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
    return {type: 'STRING', value: one == null? two: one}
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
require.register("regularjs/src/parser/node.js", function(exports, require, module){
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
  "if": function(test, consequent, alternate){
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
}

});
require.register("regularjs/src/parser/config.js", function(exports, require, module){
var _ = require('../util');
var config =  module.exports ={
}
});
require.register("regularjs/src/parser/Parser.js", function(exports, require, module){
var _ = require("../util.js");
var node = require("./node.js");
var Lexer = require("./Lexer.js");
var varName = _.varName;
var ctxName = _.randomVar('c');
var isPath = _.makePredicate("STRING IDENT NUMBER");
var isKeyWord = _.makePredicate("true false undefined null this Array Date JSON Math NaN RegExp decodeURI decodeURIComponent encodeURI encodeURIComponent parseFloat parseInt Object");
var exports = {_path: _._path}


function Parser(input, opts){
  opts = opts || {};
  this.input = input;
  this.tokens = new Lexer(input, opts).lex();
  this.pos = 0;
  this.length = this.tokens.length;
}

var op = Parser.prototype;


op.parse = function(str){
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
  console.log(this.ll())
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
  if( !selfClosed && !_.isVoidTag(name) ){
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

op["if"] = function(){
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
          alternate.push(this["if"]())
          return node['if'](test, consequent, alternate)
        default:
          container.push(this.statement())
      }
    }else{
      container.push(this.statement());
    }
  }
  // if statement not matched
  if(close.value !== "if") this.error('Unmatched if directive')
  return node["if"](test, consequent, alternate);
}


// @mark   mustache syntax have natrure failutre, canot with expression
op.list = function(){
  this.next();
  // sequence can be a list or hash
  var sequence = this.expression(), variable, body, ll;
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
  return node.list(sequence, variable, consequent, alternate);
}


op.expression = function(){
  var expression = this.expr();
  if(!expression.depend) return expression.get;
  else return expression;
}

op.expr = function(filter){
  this.depend = [];
  var buffer = this.filter(), set, get;
  var body = buffer.get || buffer;
  // @TODO list 
  var prefix = this.depend.length? ("var "+ctxName+"=context.context||context;var "+varName+"=context.data;" ): "";
  var get = new Function("context", prefix + "return (" + body + ")");


  if(buffer.set) var set =  new Function("context", _.setName ,
    prefix +";return (" + buffer.set + ")" 
    );

  if(!this.depend.length){
    // means no dependency
    return node.expression(get.call(exports))
  }else{
    return node.expression(get, set, this.depend)
  }
  return {}
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
  // @TODO depend must deregular in this step
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
        return this.member( base, tmpName, pathes );
      case '[':
          // member(object, property, computed)
        path = this.assign();
        if(pathes && pathes.length){
          base = ctxName + "._path("+base+", "+ path.get + ")";
        }else{
          base += "['" + path.get + "']";
        }        
        this.match(']')
        return this.member(base, path, pathes);
      case '(':
        // call(callee, args)
        var args = this.arguments().join(',');
        base = "(typeof ("+ base + ") !=='function'?" + base+"(" + args +"):" + base + (".call(" + ctxName + (args? "," + args : "")  + "))");
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
  while(true){
    ll = this.eat(['STRING', 'IDENT', 'NUMBER']);
    if(ll){
      code.push("'" + ll.value + "'" + this.match(':').type);
      code.push(this.assign().get);
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
  var code = [this.match('[').type], item;
  while(item = this.assign()){
    code.push(item.get);
    if(this.eat(',')) code.push(",");
    else break;
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

//
op.flatenDepend = function(depend){
  for(var i = 0, len = depend.length; i < len; i++){

  }
}



module.exports = Parser;

});
require.register("regularjs/src/helper/shim.js", function(exports, require, module){
// shim for lt ie9
var slice = [].slice;

function extend(o1, o2 ){
  for(var i in o2){
    if( typeof o1[i] === "undefined"){
      o1[i] = o2[i]
    }
  }
}

// String;
extend(String.prototype, {
  trim: function(){
    return this.replace(/^\s+|\s+$/g, '');
  }
});


// Array;
extend(Array.prototype, {
  indexOf: function(obj, from){
    from = from || 0;
    for (var i = from, len = this.length; i < len; i++) {
      if (this[i] === obj) return i;
    }
    return -1;
  },
  forEach: function(callback, context){
    for (var i = 0, len = this.length; i < len; i++) {
      callback.call(context, this[i], i, this);
    }
  },
  filter: function(callback, context){
    var res = [];
    for (var i = 0, length = this.length; i < length; i++) {
      var pass = callback.call(context, this[i], i, this);
      if(pass) res.push(this[i]);
    }
    return res;
  },
  map: function(callback, context){
    var res = [];
    for (var i = 0, length = this.length; i < length; i++) {
      res.push(callback.call(context, this[i], i, this));
    }
    return res;
  }
});



// Function;
extend(Function.prototype, {
  bind: function(context, arg){
    var fn = this;
    var preArgs = slice.call(arguments, 1);
    return function(){
      var args = preArgs.concat(slice.call(arguments));
      return fn.apply(context, args);
    }
  }
})


// Object
extend(Object, {
  keys: function(){
    var keys = [];
    for(var i in obj) if(obj.hasOwnProperty(i)){
      keys.push(i);
    }
    return keys;
  } 
})


// Date
extend(Date, {
  now: function(){
    return +new Date;
  }
})


});
require.register("regularjs/src/helper/event.js", function(exports, require, module){
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
require.register("regularjs/src/helper/combine.js", function(exports, require, module){
// some nested  operation in ast 
// --------------------------------

var dom = require('../dom.js');

var combine = module.exports = {
  // get the initial dom in object
  node: function(item){
    var children;
    if(typeof item.node === 'function') return item.node();
    if(typeof item.nodeType === 'number') return item;
    if(item.group) return combine.node(item.group)
    if(children = item.children){
      var fragment = dom.fragment();
      for(var i = 0, len = children.length; i < len; i++ ){
        fragment.appendChild(combine.node(children[i]))
      }
      return fragment;
    }
  },
  // get the last dom in object(for insertion operation)
  last: function(item){
    var children = item.children;
    if(typeof item.last === 'function') return item.last();
    if(typeof item.nodeType === 'number') return item;
    if(children && children.length) return combine.last(children[children.length - 1])
    if(item.group) return combine.last(item.group);
  }
}
});
require.register("regularjs/src/directive/base.js", function(exports, require, module){
// Regular
var _ = require('../util.js');
var dom = require('../dom.js');
var Regular = require('../Regular.js');
var events = "click dblclick mouseover mouseout change focus blur keydown keyup keypress".split(" ");


events.forEach(function(item){
  Regular.directive('t-'+item, function(elem, value){
    if(!value) return;
    var self = this; 
    dom.on(elem, item, function(event){
      self.data.$event = event;
      value.get(self);
      self.$digest();
      self.data.$event = null;
    });
    
  })
});


Regular.directive('t-enter', function(elem, value){
  if(!value) return;
  var self = this;
  dom.on(elem, 'keypress', function(ev){
    if(ev.which == 13 || ev.keyCode == 13){
      value.get(self);
      self.$digest();
    }
  });
})


Regular.directive('t-model', function(elem,value){
  var sign = elem.tagName.toLowerCase();
  if(typeof value === 'string') value = Regular.parse(value);

  switch(sign){
    case "select":
      initSelect.call(this, elem, value);
      break;
    case "input":
      if(elem.type === 'checkbox'){
        initCheckBox.call(this, elem, value);
      }else{
        initText.call(this,elem, value);
      }
    default:
      initText.call(this,elem, value);
  }
}).directive('proxy', function(elem, value){
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
    if(inProgress){ return; }
    if(elem.value !== newValue) elem.value = newValue == null? "": "" + newValue;
  });

  // @TODO to fixed event
  var handler = function handler(ev){
    var value = (ev.srcElement || ev.target).value
    parsed.set(self, value);
    inProgress = true;
    self.$digest();
    inProgress = false;
  }

  if(dom.msie !== 9 && 'oninput' in dom.tNode ){
    elem.addEventListener('input', handler );
  }else{
    dom.on(elem, 'paste', handler)
    dom.on(elem, 'keypress', handler)
    dom.on(elem, 'cut', handler)
  }
}

function initCheckBox(elem, parsed){
  var inProgress = false;
  var self = this;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    elem.checked = !!newValue;
  });

  var handler = function handler(ev){
    var value = this.checked;
    parsed.set(self, value);
    inProgress= true;
    self.$digest();
    inProgress = false;
  }
  if(parsed.set) dom.on(elem, 'change', handler)

}

});
require.alias("regularjs/src/index.js", "regularjs/index.js");
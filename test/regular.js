/**
@author	leeluolee
@version	0.0.1
@homepage	http://regularjs.github.io
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
var extend = require('./helper/extend.js');
var Event = require('./helper/event.js');
var combine = require('./helper/combine.js');
var walkers = require('./walkers.js');
var idtest = /^[\w-]{1,20}$/;


var Regular = function(options){
  var node, template, name;

  options = options || {};
  _.extend(this, options, true);

  template = this.template;

  if(!this.data) this.data = {};
  if(typeof template === 'string' && template.length < 40 && (node = dom.find(template))) {
    template = node.innerHTML;
  }
  if(typeof template === 'string') this.template = new Parser(template).parse()
  this.$watchers = [];
  this.config && this.config(this.data);
  this.$root = this.$root || this;
  this.$context = this.$context || this;
  if(template){
    this.group = this.$compile(this.template);
    this.element = combine.node(this);
  }
  if(this.$root == this) this.$update();
  this.$emit({type: 'init', stop: true });
  if( this.init ) this.init(this.data);
  if(this.$root == this) this.$update();

  // children is not required;
}

// description
// -------------------------
// 1. Regular and derived Class use same filter
_.extend(Regular, {
  // private data stuff
  _directors: { __regexp__:[] },
  _components: {},
  _filters: {},
  _customers: {},
  _exprCache:{},

  __after__: function(supr, o) {

    var template;
    this.__after__ = supr.__after__;

    if(o.name) Regular.component(o.name, this);
    if(template = o.template){
      var node, name;
      if(typeof template === 'string' && template.length < 20 && (node= dom.find(template))){
        template = node.innerHTML;
        if(name = dom.attr(node, 'name')) Regular.component(name, this);
      }
      if(typeof template == 'string'){
        this.prototype.template = new Parser(template).parse();
      }
    }
  },
  extend: extend,
  /**
   * director's setter and getter
   * @param  {String|RegExp} name  
   * @param  {[type]} cfg  [description]
   * @return {[type]}      [description]
   */
  directive: function(name, cfg){
    var type = _.typeOf(name);
    var directors = this._directors, director;
    if(cfg == null){
      if( type === "string" && (director = directors[name]) ) return director;
      else{
        var regexp = directors.__regexp__;
        for(var i = 0, len = regexp.length; i < len ; i++){
          director = regexp[i];
          var test = director.regexp.test(name);
          if(test) return director;
        }
      }
      return;
    }
    if(typeof cfg === 'function') cfg = { link: cfg } 
    if(type === 'string') directors[name] = cfg;
    else if(type === 'regexp'){
      cfg.regexp = name;
      directors.__regexp__.push(cfg)
    }
  },
  filter: function(name, fn){
    var filters = this._filters;
    if(fn == null) return filters[name];
    filters[name] = fn;
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
  use: function(fn){
    fn(this, Regular);
  },
  Parser: Parser,
  Lexer: Lexer
});


Event.mixTo(Regular)
_.extend( Regular.prototype, {
  init: function(){},
  /**
   * compile a block ast ; return a group;
   * @param  {Array} parsed ast
   * @param  {[type]} record
   * @return {[type]}
   */
  $compile: function(ast, record){
    if(typeof ast === 'string'){
      ast = new Parser(ast).parse()
    }
    var records;
    if(record) this._record();
    var group = this._walk(ast);
    if(record){
      records = this._release();
      var self = this;
      if(records.length){
        // auto destroy all wather;
        group.ondestroy = function(){ self.$unwatch(records); }
      }
    }
    return group;
  },
  /**
   * **tips**: whatever param you passed in $update, after the function called, dirty-check(digest) phase will enter;
   * 
   * @param  {Function|String|Expression} path  
   * @param  {Whatever} value optional, when path is Function, the value is ignored
   * @return {this}     this 
   */
  $update: function(path, value){
    if(path != null){
      var type = _.typeOf(path);
      if( type === 'string' || path.type === 'expression' ){
        var base = this.data;
        var path = Regular.parse(path);
        path.set(this, value);
      }else if(type === 'function'){
        path.call(this, this.data);
      }else{
        for(var i in path) {
          if(path.hasOwnProperty(i)){
            this.data[i] = path[i];
          }
        }
      }
    }
    if(!this.$root) debugger
    ;(this.$root || this).$digest();
  },
  /**
   * create two-way binding with another component;
   * *warn*: 
   *   expr1 and expr2 must can operate set&get, for example: the 'a.b' or 'a[b + 1]' is set-able, but 'a.b + 1' is not, 
   *   beacuse Regular dont know how to inverse set through the expression;
   *   
   *   if before $bind, two component's state is not sync, the component(passed param) will sync with the called component;
   *
   * *example: *
   *
   * ```javascript
   * // in this example, we need to link two pager component
   * var pager = new Pager({}) // pager compoennt
   * var pager2 = new Pager({}) // another pager component
   * pager.$bind(pager2, 'current'); // two way bind throw two component
   * pager.$bind(pager2, 'total');   // 
   * // or just
   * pager.$bind(pager2, {"current": "current", "total": "total"}) 
   * ```
   * 
   * @param  {Regular} component the
   * @param  {String|Expression} expr1     required, self expr1 to operate binding
   * @param  {String|Expression} expr2     optional, other component's expr to bind with, if not passed, the expr2 will use the expr1;
   * @return          this;
   */
  $bind: function(component, expr1, expr2){
    var type = _.typeOf(expr1);
    if(expr1.type === 'expression' || type == 'string'){
      this._bind(component, expr1, expr2)
    }else if( type === "array" ){ // multiply same path binding through array
      for(var i = 0, len = expr1.length; i < len; i++){
        this._bind(component, expr1[i]);
      }
    }else if(type === "object"){
      for(var i in expr1) if(expr1.hasOwnProperty(i)){
        this._bind(component, i, expr1[i]);
      }
    }
    // digest
    component.$update();
    return this;
  },
  /**
   * unbind one component( see $bind also)
   *
   * unbind will unbind all relation between two component
   * 
   * @param  {Regular} component [description]
   * @return {This}    this
   */
  $unbind: function(component){
    // todo
  },

  /**
   * the whole digest loop ,just like angular, it just a dirty-check loop;
   * @param  {String} path  now regular process a pure dirty-check loop, but in parse phase, 
   *                  Regular's parser extract the dependencies, in future maybe it will change to dirty-check combine with path-aware update;
   * @return {Void}   
   */
  $digest: function(path){

    if(this.$phase === 'digest') return;
    this.$phase = 'digest';
    var dirty = false, n =0;
    while(dirty = this._digest(path)){
      n++
      if(n > 20){ // max loop
        throw 'there may a circular dependencies in this Component' 
      }
    }
    this.$phase = null;
  },
  // watch a expression(parsed or not) 
  $watch: function(expr, fn, options){
    options = options || {};
    if(options === true) options = {deep: true}
    var uid = _.uid('w_');
    if(Array.isArray(expr)){
      // @todo 只需要watch一次
      var tests = [];
      for(var i=0,len = expr.length; i < len; i++){
          tests.push(Regular.parse(expr[i]).get) 
      }
      var prev = [];
      var test = function(context){
        var equal = true;
        for(var i =0, len = tests.length; i < len; i++){
          var splice = tests[i](context);
          if(!_.equals(splice, prev[i])){
             equal = false;
             prev[i] = _.clone(splice);
          }
        }
        return equal? false: prev;
      }
    }else{
      var expr = Regular.parse(expr);
      var get = expr.get;
      var constant = expr.constant;
    }
    var watcher = { 
      id: uid, 
      get: get, 
      fn: fn, 
      constant: constant, 
      force: options.force,
      test: test,
      deep: options.deep
    };

    this.$watchers.push(watcher);
    this._records && this._records.push(watcher.id);
    return uid;
  },
  // unwatch a watcher
  $unwatch: function(uid){
    if(Array.isArray(uid)){
      for(var i =0, len = uid.length; i < len; i++){
        this.$unwatch(uid[i]);
      }
    }else{
      var watchers = this.$watchers, watcher, len;
      if(!uid || !watchers || !(len = watchers.length)) return;
      for(;len--;){
        watcher = watchers[len];
        if(watcher && watcher.id === uid ){
          watchers.splice(len, 1);
        }
      }
    }
  },
  // find a element have a refrence anchor(ref='1234') in template
  find: function(id){
    return this.$refs[id]; 
  },
  destroy: function(){
    // destroy event wont propgation;
    this.$emit({type: 'destroy', stop: true });
    this.group.destroy();
    this.element = null;
    this.$watchers = null;
    this.$off();
  },
  inject: function(node, position){
    position = position || 'bottom';
    var firstChild,lastChild, parentNode, next;
    var fragment = this.element || combine.node(this);
    if(typeof node === 'string') node = dom.find(node);
    if(!node) throw 'injected node is not found'
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
    return this;
  },
  // private bind logic
  _bind: function(component, expr1, expr2){

    var self = this;
    // basic binding
    if(!component || !(component instanceof Regular)) throw "$bind() should pass Regular component as first argument";
    if(!expr1) throw "$bind() should as least pass one expression to bind";
    expr1 = Regular.parse(expr1);

    if(!expr2) expr2 = expr1;
    else expr2 = Regular.parse(expr2);

    // set is need to operate setting ;
    if(expr2.set){
      var wid1 = this.$watch(expr1, function(value){
        component.$update(expr2, value)
      });
      component.$on('destroy', function(){
        self.$unwatch(wid1)
      })
    }
    if(expr1.set){
      var wid2 = component.$watch(expr2, function(value){
        self.$update(expr1, value)
      });
      // when brother destroy, we unlink this watcher
      this.$on('destroy', component.$unwatch.bind(component,wid2))
    }
    // sync the component's state to called's state
    expr2.set(component, expr1.get(this));
  },

  // private digest logic
  _digest: function(path){
    // if(this.context) return this.context.$digest();

    this.$emit('digest');
    var watchers = this.$watchers;

    if(!watchers || !watchers.length) return;
    var dirty = false;

    for(var i = 0, len = watchers.length;i<len; i++){
      var watcher = watchers[i];
      if(!watcher) continue;
      if(watcher.test) {
        var result = watcher.test(this);
        if(result){
          dirty = true;
          watcher.fn.apply(this,result)
        }
        continue;
      }
      var now = watcher.get(this);
      var last = watcher.last;
      // if(now && now.length )debugger
      var eq = true;
      if(_.typeOf(now) == 'object' && watcher.deep){
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
      if(eq === false || watcher.force){
        eq = false;
        watcher.force = null;

        watcher.fn.call(this, now, watcher.last);
        if(typeof now !== 'object'){
          watcher.last = _.clone(now);
        }else{
          watcher.last = now;
        }
      }else{
        if(_.typeOf(eq)=='array' && eq.length){
          watcher.fn.call(this, now, eq);
          watcher.last = _.clone(now);
        }else{
          eq = true;
        }
      }
      if(eq !== true) dirty = true;
      if(watcher.constant){
         watchers.splice(i, 1);
      }
    }

    if(dirty) this.$emit('update');
    return dirty;
  },
  _enter: function(context){
    this.context.push()
  },

  _leave: function(){

  },

  _record: function(){
    this._records = [];
  },
  _release: function(){
    var _records = this._records;
    this._records = null;
    return _records;
  },
  _walk: function(ast){
    if(_.typeOf(ast) === 'array'){
      var res = [];
      for(var i = 0, len = ast.length; i < len; i++){
        res.push(this._walk(ast[i]));
      }
      return new Group(res);
    }
    if(typeof ast === 'string') return document.createTextNode(ast)
    return walkers[ast.type || "default"].call(this, ast);
  },
  // find filter
  _f: function(name){
    var filter = Regular.filter(name);
    if(typeof filter !== 'function') throw 'filter ' + name + 'is undefined';
    return filter;
  },
  _r: _._range,
});

module.exports = Regular;

});
require.register("regularjs/src/util.js", function(exports, require, module){
require('./helper/shim.js');
var _  = module.exports;
var slice = [].slice;
var o2str = ({}).toString;

_.noop = function(){};
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
  var res = [];
  for(var i = start || 0, len = end || obj.length; i < len; i++){
    var item = obj[i];
    res.push(item)
  }
  return res;
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
        if (arr.length === 1) return f += "return str === '" + arr[0] + "';";
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
        f += "switch(str.length){";
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
    if(props) _.extend(res, props);
    return res;
}

_.createProto = function(fn, o){
    function foo() { this.constructor = fn;}
    foo.prototype = o;
    return (fn.prototype = new foo());
}



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
  var type = _.typeOf(now);
  if(type === 'array'){
    var splices = ld(now, old||[]);
    return splices;
  }
  if(type === 'number' && typeof old === 'number'&& isNaN(now) && isNaN(old)) return true
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
  return base == undefined? base: base[path];
}

_._range = function(start, end){
  if(typeof start !== 'number' || typeof end !== 'number'){
    return []
  }
  var res = [];
  for(var i = start; i <= end; i++){
    res.push(i);
  }
  return res;
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

_.cache = function(max){
  max = max || 1000;
  var keys = [],
      cache = {};
  return {
    set: function(key, value) {
      if (keys.length > this.max) {
        cache[keys.shift()] = null;
      }
      // 只有非undefined才可以
      if(cache[key] == undefined){
        keys.push(key);
      }
      cache[key] = value;
      return value;
    },
    get: function(key) {
      if (key === undefined) return cache;
      return cache[key];
    },
    max: max,
    len:function(){
      return keys.length;
    }
  };
}

//http://www.w3.org/html/wg/drafts/html/master/single-page.html#void-elements
_.isVoidTag = _.makePredicate("area base br col embed hr img input keygen link menuitem meta param source track wbr");
_.isBooleanAttr = _.makePredicate('selected checked disabled readOnly required open autofocus controls autoplay compact loop defer multiple');



});
require.register("regularjs/src/walkers.js", function(exports, require, module){
var node = require("./parser/node.js");
var dom = require("./dom.js");
var Group = require('./group.js');
var _ = require('./util');
var combine = require('./helper/combine.js');

var walkers = module.exports = {};

walkers.list = function(ast){
  var placeholder = document.createComment("Regular list");
  // proxy Component to implement list item, so the behaviar is similar with angular;
  var Section =  Regular.extend( { template: ast.body, $context: this.$context } );
  var fragment = dom.fragment();
  fragment.appendChild(placeholder);
  var self = this;
  var group = new Group();
  // group.push(placeholder);


  function update(newValue, splices){
    if(!splices || !splices.length) return;
    var cur = placeholder;
    var m = 0, len=newValue.length,
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
        var parent = removed.$parent
        removed.destroy();
      }

      for(var o=index; o < index + splice.add; o++){ //add
        // prototype inherit
        var item = newValue[o];
        var data = _.createObject(self.data);
        data.$index = o;
        data[ast.variable] = item;

        var section = new Section({data: data, $root: self.$root});
        var update = section.$digest.bind(section);

        self.$on('digest', update);
        section.$on('destroy', self.$off.bind(self, 'digest', update));
        // autolink
        var insert = o !== 0 && group.children[o-1]? combine.last(group.get(o-1)) : placeholder;
        insert.parentNode.insertBefore(combine.node(section), insert.nextSibling);
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


  var watchid = this.$watch(ast.sequence, update);

  return {
    node: function(){
      return fragment;
    },
    group: group,
    destroy: function(){
      group.destroy();
      dom.remove(placeholder);
      if(watchid) self.$unwatch(watchid);
    }
  }
}

walkers.template = function(ast){
  var content = ast.content, compiled;
  var placeholder = document.createComment('template');
  var compiled;
  // var fragment = dom.fragment();
  // fragment.appendChild(placeholder);
  if(content){
    var self = this;

    this.$watch(content, function(value){
      if(compiled) compiled.destroy();
      this._record()
      compiled = self.$compile(value, true); 
      var records = this._release();
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
  function update(nvalue, old){
    if(!!nvalue){ //true
      consequent = self.$compile( ast.consequent , true)
      node = combine.node(consequent); //return group
      if(alternate){ alternate.destroy() };
      alternate = null;
      // @TODO
      placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
    }else{ //false
      if(consequent){ consequent.destroy(); }
      consequent = null;
      if(ast.alternate) alternate = self.$compile(ast.alternate, true);
      node = combine.node(alternate);
      placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
    }
  }
  this.$watch(ast.test, update, {force: true});

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
    dom.text(node, "" + (newval == null? "": String(newval)));
  })
  return node;
}
walkers.text = function(ast){
  var self = this;
  var node = document.createTextNode(ast.text);
  return node;
}



walkers.element = function(ast){
  var attrs = ast.attrs, component;
  var watchids = [];
  var self = this;
  var Component = Regular.component(ast.tag);
  if(Component){
    var data = {};

    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      if(value.type !== 'expression' && attr.name !== 'ref'){
        data[attr.name] = value;
      }
    }

    if(ast.children) data.$body = this.$compile(ast.children);
    var component = new Component({data: data});
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      if(value.type === 'expression'){
        this.$bind(component, value, attr.name);
      }else{
        if(attr.name === 'ref' ) this.$refs.push(value);
      }
    }
    return component;
  }else if(ast.tag === 'r:content' && this.data.$body){
    return this.data.$body;
  }
  var element = dom.create(ast.tag);
  var children = ast.children;
  var child;
  var self = this;
  // @TODO must mark the attr bind;
  var directive = [];
  for(var i = 0, len = attrs.length; i < len; i++){
    bindAttrWatcher.call(this, element, attrs[i])
  }
  if(children && children.length){
    var group = this.$compile(children);
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
      // for(var i = 0,len = watchids.length; i< len ;i++){
      //   self.$unwatch(watchids[i]);
      // }
      dom.remove(element);
    }
  }
}

// dada

function bindAttrWatcher(element, attr){
  var name = attr.name,
    value = attr.value || "", directive=Regular.directive(name);
  if(name === 'ref' && value) this.$refs[value] = element;
  var watchids = [];
  if(directive && directive.link){
    directive.link.call(this, element, value, name);
  }else{
    if(value.type == 'expression' ){
      watchids.push(this.$watch(value, function(nvalue, old){
        dom.attr(element, name, nvalue);
      }));
    }else{
      if(_.isBooleanAttr(name)){
        dom.attr(element, name, true);
      }else{
        dom.attr(element, name, value);
      }
    }
  }
  return watchids;
}

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
module.exports.dom = require('./dom.js');
module.exports.util = require('./util.js');


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

// camelCase
function camelCase(str){
  return ("" + str).replace(/-\D/g, function(match){
    return match.charAt(1).toUpperCase();
  });
}


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

dom.find = function(sl){
  if(document.querySelector) {
    try{
      return document.querySelector(sl);
    }catch(e){

    }
  }
  if(sl.indexOf('#')!==-1) return document.getElementById( sl.slice(1) );
}

//http://stackoverflow.com/questions/11068196/ie8-ie7-onchange-event-is-emited-only-after-repeated-selection
function fixEventName(elem, name){
  return (name == 'change'  &&  dom.msie < 9 && 
      (elem && elem.tagName && elem.tagName.toLowerCase()==='input' && 
        (elem.type === 'checkbox' || elem.type === 'radio')
      )
    )? 'click': name;
}

dom.id = function(id){
  return document.getElementById(id);
}

// createElement 
dom.create = function(type, ns){
  return !ns? document.createElement(type): document.createElementNS(type, ns);
}

// documentFragment
dom.fragment = function(){
  return document.createDocumentFragment();
}



var specialAttr = {
  'class': function(node, value){
    ('className' in node) ? node.className = (value || '') : node.setAttribute('class', value);
  },
  'for': function(node, value){
    ('htmlFor' in node) ? node.htmlFor = value : node.setAttribute('for', value);
  },
  'style': function(node, value){
    (node.style) ? node.style.cssText = value : node.setAttribute('style', value);
  },
  'value': function(node, value){
    node.value = (value != null) ? value : '';
  }
}


// attribute Setter & Getter
dom.attr = function(node, name, value){
  name = name.toLowerCase();
  if (_.isBooleanAttr(name)) {
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
    // if in specialAttr;
    if(specialAttr[name]) specialAttr[name](node, value);
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
// it isnt computed style 
dom.css = function(node, name, value){
  if (typeof value !== "undefined") {
    name = camelCase(name);
    if(name) node.style[name] = value;
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
var combine = require('./helper/combine')

function Group(list){
  this.children = list || [];
}


_.extend(Group.prototype, {
  destroy: function(){
    combine.destroy(this.children);
    if(this.ondestroy) this.ondestroy();
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
var _ = require("../util.js");

var test = /a|(b)/.exec("a");
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
  this.input = (input||"").trim();
  this.opts = opts || {};
  this.map = this.opts.mode != 2?  map1: map2;
  this.states = ["INIT"];
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

  tokens.push({type: 'EOF'});

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
  'IDENT': /[\$_A-Za-z][_0-9A-Za-z\$]*/,
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
    all = all.trim();
    if(all) return {type: 'TEXT', value: all}
  }],

  TEXT: [/[^\x00]+/, 'TEXT'],

  // 2. TAG
  // --------------------
  TAG_NAME: [/{NAME}/, 'NAME', 'TAG'],
  TAG_UNQ_VALUE: [/[^&"'=><`\r\n\f ]+/, 'UNQ', 'TAG'],

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


  TAG_PUNCHOR: [/[\>\/=&]/, function(all){
    if(all === '>') this.leave();
    return {type: all, value: all }
  }, 'TAG'],
  TAG_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
    return {type: 'STRING', value: one || two}
  }, 'TAG'],

  TAG_SPACE: [/{SPACE}+/, null, 'TAG'],
  TAG_COMMENT: [/\<\!--([^\x00]*?)--\>/, null ,'TAG'],

  // 3. JST
  // -------------------

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
  JST_COMMENT: [/{BEGIN}\!([^\x00]*?)\!{END}/, function(){
    this.leave();
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
  JST_PUNCHOR: [/[=!]?==|[-=><+*\/%\!]?\=|\|\||&&|\.\.|[\<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!,]/, function(all){
    return { type: all, value: all }
  },'JST'],

  JST_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
    return {type: 'STRING', value: one || two || ""}
  }, 'JST'],
  JST_NUMBER: [/(?:[0-9]*\.[0-9]+|[0-9]+)(e\d+)?/, function(all){
    return {type: 'NUMBER', value: parseFloat(all, 10)};
  }, 'JST']
}

//
var map1 = genMap([
  // INIT
  rules.ENTER_JST,
  rules.ENTER_TAG,
  rules.TEXT,

  //TAG
  rules.TAG_NAME,
  rules.TAG_OPEN,
  rules.TAG_CLOSE,
  rules.TAG_PUNCHOR,
  rules.TAG_ENTER_JST,
  rules.TAG_UNQ_VALUE,
  rules.TAG_STRING,
  rules.TAG_SPACE,
  rules.TAG_COMMENT,

  // JST
  rules.JST_OPEN,
  rules.JST_PART_OPEN,
  rules.JST_CLOSE,
  rules.JST_COMMENT,
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
  rules.JST_COMMENT,
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
  expression: function(get, set,  constant){
    return {
      type: "expression",
      get: get,
      set: set,
      constant: constant

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
  template: function(template){
    return {
      type: 'template',
      content: template
    }
  }
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


function Parser(input, opts){
  opts = opts || {};
  this.input = input;
  this.tokens = new Lexer(input, opts).lex();
  this.pos = 0;
  this.length = this.tokens.length;
}


// @TODO : to detect prop cache length;
var cache = Parser.cache = _.cache(1000);
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

op.statements = function(until){
  var ll, body = [];
  while( !(ll = this.eat('CLOSE', until)) ){
    body.push(this.statement());
  }
  return body;
}

// statement
//  : xml
//  | jst
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
      return {type:'text', text: text};
    case 'TAG_OPEN':
      return this.xml();
    case 'OPEN': 
      return this.directive();
    case 'EXPR_OPEN':
      return this.interplation();
    case 'PART_OPEN':
      return this.template();
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


  var attrs = [], attr, ll = this.ll();
  //   case 'OPEN': 
  //     return this.directive();
  //   case 'NAME':
  //   case '&':
  //     attr = { name: ll.value }
  //     if( this.eat("=") ) attr.value = this.attvalue();

  // switch(ll.type){
  //   case: 
  // }

  while( ll = this.eat(["NAME", "&"]) ){
    attr = { name: ll.value }
    if( this.eat("=") ) attr.value = this.attvalue();

    attrs.push( attr );
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
    case "UNQ":
    case "STRING":
      this.next();
      var value = ll.value;
      if(value.type !== "expression" && ~value.indexOf('{{')){
        var constant = true;
        var parsed = new Parser(value, {mode:2}).parse();
        for(var i =0, len = parsed.length; i < len; i++ ){
          var item = parsed[i];
          if(item.get && !item.constant) constant = false;
        }
        var get = function(self){
          var res= parsed.map(function(item){
            if(item && item.get){
              return item.get(self);
            }
            else return item.text || "";
          }).join("");
          return res;
        }
        value = node.expression(get, null, constant);
      }
      return value;
    case "EXPR_OPEN":
      return this.interplation();
    default:
      this.error('Unexpected token: '+ this.la())
  }
  return ll.value;
}


// {{#}}
op.directive = function(name){
  name = name || (this.ll().value);
  if(typeof this[name] == 'function'){
    return this[name]()
  }else{
    this.error('Undefined directive['+ name +']');
  }
}

// {{}}
op.interplation = function(){
  var nowatch = this.match('EXPR_OPEN').nowatch;
  var res = this.expression(true);
  this.match('END');
  return res;
}

// {{~}}
op.template = function(){
  this.next();
  var content = this.expression();
  this.match('END');
  return node.template(content);
}

// {{#if}}
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


// @mark   mustache syntax have natrure dis, canot with expression
// {{#list}}
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


// @TODO:
op.expression = function(){
  var expression = this.expr();
  return expression;
}

op.expr = function(filter){
  this.depend = [];
  var buffer = this.filter(), set, get;
  var body = buffer.get || buffer;
  
  var prefix =  "var "+ctxName+"=context.$context||context;"+ (this.depend.length? "var "+varName+"=context.data;" : "");
  var get = new Function("context", prefix + "return (" + body + ")");


  if(buffer.set) var set =  new Function("context", _.setName ,
    prefix +";return (" + buffer.set + ")" 
    );

  if(!this.depend.length){
    // means no dependency
    return node.expression(get)
  }else{
    return node.expression(get, set, !this.depend || !this.depend.length )
  }
  return {}
}


// filter
// assign ('|' filtername[':' args]) * 
op.filter = function(){
  var left = this.assign();
  var ll = this.eat('|');
  var buffer, attr;
  if(ll){
    buffer = [
      "(function(data){", 
          "var ", attr = _.randomVar('f'), "=", left.get, ";"]
    do{

      buffer.push(attr + " = "+ctxName+"._f('" + this.match('IDENT').value+ "')(" + attr) ;
      if(this.eat(':')){
        buffer.push(", "+ this.arguments("|").join(",") + ");")
      }else{
        buffer.push(');');
      }

    }while(ll = this.eat('|'));
    buffer.push("return " + attr + "})()");
    return this.getset(buffer.join(""));
  }
  return left;
}

// assign
// left-hand-expr = condition
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
  var left = this.range() ,ll;
  if( ll = this.eat(['*', '/' ,'%']) ){
    return this.getset(left.get + ll.type + this.multive().get);
  }
  return left;
}

op.range = function(){
  var left = this.unary(), ll, right;

  if(ll = this.eat('..')){
    right = this.unary();
    var body = ctxName + '._r(' +left.get + ','+ right.get + ')'
    return this.getset(body);
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
  var ll, path, value, computed;
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
        base += "['" + path.get + "']";
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
      var get = this.assign().get;
      console.log(get);
      code.push(get);
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
require.register("regularjs/src/helper/extend.js", function(exports, require, module){
// (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org

// klass: a classical JS OOP façade
// https://github.com/ded/klass
// License MIT (c) Dustin Diaz 2014
  
// inspired by backbone's extend and klass
var _ = require("../util.js"),
  fnTest = /xy/.test(function(){xy}) ? /\bsupr\b/ : /.*/,
  isFn = function(o){return typeof o === "function"};


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

module.exports = function extend(o){
  var supr = this, proto,
    supro = supr.prototype;

  function fn() {
    supr.apply(this, arguments);
  }

  proto = _.createProto(fn, supro);

  (fn.implement = function (o) {
    process(proto, o, supro); 
    return fn;
  })(o);

  if(supr.__after__) supr.__after__.call(fn, supr, o);
  fn.extend = supr.extend;
  // _.extend(fn, supr, supr.__statics__ || []);
  return fn;
}


});
require.register("regularjs/src/helper/shim.js", function(exports, require, module){
// shim for es5
var slice = [].slice;
var tstr = ({}).toString;

function extend(o1, o2 ){
  for(var i in o2) if( o1[i] === undefined){
    o1[i] = o2[i]
  }
}

// String proto ;
extend(String.prototype, {
  trim: function(){
    return this.replace(/^\s+|\s+$/g, '');
  }
});

// Array proto;
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

// Function proto;
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
  keys: function(obj){
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
// Array
extend(Array, {
  isArray: function(arr){
    return tstr.call(arr) === "[object Array]";
  }
})

});
require.register("regularjs/src/helper/event.js", function(exports, require, module){
// simplest event emitter 60 lines
// ===============================
var slice = [].slice, _ = require("../util.js");
var API = {
    $on: function(event, fn) {
        if(typeof event === "object"){
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
        if(!this._handles) return;
        if(!event) this._handles = [];
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
    // bubble event
    $emit: function(event){
        var handles = this._handles, calls;
        if(!event) return;
        if(typeof event === "object"){
           var type = event.type, 
            args = event.data || [],
            stop = event.stop;
        }else{
        var args = slice.call(arguments, 1),
            type = event,
            $parent = this.$parent;
        }
        if (!handles || !(calls = handles[type])) return this;
        for (var i = 0, len = calls.length; i < len; i++) {
            calls[i].apply(this, args)
        }
        // if(calls.length) this.$update();
        return this;
    },
    // capture  event
    $broadcast: function(event){
        
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

var dom = require("../dom.js");

var combine = module.exports = {

  // get the initial dom in object
  node: function(item){
    var children;
    if(item.element) return item.element;
    if(typeof item.node === "function") return item.node();
    if(typeof item.nodeType === "number") return item;
    if(item.group) return combine.node(item.group)
    if(children = item.children){
      if(children.length == 1){
        var node = combine.node(children[0])
        return node;
      }
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

    if(typeof item.last === "function") return item.last();
    if(typeof item.nodeType === "number") return item;

    if(children && children.length) return combine.last(children[children.length - 1]);
    if(item.group) return combine.last(item.group);

  },

  destroy: function(item){
    if(!item) return;
    if(Array.isArray(item)){
      for(var i = 0, len = item.length; i < len; i++ ){
        combine.destroy(item[i]);
      }
    }
    var children = item.children;
    if(typeof item.destroy === "function") return item.destroy();
    if(typeof item.nodeType === "number") return dom.remove(item);
    if(children && children.length){
      combine.destroy(item);
      item.children = null;
    }
  }

}
});
require.register("regularjs/src/directive/base.js", function(exports, require, module){
// Regular
var _ = require("../util.js");
var dom = require("../dom.js");
var Regular = require("../Regular.js");



require("./event.js");
require("./form.js");


// **warn**: class inteplation will override this directive 

Regular.directive('r-class', function(elem, value){
  if(value.type !== 'expression') value = Regular.parse(value);

  this.$watch(value, function(nvalue){
    var className = ' '+ elem.className.replace(/\s+/g, ' ') +' ';
    for(var i in nvalue) if(nvalue.hasOwnProperty(i)){
      className = className.replace(' ' + i + ' ',' ');
      if(nvalue[i] == true){
        className += i+' ';
      }
    }
    elem.className = className.trim();
  },true);

});

// **warn**: style inteplation will override this directive 

Regular.directive('r-style', function(elem, value){
  if(value.type !== 'expression') value = Regular.parse(value);

  this.$watch(value, function(nvalue){
    for(var i in nvalue) if(nvalue.hasOwnProperty(i)){
      dom.css(elem, i, nvalue[i]);
    }
  },true);
});

// when expression is evaluate to true, the elem will add display:none
// Example: <div r-hide={{items.length > 0}}></div>

Regular.directive('r-hide', function(elem, value){

  if(value.type !== 'expression') value = Regular.parse(value);

  this.$watch(value, function(nvalue){
    if(!!nvalue){
      elem.style.display = "none";
    }else{
      elem.style.display = ""
    }
  });

});


});
require.register("regularjs/src/directive/form.js", function(exports, require, module){
// Regular
var _ = require("../util.js");
var dom = require("../dom.js");
var Regular = require("../Regular.js");

var modelHandlers = {
  "text": initText,
  "select": initSelect,
  "checkbox": initCheckBox,
  "radio": initRadio
}


// two-way binding with r-model
// works on input, textarea, checkbox, radio, select

Regular.directive("r-model", function(elem, value){
  var tag = elem.tagName.toLowerCase();
  var sign = tag;
  if(sign === "input") sign = elem.type || "text";
  else if(sign === "textarea") sign = "text";
  if(typeof value === "string") value = Regular.parse(value);

  if( modelHandlers[sign] ) modelHandlers[sign].call(this, elem, value);
  else if(tag === "input"){
    modelHandlers["text"].call(this, elem, value);
  }
});



// binding <select>

function initSelect( elem, parsed){
  var self = this;
  var inProgress = false;
  var value = elem.value;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    var children = _.slice(elem.getElementsByTagName('option'))
    children.forEach(function(node, index){
      if(node.value == newValue){
        elem.selectedIndex = index;
      }
    })
  });

  function handler(ev){
    console.log(this.value)
    parsed.set(self, this.value);
    inProgress = true;
    self.$update();
    inProgress = false;
  }
  dom.on(elem, "change", handler);
  this.$on('init', function(){
    if(parsed.get(self) === undefined){
      console.log('haha')
       parsed.set(self, elem.value);
    }
  })
}

// input,textarea binding

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
    self.$update();
    inProgress = false;
  };

  if(dom.msie !== 9 && "oninput" in dom.tNode ){
    elem.addEventListener("input", handler );
  }else{
    dom.on(elem, "paste", handler)
    dom.on(elem, "keypress", handler)
    dom.on(elem, "cut", handler)
  }
  this.$on('init', function(){
    if(parsed.get(self) === undefined){
       parsed.set(self, elem.value);
    }
  })
}

// input:checkbox  binding

function initCheckBox(elem, parsed){
  var inProgress = false;
  var self = this;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    dom.attr(elem, 'checked', !!newValue);
  });

  var handler = function handler(ev){
    var value = this.checked;
    parsed.set(self, value);
    inProgress= true;
    self.$update();
    inProgress = false;
  }
  if(parsed.set) dom.on(elem, "change", handler)
  this.$on('init', function(){
    if(parsed.get(self) === undefined){
      parsed.set(self, elem.checked);
    }
  });
}


// input:radio binding

function initRadio(elem, parsed){
  var self = this;
  var inProgress = false;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    if(newValue === elem.value) elem.checked = true;
  });


  var handler = function handler(ev){
    var value = this.value;
    parsed.set(self, value);
    inProgress= true;
    self.$update();
    inProgress = false;
  }
  if(parsed.set) dom.on(elem, "change", handler)
  this.$on('init', function(){
    if(parsed.get(self) === undefined){
      if(elem.checked) parsed.set(self, elem.value);
    }
  });
}

});
require.register("regularjs/src/directive/event.js", function(exports, require, module){
/**
 * event directive  bundle
 * 
 */
var _ = require("../util.js");
var dom = require("../dom.js");
var Regular = require("../Regular.js");
var prevent = function(ev){
  if(ev.preventDefualt) ev.preventDefault();
  else ev.returnValue = false;
}

Regular.events = {
  enter: function(elem, fire){
    function update(ev){
      if(ev.which == 13 || ev.keyCode == 13){
        prevent(ev||window.event);
        fire(ev);
      }
    }
    dom.on(elem, "keypress", update);
    return function(){
      dom.off(elem, "keypress", update);
    }
  }
}



Regular.directive(/^on-\w+$/, function(elem, value, name){

  if(!name || !value) return;
  var type = name.split("-")[1], 
    events = Regular.events;
  var parsed = Regular.parse(value);
  var self = this;

  function fire(obj){
    self.data.$event = obj;
    parsed.get(self);
    self.data.$event = null;
    self.$update();
  }
  var handler = events[type];
  if(handler){
    var destroy = handler(elem, fire);
  }else{
    dom.on( elem, type, fire );
  }
  return {
    destroy: handler? destroy : function(){
      dom.off(elem, type, fire);
    }
  }

});


});
require.alias("regularjs/src/index.js", "regularjs/index.js");
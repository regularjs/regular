/**
 * Provides more features for the widget module...
 *
 * @module widget
 * @submodule widget-foo
 * @main widget
 */

var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");
var node = require("./parser/node.js");
var dom = require("./dom.js");
var Group = require('./group.js');
var _ = require('./util');
var extend = require('./helper/extend.js');
var Event = require('./helper/event.js');
var combine = require('./helper/combine.js');
var Watcher = require('./helper/watcher.js');
var parse = require('./helper/parse.js');
var walkers = require('./walkers.js');
var doc = typeof document==='undefined'? {} : document;
var env = require('./env.js');


/**
* This is the description for my class.
* > dadada
*
* @class MyClass
* @constructor
*/

var Regular = function(options){
  var prevRunning = env.isRunning;
  env.isRunning = true;
  var node, template, name;

  options = options || {};
  options.data = options.data || {};
  if(this.data) _.extend(options.data, this.data);
  _.extend(this, options, true);
  if(this.$parent){
     this.$parent._append(this);
  }
  this._children = [];

  template = this.template;

  if(typeof template === 'string' && template.length < 40 && (node = dom.find(template))) {
    template = node.innerHTML;
  }
  if(typeof template === 'string') this.template = new Parser(template).parse()
  this.config && this.config(this.data);
  this.$context = this.$context || this;
  this.$root = this.$root || this;
  // if have events
  if(this.events){
    this.$on(this.events);
    this.events = null;
  }

  if(template){
    this.group = this.$compile(this.template);
    combine.node(this);
  }

  if(this.$root === this) this.$update();
  this.$ready = true;
  this.$emit({type: 'init', stop: true });
  if( this.init ) this.init(this.data);

  if(this.$root === this) this.$update();
  env.isRunning = prevRunning;

  // children is not required;
}




// description
// -------------------------
// 1. Regular and derived Class use same filter
_.extend(Regular, {
  // private data stuff
  _directives: { __regexp__:[] },
  _plugins: {},
  _exprCache:{},
  _running: false,
  _protoInheritCache: ['use', 'directive'] ,
  __after__: function(supr, o) {


    var template;
    this.__after__ = supr.__after__;

    if(o.name) Regular.component(o.name, this);
    if(template = o.template){
      var node, name;
      if( typeof template === 'string' && template.length < 20 && ( node = dom.find( template )) ){
        template = node.innerHTML;
        if(name = dom.attr(node, 'name')) Regular.component(name, this);
      }
      if(typeof template == 'string'){
        this.prototype.template = new Parser(template).parse();
      }
    }
    // inherit directive and other config from supr
    Regular._inheritConfig(this, supr);

  },
  /**
   * directive's setter and getter
   * @param  {String|RegExp} name  
   * @param  {[type]} cfg  [description]
   * @return {[type]}      [description]
   */
  directive: function(name, cfg){

    if(_.typeOf(name) === "object"){
      for(var i in name){
        if(name.hasOwnProperty(i)) this.directive(i, name[i]);
      }
      return this;
    }
    var type = _.typeOf(name);
    var directives = this._directives, directive;
    if(cfg == null){
      if( type === "string" && (directive = directives[name]) ) return directive;
      else{
        var regexp = directives.__regexp__;
        for(var i = 0, len = regexp.length; i < len ; i++){
          directive = regexp[i];
          var test = directive.regexp.test(name);
          if(test) return directive;
        }
      }
      return undefined;
    }
    if(typeof cfg === 'function') cfg = { link: cfg } 
    if(type === 'string') directives[name] = cfg;
    else if(type === 'regexp'){
      cfg.regexp = name;
      directives.__regexp__.push(cfg)
    }
    return this
  },
  plugin: function(name, fn){
    var plugins = this._plugins;
    if(fn == null) return plugins[name];
    plugins[name] = fn;
    return this;
  },
  use: function(fn){
    if(typeof fn === "string") fn = Regular.plugin(fn);
    if(typeof fn !== "function") return this;
    fn(this, Regular);
    return this;
  },
  expression: parse.expression,
  parse: parse.parse,

  Parser: Parser,
  Lexer: Lexer,

  _addProtoInheritCache: function(name){
    if( Array.isArray( name ) ){
      return name.forEach(Regular._addProtoInheritCache);
    }
    var cacheKey = "_" + name + "s"
    Regular._protoInheritCache.push(name)
    Regular[cacheKey] = {};
    Regular[name] = function(key, cfg){
      var cache = this[cacheKey];

      if(typeof key === "object"){
        for(var i in key){
          if(key.hasOwnProperty(i)) this[name](i, key[i]);
        }
        return this;
      }
      if(cfg == null) return cache[key];
      cache[key] = cfg;
      return this;
    }
  },
  _inheritConfig: function(self, supr){

    // prototype inherit some Regular property
    // so every Component will have own container to serve directive, filter etc..
    var defs = Regular._protoInheritCache;
    var keys = _.slice(defs);
    keys.forEach(function(key){
      self[key] = supr[key];
      var cacheKey = '_' + key + 's';
      if(supr[cacheKey]) self[cacheKey] = _.createObject(supr[cacheKey]);
    })
    return self;
  }
});

extend(Regular);

Regular._addProtoInheritCache(["filter", "component"])


Event.mixTo(Regular);
Watcher.mixTo(Regular);

Regular.implement({


  init: function(){},
  /**
   * compile a block ast ; return a group;
   * @param  {Array} parsed ast
   * @param  {[type]} record
   * @return {[type]}
   */
  $compile: function(ast, options){
    if(typeof ast === 'string'){
      ast = new Parser(ast).parse()
    }
    var record = options && options.record, records;
    if(record) this._record();
    var group = this._walk(ast, options);
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
  $get: function(expr){
    return Regular.expression(expr).get(this);
  },
  destroy: function(){
    // destroy event wont propgation;
    this.$emit({type: 'destroy', stop: true });
    this.group && this.group.destroy(true);
    this.group = null;
    this.parentNode = null;
    this._watchers = null;
    this._children = [];
    var parent = this.$parent;
    if(parent){
      var index = parent._children.indexOf(this);
      parent._children.splice(index,1);
    }
    this.$parent = null;
    this.$root = null;
    this._events = null;
    this.$off();
  },
  $inject: function(node, position){
    var fragment = combine.node(this);
    if(typeof node === 'string') node = dom.find(node);
    if(!node) throw 'injected node is not found'
    if(!fragment) return;
    dom.inject(fragment, node, position);
    this.$emit("inject", node);
    this.parentNode = node;
    return this;
  },
  // private bind logic
  _bind: function(component, expr1, expr2){

    var self = this;
    // basic binding
    if(!component || !(component instanceof Regular)) throw "$bind() should pass Regular component as first argument";
    if(!expr1) throw "$bind() should  pass as least one expression to bind";
    expr1 = Regular.expression(expr1);

    if(!expr2) expr2 = expr1;
    else expr2 = Regular.expression(expr2);

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
  _walk: function(ast, arg1){
    if( _.typeOf(ast) === 'array' ){
      var res = [];

      for(var i = 0, len = ast.length; i < len; i++){
        res.push( this._walk(ast[i], arg1) );
      }

      return new Group(res);
    }
    if(typeof ast === 'string') return doc.createTextNode(ast)
    return walkers[ast.type || "default"].call(this, ast, arg1);
  },
  _append: function(component){
    this._children.push(component);
    component.$root = this.$root;
    component.$parent = this;
  },

  // find filter
  _f: function(name){
    var Component = this.constructor;
    var filter = Component.filter(name);
    if(typeof filter !== 'function') throw 'filter ' + name + 'is undefined';
    return filter;
  },
  _handleEvent: function(elem, type, value){
    var Component = this.constructor,
      fire = typeof value !== "function"? _.handleEvent.call( this, value, type ) : value,
      handler = Component.event(type), destroy;

    if ( handler ) {
      destroy = handler.call(this, elem, fire);
    } else {
      dom.on(elem, type, fire);
    }
    return handler ? destroy : function() {
      dom.off(elem, type, fire);
    }
  }
});

Regular.prototype.inject = Regular.prototype.$inject;

module.exports = Regular;

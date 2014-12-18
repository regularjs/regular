
var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");
var dom = require("./dom.js");
var config = require("./config.js");
var Group = require('./group.js');
var _ = require('./util');
var extend = require('./helper/extend.js');
var Event = require('./helper/event.js');
var combine = require('./helper/combine.js');
var Watcher = require('./helper/watcher.js');
var parse = require('./helper/parse.js');
var doc = typeof document==='undefined'? {} : document;
var env = require('./env.js');


/**
* `Regular` is regularjs's NameSpace and BaseClass. Every Component is inherited from it
* 
* @class Regular
* @module Regular
* @constructor
* @param {Object} options specification of the component
*/
var Regular = function(options){
  var prevRunning = env.isRunning;
  env.isRunning = true;
  var node, template;

  options = options || {};
  options.data = options.data || {};
  options.computed = options.computed || {};
  options.events = options.events || {};
  if(this.data) _.extend(options.data, this.data);
  if(this.computed) _.extend(options.computed, this.computed);
  if(this.events) _.extend(options.events, this.events);

  _.extend(this, options, true);
  if(this.$parent){
     this.$parent._append(this);
  }
  this._children = [];
  this.$refs = {};

  template = this.template;

  // template is a string (len < 40). we will find it container first
  if((typeof template === 'string' && template.length < 40) && (node = dom.find(template))) {
    template = node.innerHTML;
  }
  // if template is a xml
  if(template && template.nodeType) template = template.innerHTML;
  if(typeof template === 'string') this.template = new Parser(template).parse();

  this.computed = handleComputed(this.computed);
  this.$context = this.$context || this;
  this.$root = this.$root || this;
  // if have events
  if(this.events){
    this.$on(this.events);
  }

  this.config && this.config(this.data);
  // handle computed
  if(template){
    this.group = this.$compile(this.template, {namespace: options.namespace});
    combine.node(this);
  }


  if(this.$root === this) this.$update();
  this.$ready = true;
  if(this.$context === this) this.$emit("$init");
  if( this.init ) this.init(this.data);

  // @TODO: remove, maybe , there is no need to update after init; 
  // if(this.$root === this) this.$update();
  env.isRunning = prevRunning;

  // children is not required;
}


var walkers = require('./walkers.js');
walkers.Regular = Regular;


// description
// -------------------------
// 1. Regular and derived Class use same filter
_.extend(Regular, {
  // private data stuff
  _directives: { __regexp__:[] },
  _plugins: {},
  _protoInheritCache: ['use', 'directive'] ,
  __after__: function(supr, o) {

    var template;
    this.__after__ = supr.__after__;

    if(o.name) Regular.component(o.name, this);
    // this.prototype.template = dom.initTemplate(o)
    if(template = o.template){
      var node, name;
      if( typeof template === 'string' && template.length < 20 && ( node = dom.find( template )) ){
        template = node.innerHTML;
        if(name = dom.attr(node, 'name')) Regular.component(name, this);
      }

      if(template.nodeType) template = template.innerHTML;

      if(typeof template === 'string'){
        this.prototype.template = new Parser(template).parse();
      }
    }

    if(o.computed) this.prototype.computed = handleComputed(o.computed);
    // inherit directive and other config from supr
    Regular._inheritConfig(this, supr);

  },
  /**
   * Define a directive
   *
   * @method directive
   * @return {Object} Copy of ...
   */  
  directive: function(name, cfg){

    if(_.typeOf(name) === "object"){
      for(var k in name){
        if(name.hasOwnProperty(k)) this.directive(k, name[k]);
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
  // config the Regularjs's global
  config: function(name, value){
    var needGenLexer = false;
    if(typeof name === "object"){
      for(var i in name){
        // if you config
        if( i ==="END" || i==='BEGIN' )  needGenLexer = true;
        config[i] = name[i];
      }
    }
    if(needGenLexer) Lexer.setup();
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
  config: function(){},
  destroy: function(){
    // destroy event wont propgation;
    if(this.$context === this) this.$emit("$destroy");
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
    this._handles = null;
    this.$refs = null;
  },

  /**
   * compile a block ast ; return a group;
   * @param  {Array} parsed ast
   * @param  {[type]} record
   * @return {[type]}
   */
  $compile: function(ast, options){
    options = options || {};
    if(typeof ast === 'string'){
      ast = new Parser(ast).parse()
    }
    var preNs = this.__ns__,
      record = options.record, 
      records;
    if(options.namespace) this.__ns__ = options.namespace;
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
    if(options.namespace) this.__ns__ = preNs;
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
    if( expr1.type === 'expression' || type === 'string' ){
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
  $unbind: function(){
    // todo
  },
  $get: function(expr){
    return parse.expression(expr).get(this);
  },
  $inject: function(node, position, options){
    var fragment = combine.node(this);

    if(node === false) {
      if(!this._fragContainer)  this._fragContainer = dom.fragment();
      return this.$inject(this._fragContainer);
    }
    if(typeof node === 'string') node = dom.find(node);
    if(!node) throw 'injected node is not found';
    if(!fragment) return;
    dom.inject(fragment, node, position);
    this.$emit("$inject", node);
    this.parentNode = Array.isArray(fragment)? fragment[0].parentNode: fragment.parentNode;
    return this;
  },
  $mute: function(isMute){

    isMute = !!isMute;

    var needupdate = isMute === false && this._mute;

    this._mute = !!isMute;

    if(needupdate) this.$update();
    return this;
  },
  // private bind logic
  _bind: function(component, expr1, expr2){

    var self = this;
    // basic binding

    if(!component || !(component instanceof Regular)) throw "$bind() should pass Regular component as first argument";
    if(!expr1) throw "$bind() should  pass as least one expression to bind";

    if(!expr2) expr2 = expr1;

    expr1 = parse.expression( expr1 );
    expr2 = parse.expression( expr2 );

    // set is need to operate setting ;
    if(expr2.set){
      var wid1 = this.$watch( expr1, function(value){
        component.$update(expr2, value)
      });
      component.$on('$destroy', function(){
        self.$unwatch(wid1)
      })
    }
    if(expr1.set){
      var wid2 = component.$watch(expr2, function(value){
        self.$update(expr1, value)
      });
      // when brother destroy, we unlink this watcher
      this.$on('$destroy', component.$unwatch.bind(component,wid2))
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
  _handleEvent: function(elem, type, value, attrs){
    var Component = this.constructor,
      fire = typeof value !== "function"? _.handleEvent.call( this, value, type ) : value,
      handler = Component.event(type), destroy;

    if ( handler ) {
      destroy = handler.call(this, elem, fire, attrs);
    } else {
      dom.on(elem, type, fire);
    }
    return handler ? destroy : function() {
      dom.off(elem, type, fire);
    }
  },
  // find filter
  _f_: function(name){
    var Component = this.constructor;
    var filter = Component.filter(name);
    if(typeof filter !== 'function') throw 'filter ' + name + 'is undefined';
    return filter;
  },
  // simple accessor get
  _sg_:function(path, defaults){
    var computed = this.computed,
      computedProperty = computed[path];
    if(computedProperty){
      if(computedProperty.get)  return computedProperty.get(this);
      else _.log("the computed '" + path + "' don't define the get function,  get data."+path + " altnately", "error")
    }
    return defaults;

  },
  // simple accessor set
  _ss_:function(path, value, data, op){
    var computed = this.computed,
      op = op || "=",
      computedProperty = computed[path],
      prev;

    if(op!== '='){
      prev = computedProperty? computedProperty.get(this): data[path];
      switch(op){
        case "+=":
          value = prev + value;
          break;
        case "-=":
          value = prev - value;
          break;
        case "*=":
          value = prev * value;
          break;
        case "/=":
          value = prev / value;
          break;
        case "%=":
          value = prev % value;
          break;
      }
    }  

    if(computedProperty) {
      if(computedProperty.set) return computedProperty.set(this, value);
      else _.log("the computed '" + path + "' don't define the set function,  assign data."+path + " altnately", "error" )
    }
    data[path] = value;
    return value;
  }
});

Regular.prototype.inject = Regular.prototype.$inject;

module.exports = Regular;



var handleComputed = (function(){
  // wrap the computed getter;
  function wrapGet(get){
    return function(context){
      var ctx = context.$context;
      return get.call(ctx, ctx.data );
    }
  }
  // wrap the computed setter;
  function wrapSet(set){
    return function(context, value){
      var ctx = context.$context;
      set.call( ctx, value, ctx.data );
      return value;
    }
  }

  return function(computed){
    if(!computed) return;
    var parsedComputed = {}, handle, pair, type;
    for(var i in computed){
      handle = computed[i]
      type = typeof handle;

      if(handle.type === 'expression'){
        parsedComputed[i] = handle;
        continue;
      }
      if( type === "string" ){
        parsedComputed[i] = parse.expression(handle)
      }else{
        pair = parsedComputed[i] = {type: 'expression'};
        if(type === "function" ){
          pair.get = wrapGet(handle);
        }else{
          if(handle.get) pair.get = wrapGet(handle.get);
          if(handle.set) pair.set = wrapSet(handle.set);
        }
      } 
    }
    return parsedComputed;
  }
})();

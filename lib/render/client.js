/**
 * render for component in browsers
 */

var env = require('../env');
var Lexer = require('../parser/Lexer');
var Parser = require('../parser/Parser');
var config = require('../config');
var _ = require('../util');
var extend = require('../helper/extend');
var shared = require('./shared');
var combine = {};
if(env.browser){
  var dom = require("../dom");
  var walkers = require('../walkers');
  var Group = require('../group');
  var doc = dom.doc;
  combine = require('../helper/combine');
}
var events = require('../helper/event');
var Watcher = require('../helper/watcher');
var parse = require('../helper/parse');
var filter = require('../helper/filter');
var ERROR = require('../const').ERROR;
var nodeCursor = require('../helper/cursor');
var shared = require('./shared');
var NOOP = function(){};


/**
* `Regular` is regularjs's NameSpace and BaseClass. Every Component is inherited from it
* 
* @class Regular
* @module Regular
* @constructor
* @param {Object} options specification of the component
*/
var Regular = function(definition, options){
  var prevRunning = env.isRunning;
  env.isRunning = true;
  var node, template, cursor, context = this, body, mountNode;
  options = options || {};
  definition = definition || {};



  var dtemplate = definition.template;

  if(env.browser) {

    if( node = tryGetSelector( dtemplate ) ){
      dtemplate = node;
    }
    if( dtemplate && dtemplate.nodeType ){
      definition.template = dtemplate.innerHTML
    }
    
    mountNode = definition.mountNode;
    if(typeof mountNode === 'string'){
      mountNode = dom.find( mountNode );
      if(!mountNode) throw Error('mountNode ' + mountNode + ' is not found')
    } 

    if(mountNode){
      cursor = nodeCursor(mountNode.firstChild, mountNode)
      delete definition.mountNode
    }else{
      cursor = options.cursor
    }
  }



  template = shared.initDefinition(context, definition)
  

  if(context.$parent){
     context.$parent._append(context);
  }
  context._children = [];
  context.$refs = {};
  context.$root = context.$root || context;

  var extra = options.extra;
  var oldModify = extra && extra.$$modify;

  
  var newExtra;
  if( body = context._body ){
    context._body = null
    var modifyBodyComponent = context.modifyBodyComponent;
    if( typeof modifyBodyComponent  === 'function'){
      modifyBodyComponent = modifyBodyComponent.bind(this)
      newExtra = _.createObject(extra);
      newExtra.$$modify = function( comp ){
        return modifyBodyComponent(comp, oldModify? oldModify: NOOP)
      }
    }else{ //@FIXIT: multiply modifier
      newExtra = extra
    }
    if(body.ast && body.ast.length){
      context.$body = _.getCompileFn(body.ast, body.ctx , {
        outer: context,
        namespace: options.namespace,
        extra: newExtra,
        record: true
      })
    }
  }

  // handle computed
  if(template){
    var cplOpt = {
      namespace: options.namespace,
      cursor: cursor
    }
    // if(extra && extra.$$modify){
      cplOpt.extra = {$$modify : extra&& extra.$$modify}
    // }
    context.group = context.$compile(template, cplOpt);
    combine.node(context);
  }



  // modify在compile之后调用， 这样就无需处理SSR相关逻辑
  
  if( oldModify ){
    oldModify(this);
  }

  // this is outest component
  if( !context.$parent ) context.$update();
  context.$ready = true;

  context.$emit("$init");
  if( context.init ) context.init( context.data );
  context.$emit("$afterInit");

  env.isRunning = prevRunning;

  // children is not required;
  
  if (this.devtools) {
    this.devtools.emit("init", this)
  }
}

// check if regular devtools hook exists
if(typeof window !== 'undefined'){
  var devtools = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__;
  if (devtools) {
    Regular.prototype.devtools = devtools;
  }
}

walkers && (walkers.Regular = Regular);


// description
// -------------------------
// 1. Regular and derived Class use same filter
_.extend(Regular, {
  // private data stuff
  _directives: { __regexp__:[] },
  _plugins: {},
  _protoInheritCache: [ 'directive', 'use'] ,
  __after__: function(supr, o) {

    var template;
    this.__after__ = supr.__after__;

    // use name make the component global.
    if(o.name) Regular.component(o.name, this);
    // this.prototype.template = dom.initTemplate(o)
    if(template = o.template){
      var node, name;
      if( env.browser ){
        if( node = tryGetSelector(template) ) template = node ;
        if( template && template.nodeType ){

          if(name = dom.attr(template, 'name')) Regular.component(name, this);

          template = template.innerHTML;
        } 
      }

      if(typeof template === 'string' ){
        this.prototype.template = config.PRECOMPILE? new Parser(template).parse(): template;
      }
    }

    if(o.computed) this.prototype.computed = shared.handleComputed(o.computed);
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
    if(!name) return;

    var type = typeof name;
    if(type === 'object' && !cfg){
      for(var k in name){
        if(name.hasOwnProperty(k)) this.directive(k, name[k]);
      }
      return this;
    }
    var directives = this._directives, directive;
    if(cfg == null){
      if( type === 'string' ){
        if( directive = directives[name] ) return directive;
        else{
          var regexp = directives.__regexp__;
          for(var i = 0, len = regexp.length; i < len ; i++){
            directive = regexp[i];
            var test = directive.regexp.test(name);
            if(test) return directive;
          }
        }
      }
    }else{
      if( typeof cfg === 'function') cfg = { link: cfg } 
      if( type === 'string' ) directives[name] = cfg;
      else{
        cfg.regexp = name;
        directives.__regexp__.push(cfg)
      }
      if(typeof cfg.link !== 'function') cfg.link = NOOP;
      return this
    }
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
  Parser: Parser,
  Lexer: Lexer,
  _addProtoInheritCache: function(name, transform){
    if( Array.isArray( name ) ){
      return name.forEach(Regular._addProtoInheritCache);
    }
    var cacheKey = "_" + name + "s"
    Regular._protoInheritCache.push(name)
    Regular[cacheKey] = {};
    if(Regular[name]) return;
    Regular[name] = function(key, cfg){
      var cache = this[cacheKey];

      if(typeof key === "object"){
        for(var i in key){
          if(key.hasOwnProperty(i)) this[name](i, key[i]);
        }
        return this;
      }
      if(cfg == null) return cache[key];
      cache[key] = transform? transform(cfg) : cfg;
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

Regular._addProtoInheritCache("component")

Regular._addProtoInheritCache("filter", function(cfg){
  return typeof cfg === "function"? {get: cfg}: cfg;
})


events.mixTo(Regular);
Watcher.mixTo(Regular);

Regular.implement({
  init: function(){},
  config: function(){},
  destroy: function(){
    // destroy event wont propgation;
    this.$emit("$destroy");
    this._watchers = null;
    this._watchersForStable = null;
    this.group && this.group.destroy(true);
    this.group = null;
    this.parentNode = null;
    this._children = null;
    this.$root = null;
    this._handles = null;
    this.$refs = null;
    var parent = this.$parent;
    if(parent && parent._children){
      var index = parent._children.indexOf(this);
      parent._children.splice(index,1);
    }
    this.$parent = null;

    if (this.devtools) {
      this.devtools.emit("destroy", this)
    }
    this._handles = null;
    this.$phase = "destroyed";
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
    var preExt = this.__ext__,
      record = options.record, 
      records;

    if(options.extra) this.__ext__ = options.extra;


    if(record) this._record();
    var group = this._walk(ast, options);
    if(record){
      records = this._release();
      var self = this;
      if( records.length ){
        // auto destroy all wather;
        group.ondestroy = function(){ self.$unwatch(records); }
      }
    }
    if(options.extra) this.__ext__ = preExt;
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
   * @param  {Regular} component [descriptionegular
   * @return {This}    this
   */
  $unbind: function(){
    // todo
  },
  $inject: combine.inject,
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
  _walk: function(ast, options){
    if( Array.isArray(ast) ){
      var res = [];

      for(var i = 0, len = ast.length; i < len; i++){
        var ret = this._walk(ast[i], options);
        if(ret && ret.code === ERROR.UNMATCHED_AST){
          ast.splice(i, 1);
          i--;
          len--;
        }else res.push( ret );
      }
      return new Group(res);
    }
    if(typeof ast === 'string') return doc.createTextNode(ast)
    return walkers[ast.type || "default"].call(this, ast, options);
  },
  _append: function(component){
    this._children.push(component);
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
  // 1. 用来处理exprBody -> Function
  // 2. list里的循环
  _touchExpr: function(expr, ext){
    var rawget, ext = this.__ext__, touched = {};
    if(expr.type !== 'expression' || expr.touched) return expr;

    rawget = expr.get;
    if(!rawget){
      rawget = expr.get = new Function(_.ctxName, _.extName , _.prefix+ "return (" + expr.body + ")");
      expr.body = null;
    }
    touched.get = !ext? rawget: function(context, e){
      return rawget( context, e || ext )
    }

    if(expr.setbody && !expr.set){
      var setbody = expr.setbody;
      var filters = expr.filters;
      var self = this;
      if(!filters || !_.some(filters, function(filter){ return !self._f_(filter).set }) ){
        expr.set = function(ctx, value, ext){
          expr.set = new Function(_.ctxName, _.setName , _.extName, _.prefix + setbody);          
          return expr.set(ctx, value, ext);
        }
      }
      expr.filters = expr.setbody = null;
    }
    if(expr.set){
      touched.set = !ext? expr.set : function(ctx, value){
        return expr.set(ctx, value, ext);
      }
    }

    touched.type = 'expression';
    touched.touched = true;
    touched.once = expr.once || expr.constant;
    return touched
  },
  // find filter
  _f_: function(name){
    var Component = this.constructor;
    var filter = Component.filter(name);
    if(!filter) throw Error('filter ' + name + ' is undefined');
    return filter;
  },
  // simple accessor get
  // ext > parent > computed > defaults
  _sg_:function(path, parent, defaults, ext){
    if( path === undefined ) return undefined;

    if(ext && typeof ext === 'object'){
      if(ext[path] !== undefined)  return ext[path];
    }
    
    // reject to get from computed, return undefined directly
    // like { empty.prop }, empty equals undefined
    // prop shouldn't get from computed
    if(parent === null) {
      return undefined
    }

    if(parent && typeof parent[path] !== 'undefined') {
      return parent[path]
    }

    // without parent, get from computed
    if (parent !== null) {
      var computed = this.computed,
        computedProperty = computed[path];
      if(computedProperty){
        if(computedProperty.type==='expression' && !computedProperty.get) this._touchExpr(computedProperty);
        if(computedProperty.get)  return computedProperty.get(this);
        else _.log("the computed '" + path + "' don't define the get function,  get data."+path + " altnately", "warn")
      }
    }

    if( defaults === undefined  ){
      return undefined;
    }
    return defaults[path];

  },
  // simple accessor set
  _ss_:function(path, value, data , op, computed){
    var computed = this.computed,
      op = op || "=", prev, 
      computedProperty = computed? computed[path]:null;

    if(op !== '='){
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
    }
    data[path] = value;
    return value;
  }
});

Regular.prototype.inject = function(){
  _.log("use $inject instead of inject", "warn");
  return this.$inject.apply(this, arguments);
}


// only one builtin filter

Regular.filter(filter);

module.exports = Regular;



function tryGetSelector(tpl){
  var node;
  if( typeof tpl === 'string' && tpl.length < 16 && (node = dom.find( tpl )) ) {
    _.log("pass selector as template has be deprecated, pass node or template string instead", 'warn')
    return node
  }
}

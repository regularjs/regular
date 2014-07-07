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
var doc = typeof document==='undefined'? {}: document;

var Regular = function(options){
  var node, template, name;

  options = options || {};
  options.data = options.data || {};
  if(this.data) _.extend(options.data, this.data);
  _.extend(this, options, true);

  template = this.template;

  if(typeof template === 'string' && template.length < 40 && (node = dom.find(template))) {
    template = node.innerHTML;
  }
  if(typeof template === 'string') this.template = new Parser(template).parse()
  this.$watchers = [];
  this.config && this.config(this.data);
  this.$context = this.$context || this;
  this.$root = this.$root || this;
  // if have events
  if(this.events) this.$on(this.events);
  if(template){
    this.group = this.$compile(this.template);
    this.element = combine.node(this);
  }

  this.$emit({type: 'init', stop: true });
  if(this.$root===this) this.$update();
  if( this.init ) this.init(this.data);

  // children is not required;
}


// description
// -------------------------
// 1. Regular and derived Class use same filter
_.extend(Regular, {
  // private data stuff
  _directives: { __regexp__:[] },
  _components: {},
  _filters: {},
  _events: {},
  _plugins: {},

  _exprCache:{},


  __after__: function(supr, o) {


    if(o.computed){
      
    }

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
  expression: function(expr){
    // @TODO cache
    if(typeof expr === 'string'){
      var expr = expr.trim();
      expr = this._exprCache[expr] || (this._exprCache[expr] = new Parser(expr,{state: 'JST'}).expression());
    }
    var res = _.touchExpression(expr);
    return res;
  },
  parse: function(template){
    return new Parser(template).parse();
  },

  Parser: Parser,
  Lexer: Lexer,

  _inheritConfig: function(self, supr){

    // prototype inherit some Regular property
    // so every Component will have own container to serve directive, filter etc..
    var defs =['use', 'directive', 'event', 'filter', 'component'] 
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
Event.mixTo(Regular)

Regular.implement({

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
        var path = Regular.expression(path);
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
    };
    (this.$context || this).$digest();
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

    if(this.context){
      for(var i in context);
    }

    if(Array.isArray(expr)){
      // @todo 只需要watch一次
      var tests = [];
      for(var i=0,len = expr.length; i < len; i++){
          tests.push(Regular.expression(expr[i]).get) 
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
      var expr = Regular.expression(expr);
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
  destroy: function(){
    // destroy event wont propgation;
    this.$emit({type: 'destroy', stop: true });

    this.group && this.group.destroy();
    this.group = null;
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
    if(!fragment) return;
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
    if(typeof ast === 'string') return doc.createTextNode(ast)
    return walkers[ast.type || "default"].call(this, ast);
  },
  // find filter
  _f: function(name){
    var Component = this.constructor;
    var filter = Component.filter(name);
    if(typeof filter !== 'function') throw 'filter ' + name + 'is undefined';
    return filter;
  }
});

module.exports = Regular;

var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");
var node = require("./parser/node.js");
var dom = require("./dom.js");
var Group = require('./group.js');
var _ = require('./util');
var Event = require('./helper/event.js');
var combine = require('./helper/combine.js');
var idtest = /^[\w-]{1,20}$/;





var Regular = function( data, options){
  var template, node, name;
  if(typeof data === 'string'){
    template = data;
    if(idtest.test(template) && (node= dom.id(template))){
      template = node.innerHTML;
    }
    if(typeof template == 'string'){
      this.template = new Parser(template).parse();
    }
    data = options;
    options = arguments[2];
  }
  options = options || {};
  this.$watchers = [];
  this.$children = [];
  this.$refs = {};
  this.$parent = options.$parent;
  this.context = this.context || this;
  if( typeof this.template === 'undefined' )  throw "template is required";
  this.data= data || {};
  this.config && this.config(this.data);
  this.group = this.$compile(this.template);
  this.element = combine.node(this);
  if(!options.$parent) this.$digest(true);
  if( this.init ) this.init.apply(this, arguments);
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
      var node, name;
      if(idtest.test(template) && (node= dom.id(template))){
        template = node.innerHTML;
        if(name = dom.attr(node, 'name')) Regular.component(name, this);
      }
      if(typeof template == 'string'){
        this.prototype.template = new Parser(template).parse();
      }
    }

  },
  derive: _.derive,
  directive: function(name, cfg){
    var directors = this._directors;
    if(cfg == null) return directors[name];
    directors[name] = cfg;
    return this;
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
            this.data[i] = path[i]
          }
        }
      }
    }
    var self = this, root = self;
    // find the root
    while(self = self.$parent){ root = self }
    root.$digest();
  },
  /**
   * two way bind with another component;
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
    // multiply same path binding through array
    if( type === 'array' ){
      for(var i = 0, len = expr1.length; i < len; i++){
        this._bind(component, expr1[i]);
      }
    }else if(type === 'object'){
      for(var i in expr1) if(expr1.hasOwnProperty(i)){
        this._bind(component, i, expr1[i]);
      }
    }else{
      this._bind(component, expr1, expr2);
    }
    // digest
    component.$update();
  },
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
        console.log(component)
        debugger
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

  _digest: function(path ,deep){
    // if(this.context) return this.context.$digest();

    var watchers = this.$watchers;
    var children = this.$children;

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
      if(_.typeOf(now) == 'object' && deep){
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


    if(children && (len = children.length)){
      for(var i = 0; i < len ; i++){
        if(children[i]._digest()) dirty = true;
      }
    }

    if(dirty) this.$emit('update');
    return dirty;
  },
  $new: function(name, data){
    var type = typeof name;
    var Component;
    if(type === 'string'){
      Component = Regular.component(name);
    }else if(type === 'function'){
      Component = name;
    }
    if(Component){
      var instance = new Component(data, { $parent: this});
      this.$children.push(instance);
    }
    return instance;
  },
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
  $watch: function(expr, fn, options){
    options = options || {};
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
        if(!equal){
          return prev;
        }else{
          return false;
        }

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
      test: test
    };

    this.$watchers.push(watcher);
    this._records && this._records.push(watcher.id);
    return uid;
  },
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
  find: function(id){
    return this.$refs[id]; 
  },
  destroy: function(){
    this.$emit({type: 'destroy', stop: true });
    this.group.destroy();
    this.$watchers = null;
    this.$children = null;
    this.$parent = null;
    this.$refs = null;
    this.$off();
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
      return this;
    },
    _path: _._path,
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
    _r: _._range
});



var walkers = {};


walkers.list = function(ast){
  var placeholder = document.createComment("Regular list");
  var Section =  Regular.derive({
    template: ast.body,
    context: this.context
  });
  var fragment = dom.fragment();
  fragment.appendChild(placeholder);
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
        var section = self.$new(Section, data);
        section.$update()
        var insert = o !== 0 && group.children[o-1]? combine.last(group.get(o-1)) : placeholder;
        placeholder.parentNode.insertBefore(combine.node(section), insert.nextSibling);
        group.children.splice(o , 0, section);
      }
      m = index + splice.add - splice.removed.length;
      m  = m < 0? 0 : m;
    }
  }

  if(ast.sequence && ast.sequence.type === 'expression'){
    var watchid = this.$watch(ast.sequence, update);
  }else{
    update(ast.sequence , _.equals( ast.sequence, []));
  }

  return {
    node: function(){
      return fragment;
    },
    group: group,
    destroy: function(){
      group.destroy();
      if(watchid) self.$unwatch(watchid);
      self = null;
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

  if(component = this.$new(ast.tag) ){
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      if(attr.name === 'ref' && value){
         this.$refs[attr.value] = component;
      }
      if(value.type === 'expression'){
        var name = attr.name;
        void function(name, value){
          if(value.set){
            component.$watch(name, function(nvalue){
              value.set(self, nvalue);
            })
          }
          self.$watch(value, function(nvalue){
            component.$update(name, nvalue);
          });
        }(name, value);
      }else{
        component.data[attr.name] = value;
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
    bindAttrWatcher.call(this, element, attrs[i])
  //   watchids.push.apply(watchids,)
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
  if(directive){
    directive.call(this, element, value);
  }else{
    if(value.type == 'expression' ){
      watchids.push(this.$watch(value, function(nvalue, old){
        dom.attr(element, name, nvalue);
      }))
    }else{
      dom.attr(element, name, value);
    }
  }
  return watchids;
}









module.exports = Regular;

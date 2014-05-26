var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");
var node = require("./parser/node.js");
var dom = require("./dom.js");
var Group = require('./group.js');
var _ = require('./util');
var Event = require('./helper/event.js');
var combine = require('./helper/combine.js');
var idtest = /^\w{1,20}$/;





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
  if( typeof this.template === 'undefined' )  throw "template is required";
  this.data= data || {};
  this.$watchers = [];
  this.$children = [];
  this.$refs = {};
  this.context = this.context || this;
  this.group = this.$compile(this.template);
  this.element = combine.node(this);
  this.$parent = options.$parent;
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
        group.ondestroy = function(){
          self.$unwatch(records);
        } 
      }
    }
    return group;
  },
  $update: function(path, value){
    if(typeof path === 'function' ){
      path.call(this, this.data);
    }else if(path){
      var base = this.data;
      var path = Regular.parse(path);
      path.set(this, value);
    }
    var self = this, root = self;
    // find the root
    while(self = self.$parent){ root = self }
    root.$digest();
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
    var expr = Regular.parse(expr);
    var watcher = { get: expr.get, fn: fn, pathes: expr.pathes , id: uid, force: options.force};

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
    this.$emit('destroy');
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
    }
});



var walkers = {};


walkers.list = function(ast){
  var placeholder = document.createComment("Regular list");
  var Section =  Regular.derive({
    template: ast.body,
    context: this.context
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
        var section = self.$new(Section, data);
        section.$update()
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

  return {
    node: function(){
      return placeholder;
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



walkers.element = function(ast){
  var attrs = ast.attrs, component;
  var watchids = [];

  if(component = this.$new(ast.tag) ){
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      if(attr.name === 'ref' && value){
         this.$refs[attr.value] = component;
      }
      if(value.type === 'expression'){
        var name = attr.name;
        watchids.push(this.$watch(value, function(nvalue){
          if(name === '&'){
            component.data = nvalue;
            component.$update();
          }else{
            component.$update(name, nvalue);
          }
        }) );
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

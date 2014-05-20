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

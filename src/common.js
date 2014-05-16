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

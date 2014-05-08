var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");
var dom = require("./dom.js");
var Scope = require('./Scope.js');
var _ = require('./util');




var Termin = function(template, data){

  var type = _.typeOf(template);
  if(type === 'object'){
    data = template;
    template = null;
  }
  if(template){
    if(type === "string"){
      template = new Parser(template).parse();
    }
    this.template = template;
  }
  this.data= {};
  _.extend(this.data , data || {});
  this.$watchers = [];
  this.$children = [];

  this.context = this.context || this;
  var fragment = this.compile(this.template);
  if(fragment.length === 1) this.node = fragment[0];
  else{
     this.node = dom.fragment();
     for(var i  = 0, len = fragment.length; i < len; i++){
      this.node.appendChild(fragment[i]);
     }
  }
  this.digest()
  if(this.init) this.init.apply(this, arguments);
}






// description
// -------------------------

// 1. Termin and derived Class use same filter
_.extend(Termin, {
  // private data stuff
  _decorators: {},
  _filters: {},
  _customers: {},

  __after__: function(supr, o) {

    var template;
    this.__after__ = supr.__after__;

    this._decorators = _.createObject( supr._decorators )
    this.exprCache = {};

    if(o.name) Termin.register(o.name, this);
    if(template = o.template){
      if(typeof template == 'string'){
        this.prototype.template = new Parser(template).parse();
      }
    }
  },
  derive: _.derive,
  decorate: function(name, cfg){
    var decorators = this._decorators;
    if(cfg == null) return decorators[name];
    decorators[name] = cfg;
    return this;

  },
  register: function(){

  },
  parse: function(expr){
    // @TODO cache
    var expr = expr.trim();
    return this.exprCache[expr] || (this.exprCache[expr] = new Parser(expr).expr());
  }
});


_.extend(Termin.prototype, {
  init: function(){

  },
  compile: function(ast){
    if(_.typeOf(ast) === 'array'){
      var res = [];
      for(var i = 0, len = ast.length; i < len; i++){
        res.push(this.compile(ast[i]));
      }
      return res;
    }
    if(typeof ast === 'string') return document.createTextNode(ast)
    return walkers[ast.type || "default"].call(this, ast);
  },
  parse: function(str){
    if(str && str.type === 'expression'){
      return str;
    }
    return new Parser(str, {state: 'JST'}).expr();
  },
  inject: function(node, direct){
    // node.appendChild(this.fragment);
  },
  set: function(path, value){
    if(typeof path === 'function' ){
      path.call(this);
      this.digest();
    }else{
      var base = this.data;
      if(typeof value !== 'undefined'){
        var spaths = path.split('.');
        for(var i=0,len=spaths.length-1;i<len;i++){
          if((base = base[spaths[i]]) == null) return ;
        }
        base[spaths[len]] = value
      }else if(~path.indexOf('.')){
        var spaths = path.split('.');
        for(var i=0,len=spaths.length;i<len;i++){
          if((base = base[spaths[i]]) == null) return ;
        }
      }else{
        base = base[path];
      }
      this.digest();
    }
  },
  get: function(path){

  },
  digest: function(){
    var watchers = this.$watchers;
    var children = this.$children;

    for(var i = 0, len = watchers.length;i<len; i++){
      var watcher = watchers[i];
      var now = watcher.get(this.data);
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
        }
      }
    }
    for(var i = 0, len = children.length; i < len ; i++){
      children[i].$digest(); 
    }
  },
  watch: function(expr, fn){
    if(typeof expr === "string") expr = new Parser(expr).expr(expr);
    var watcher = { get: expr.get.bind(this.context), fn: fn, pathes: expr.pathes };
    this.$watchers.push(watcher);
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
  var pairs = [];
  this.watch(ast.sequence, function(value){
    var props = {};
    props[ast.variable] = "dajsidajsidasid";
    props["$index"] = 1;
    var data = _.createObject(self.data, props);
    var section = new Section(data);
    // section.inject(placeholder);
  });
  return placeholder;
}

walkers.if = function(){

}

walkers.expression = function(ast){
  console.log(ast.get)
  var node = document.createTextNode();
  this.watch(ast, function(newval){
    dom.text(node, "" + newval);
  })
  return node;
}

walkers.element = function(ast){
  var element = dom.create(ast.tag);
  var attrs = ast.attrs;
  var children = ast.children;
  var child;
  for(var i = 0, len = attrs.length; i < len; i++){
    bindAttrWatcher.call(this, element, attrs[i])
  }
  if(children){
    for(var i =0, len = children.length; i < len ;i++){
      child = this.compile(children[i])
      if(child !== null) element.appendChild(child);
    }
  }
  return element;
}

function bindAttrWatcher(element, attr){
  var scope = this.$scope, 
    name = attr.name,
    value = attr.value, decorator=Termin.decorate(name);
  if(decorator){
    decorator.call(this, element, value);
  }else{
    if( value && value.type == 'expression' ){
      this.watch(value, function(nvalue){
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

    var fn = this.parse(value);
    dom.on(elem, item, function(ev){
      fn(this.data);
    });
  });
})

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
    if(!scope.$phase) scope.$digest()
  }
  v._$addEvent(elem, 'change', handler)
}

function initText(scope, elem, value, parseFn){


  scope.$watch(parseFn, function(newValue, oldValue){
    if(scope.$state('trigger') == elem) return;
    elem.value = nm.string(newValue);
  });

  var handler = throttle(function handler(ev){
    var value = this.value;
    scope.$set(value)
    scope.$apply(function(){
      parseFn.assign(value.trim())(scope);
    });
  })

  if(dom.msie !== 9 && 'oninput' in testNode ){
    elem.addEventListener('input', handler );
  }else{
    v._$addEvent(elem, 'paste', handler)
    v._$addEvent(elem, 'keyup', handler)
    v._$addEvent(elem, 'cut', handler)
  }
}

Termin.decorate('t-model', function(elem,value){
  var fn = this.parse(value);
  console.log(fn.get.toString())
})






module.exports = Termin;

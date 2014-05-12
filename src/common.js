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
  _exprCache:{},

  __after__: function(supr, o) {

    var template;
    this.__after__ = supr.__after__;

    this._decorators = _.createObject( supr._decorators )

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
  parse: function(expr){
    // @TODO cache
    if(expr.type === 'expression') return expr;
    var expr = expr.trim();
    var res = this._exprCache[expr] || (this._exprCache[expr] = new Parser(expr,{state: 'JST'}).expression());
    return res;
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
  inject: function(node, direct){
    direct = direct || 'bottom';
    // node.appendChild(this.fragment);
  },
  set: function(path, value){
    if(typeof path === 'function' ){
      path.call(this, this.data);
      this.digest();
    }else if(path){
      var base = this.data;
      var path = Termin.parse(path);
      path.set.call(this, value);
      this.digest();
    }
  },
  _path: _._path,
  digest: function(){
    var watchers = this.$watchers;
    var children = this.$children;

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
        }
      }
    }
    for(var i = 0, len = children.length; i < len ; i++){
      children[i].$digest(); 
    }
  },
  destroy: function(){

  },
  watch: function(expr, fn){
    var expr = Termin.parse(expr);
    var watcher = { get: expr.get, fn: fn, pathes: expr.pathes };
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
  var sections = [];
  this.watch(ast.sequence, function(newValue, splices){
    if(!splices || !splices.length) return;
    var cur = placeholder;
    var m = 0,
      len=newValue.length,
      mIndex = splices[0].index;
    for(var i=0; i < splices.length; i++){
      var splice = splices[i];
      var index = splice.index;
      for(var k=m; k<index; k++){
        var pair = pairs[k];
        pair.scope.$index = k;
      }
      for(var j=0,jlen = splice.removed.length; j< jlen; j++){
        var removed = pairs.splice(index,1)[0];
        removed.$elem._$off()._$remove();
        removed.scope.$destroy();
        removed.scope =null;
        removed = null;
      }
      for(var o=index; o < index + splice.add; o++){
        var childScope = scope.$new();
        childScope.$index = o;
        childScope[matched[1]] = newValue[o]
        var $celem = $elem._$clone(true);
        var insert = pairs[o-1]? pairs[o-1].$elem[0]: start;
        parent.insertBefore($celem[0], insert.nextSibling);
        bootstrap( childScope, $celem[0], { skip: 'nm-repeat' } );
        pairs.splice(o,0, {
          $elem: $celem,
          scope: childScope
        });
      }
      m = index + splice.add - splice.removed.length;
      m  = m<0? 0:m;
    }
    if(m < len){
      for(var i = m; i < len; i++){
        var pair = pairs[i];
        pair.scope.$index = i;
      }
    }
    pairs.forEach(function(pair){
      pair.scope.$digest();
    })
  });
  return {
    created: function(){
      return 
    },
    removed: function(){

    }
  }
  return placeholder;
}

walkers.if = function(){

}

walkers.expression = function(ast){
  var node = document.createTextNode("");
  this.watch(ast, function(newval){
    dom.text(node, "" + (newval||""));
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
  var name = attr.name,
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
    if(!value) return;
    var self = this;
    dom.on(elem, item, function(){
      value.get(self);
      self.digest();
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
  this.watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    elem.value = newValue == null? "": "" + newValue;
  });

  var handler = _.throttle(function handler(ev){
    var value = this.value;
    parsed.set(self, value);
    inProgress= true;
    self.digest();
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






module.exports = Termin;

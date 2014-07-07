var node = require("./parser/node.js");
var dom = require("./dom.js");
var Group = require('./group.js');
var _ = require('./util');
var combine = require('./helper/combine.js');

var walkers = module.exports = {};

walkers.list = function(ast){
  var placeholder = document.createComment("Regular list");
  // proxy Component to implement list item, so the behaviar is similar with angular;
  var Section =  Regular.extend( { 
    template: ast.body, 
    $context: this.$context, 
  });
  Regular._inheritConfig(Section, this.constructor);

  var fragment = dom.fragment();
  fragment.appendChild(placeholder);
  var self = this;
  var group = new Group();
  var indexName = ast.variable + '_index';
  var variable = ast.variable;
  // group.push(placeholder);




  function update(newValue, splices){
    if(!splices || !splices.length) return;
    var cur = placeholder;
    var m = 0, len=newValue.length,
      mIndex = splices[0].index;

    for(var i=0; i < splices.length; i++){ //init
      var splice = splices[i];
      var index = splice.index;

      for(var k=m; k<index; k++){ // no change
        var sect = group.get(k);
        sect.data[indexName] = k;
      }
      for(var j = 0,jlen = splice.removed.length; j< jlen; j++){ //removed
        var removed = group.children.splice( index, 1)[0];
        // var removed = group.children.splice(j,1)[0];
        var parent = removed.$parent
        removed.destroy();
      }

      for(var o=index; o < index + splice.add; o++){ //add
        // prototype inherit
        var item = newValue[o];
        var data = _.createObject(self.data);
        data[indexName] = o;
        data[variable] = item;

        var section = new Section({data: data });

        var update = section.$digest.bind(section);

        self.$on('digest', update);
        section.$on('destroy', self.$off.bind(self, 'digest', update));
        // autolink
        var insert = o !== 0 && group.children[o-1]? combine.last(group.get(o-1)) : placeholder;
        insert.parentNode.insertBefore(combine.node(section), insert.nextSibling);
        group.children.splice(o , 0, section);
      }
      m = index + splice.add - splice.removed.length;
      m  = m < 0? 0 : m;

    }
    if(m < len){
      for(var i = m; i < len; i++){
        var pair = group.get(i);
        pair.data[indexName] = i;
      }
    }
  }


  var watchid = this.$watch(ast.sequence, update);

  return {
    node: function(){
      return fragment;
    },
    group: group,
    destroy: function(){
      group.destroy();

      dom.remove(placeholder);
      if(watchid) self.$unwatch(watchid);
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
  var fragment = dom.fragment();
  fragment.appendChild(placeholder);

  var self = this;
  function update(nvalue, old){
    if(!!nvalue){ //true
      if(consequent) return;
      consequent = self.$compile( ast.consequent , true)
      node = combine.node(consequent); //return group
      if(alternate){ alternate.destroy() };
      alternate = null;
      // @TODO
      placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
    }else{ //false
      if(alternate) return;
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
      return fragment;
    },
    last: function(){
      var group = consequent || alternate;
      return group && group.last();
    },
    destroy: function destroy(){
      if(alternate) alternate.destroy();
      if(consequent) consequent.destroy();
      dom.remove(placeholder);
    }
  }
}


walkers.expression = function(ast){
  var node = document.createTextNode("");
  var watchid = this.$watch(ast, function(newval){
    dom.text(node, "" + (newval == null? "": String(newval)));
  })
  return node;
}
walkers.text = function(ast){
  var node = document.createTextNode(ast.text);
  return node;
}


var eventReg = /^on-(.+)$/

walkers.element = function(ast){
  var attrs = ast.attrs, 
    component, self = this,
    Constructor=this.constructor,
    children = ast.children,
    Component = Constructor.component(ast.tag);


  if(children && children.length){
    var group = this.$compile(children);
  }
  // make the directive after attribute
  attrs.sort(function(a, b){
    var da = Constructor.directive(a.name);
    var db = Constructor.directive(b.name);

    if(!db) return !da? 0: 1;
    if(!da) return -1;
    return (b.priority||1) - (a.priority||1);
  })


  if(Component){
    var data = {},events;
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      _.touchExpression(value);
      var name = attr.name;
      var etest = name.match(eventReg);

      // bind event proxy
      if(etest){
        events = events || {};
        if(typeof value === 'string') value = Regular.expression(value);
        var fn  = value.get(self);
        events[etest[1]] = fn.bind(this);
        continue;
      }

      if(value.type !== 'expression'){
        data[attr.name] = value;
      }
    }

    if(ast.children) var $body = this.$compile(ast.children);
    var component = new Component({data: data, events: events, $body: $body, $root: self.$root||self});
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      if(value.type === 'expression' && attr.name.indexOf('on-')===-1){
        this.$bind(component, value, attr.name);
      }
    }
    return component;
  }else if(ast.tag === 'r-content' && this.$body){
    return this.$body;
  }

  if(ast.tag === 'svg') this._ns_ = 'svg';
  var element = dom.create(ast.tag, this._ns_, attrs);
  var destroies = [];
  var child;
  var directive = [];
  for(var i = 0, len = attrs.length; i < len; i++){
    bindAttrWatcher.call(this, element, attrs[i],destroies)
  }
  if(ast.tag === 'svg') this._ns_ = null;



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
      if(destroies.length) {
        destroies.forEach(function(destroy){destroy() })
      }
      dom.remove(element);
    }
  }
}

// dada

function bindAttrWatcher(element, attr, destroies){
  var Component = this.constructor;
  var self = this;
  var name = attr.name,
    value = attr.value || "", directive = Component.directive(name);

  _.touchExpression(value);


  if(directive && directive.link){
    var destroy = directive.link.call(self, element, value, name);
    if(typeof destroy === 'function') destroies.push(destroy);
  }else{
      
    if(value.type == 'expression' ){
      this.$watch(value, function(nvalue, old){
        dom.attr(element, name, nvalue);
      });
    }else{
      if(_.isBooleanAttr(name)){
        dom.attr(element, name, true);
      }else{
        dom.attr(element, name, value);
      }
    }
  }
  
}

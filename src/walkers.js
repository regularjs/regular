var node = require("./parser/node.js");
var dom = require("./dom.js");
var Group = require('./group.js');
var _ = require('./util');
var combine = require('./helper/combine.js');

var walkers = module.exports = {};

walkers.list = function(ast){
  var placeholder = document.createComment("Regular list");
  var Section =  Regular.extend({
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
  if(directive && directive.link){
    directive.link.call(this, element, value, name);
  }else{
    if(value.type == 'expression' ){
      watchids.push(this.$watch(value, function(nvalue, old){
        dom.attr(element, name, nvalue);
      }));
    }else{
      if(_.isBooleanAttr(name)){
        dom.attr(element, name, true);
      }else{
        dom.attr(element, name, value);
      }
    }
  }
  return watchids;
}

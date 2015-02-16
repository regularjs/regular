var node = require("./parser/node.js");
var dom = require("./dom.js");
var animate = require("./helper/animate.js");
var Group = require('./group.js');
var _ = require('./util');
var combine = require('./helper/combine.js');

var walkers = module.exports = {};

walkers.list = function(ast, options){

  var Regular = walkers.Regular;  
  var placeholder = document.createComment("Regular list"),
    namespace = options.namespace,
    extra = options.extra;
  var self = this;
  var group = new Group();
  group.push(placeholder);
  var indexName = ast.variable + '_index';
  var variable = ast.variable;

  function update(newValue, splices){
    if(!newValue) {
      newValue = [];
      splices = _.equals(newValue, splices);
    }
    
    if(!splices || !splices.length) return;
    var cur = placeholder;
    var m = 0, len = newValue.length,
      mIndex = splices[0].index;

    for(var i = 0; i < splices.length; i++){ //init
      var splice = splices[i];
      var index = splice.index; // beacuse we use a comment for placeholder

      for(var k = m; k < index; k++){ // no change
        var sect = group.get( k + 1 );
        sect.data[indexName] = k;
      }
      for(var j = 0, jlen = splice.removed.length; j< jlen; j++){ //removed
        var removed = group.children.splice( index + 1, 1)[0];
        removed.destroy(true);
      }

      for(var o = index; o < index + splice.add; o++){ //add
        // prototype inherit
        var item = newValue[o];
        var data = {};
        data[indexName] = o;
        data[variable] = item;

        _.extend(data, extra);
        var section = self.$compile(ast.body, {
          extra: data,
          namespace:namespace,
          record: true,
          outer: options.outer
        })
        section.data = data;
        // autolink
        var insert =  combine.last(group.get(o));
        if(insert.parentNode){
          animate.inject(combine.node(section),insert, 'after');
        }
        // insert.parentNode.insertBefore(combine.node(section), insert.nextSibling);
        group.children.splice( o + 1 , 0, section);
      }
      m = index + splice.add - splice.removed.length;
      m  = m < 0? 0 : m;

    }
    if(m < len){
      for(var i = m; i < len; i++){
        var pair = group.get(i + 1);
        pair.data[indexName] = i;
      }
    }
  }

  this.$watch(ast.sequence, update, { init: true });
  return group;
}
// {#include }
walkers.template = function(ast, options){
  var content = ast.content, compiled;
  var placeholder = document.createComment('inlcude');
  var compiled, namespace = options.namespace, extra = options.extra;
  // var fragment = dom.fragment();
  // fragment.appendChild(placeholder);
  var group = new Group();
  group.push(placeholder);
  if(content){
    var self = this;
    this.$watch(content, function(value){
      if( compiled = group.get(1)){
        compiled.destroy(true); 
        group.children.pop();
      }
      group.push( compiled =  self.$compile(value, {record: true, outer: options.outer,namespace: namespace, extra: extra}) ); 
      if(placeholder.parentNode) animate.inject(combine.node(compiled), placeholder, 'before')
    }, {
      init: true
    });
  }
  return group;
};


// how to resolve this problem
var ii = 0;
walkers['if'] = function(ast, options){
  var self = this, consequent, alternate, extra = options.extra;
  if(options && options.element){ // attribute inteplation
    var update = function(nvalue){
      if(!!nvalue){
        if(alternate) combine.destroy(alternate)
        if(ast.consequent) consequent = self.$compile(ast.consequent, {record: true, element: options.element , extra:extra});
      }else{
        if(consequent) combine.destroy(consequent)
        if(ast.alternate) alternate = self.$compile(ast.alternate, {record: true, element: options.element, extra: extra});
      }
    }
    this.$watch(ast.test, update, { force: true });
    return {
      destroy: function(){
        if(consequent) combine.destroy(consequent);
        else if(alternate) combine.destroy(alternate);
      }
    }
  }

  var test, consequent, alternate, node;
  var placeholder = document.createComment("Regular if" + ii++);
  var group = new Group();
  group.push(placeholder);
  var preValue = null, namespace= options.namespace;


  var update = function (nvalue, old){
    var value = !!nvalue;
    if(value === preValue) return;
    preValue = value;
    if(group.children[1]){
      group.children[1].destroy(true);
      group.children.pop();
    }
    if(value){ //true
      if(ast.consequent && ast.consequent.length){
        consequent = self.$compile( ast.consequent , {record:true, outer: options.outer,namespace: namespace, extra:extra })
        // placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
        group.push(consequent);
        if(placeholder.parentNode){
          animate.inject(combine.node(consequent), placeholder, 'before');
        }
      }
    }else{ //false
      if(ast.alternate && ast.alternate.length){
        alternate = self.$compile(ast.alternate, {record:true, outer: options.outer,namespace: namespace, extra:extra});
        group.push(alternate);
        if(placeholder.parentNode){
          animate.inject(combine.node(alternate), placeholder, 'before');
        }
      }
    }
  }
  this.$watch(ast.test, update, {force: true, init: true});

  return group;
}


walkers.expression = function(ast, options){
  var node = document.createTextNode("");
  this.$watch(ast, function(newval){
    dom.text(node, "" + (newval == null? "": "" + newval) );
  })
  return node;
}
walkers.text = function(ast, options){
  var node = document.createTextNode(_.convertEntity(ast.text));
  return node;
}



var eventReg = /^on-(.+)$/

/**
 * walkers element (contains component)
 */
walkers.element = function(ast, options){
  var attrs = ast.attrs, 
    component, self = this,
    Constructor=this.constructor,
    children = ast.children,
    namespace = options.namespace, ref, group, 
    extra = options.extra,
    isolate = 0,
    Component = Constructor.component(ast.tag);


  if(ast.tag === 'svg') namespace = "svg";




  if(Component){
    var data = {},events;
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = this._touchExpr(attr.value || "");
      
      var name = attr.name;
      var etest = name.match(eventReg);
      // bind event proxy
      if(etest){
        events = events || {};
        events[etest[1]] = _.handleEvent.call(this, value, etest[1]);
        continue;
      }

      if(value.type !== 'expression'){
        data[attr.name] = value;
      }else{
        data[attr.name] = value.get(self); 
      }
      if( attr.name === 'ref'  && value != null){
        ref = value.type === 'expression'? value.get(self): value;
      }
      if( attr.name === 'isolate'){
        // 1: stop: composite -> parent
        // 2. stop: composite <- parent
        // 3. stop 1 and 2: composite <-> parent
        // 0. stop nothing (defualt)
        isolate = value.type === 'expression'? value.get(self): parseInt(value || 3, 10);
        data.isolate = isolate;
      }


    }

    var config = { 
      data: data, 
      events: events, 
      $parent: this,
      $outer: options.outer,
      namespace: namespace, 
      $root: this.$root,
      $body: ast.children
    }

    var component = new Component(config);
    if(ref &&  self.$refs) self.$refs[ref] = component;
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      if(value.type === 'expression' && attr.name.indexOf('on-')===-1){
        value = self._touchExpr(value);
        // use bit operate to control scope
        if( !(isolate & 2) ) 
          this.$watch(value, component.$update.bind(component, attr.name))
        if( value.set && !(isolate & 1 ) ) 
          // sync the data. it force the component don't trigger attr.name's first dirty echeck
          component.$watch(attr.name, self.$update.bind(self, value), {sync: true});
      }
    }
    if(ref){
      component.$on('destroy', function(){
        if(self.$refs) self.$refs[ref] = null;
      })
    }
    return component;
  }
  else if( ast.tag === 'r-content' && this._getTransclude ){
    return this._getTransclude();
  }
  
  if(children && children.length){
    group = this.$compile(children, {outer: options.outer,namespace: namespace, extra: extra });
  }

  var element = dom.create(ast.tag, namespace, attrs);
  // context element

  var child;

  if(group && !_.isVoidTag(ast.tag)){
    dom.inject( combine.node(group) , element)
  }

  // sort before
  attrs.sort(function(a1, a2){
    var d1 = Constructor.directive(a1.name),
      d2 = Constructor.directive(a2.name);
    if(d1 && d2) return (d2.priority || 1) - (d1.priority || 1);
    if(d1) return 1;
    if(d2) return -1;
    if(a2.name === "type") return 1;
    return -1;
  })
  // may distinct with if else
  var destroies = walkAttributes.call(this, attrs, element, destroies);



  var res  = {
    type: "element",
    group: group,
    node: function(){
      return element;
    },
    last: function(){
      return element;
    },
    destroy: function(first){
      if( first ){
        animate.remove( element, group? group.destroy.bind( group ): _.noop );
      }else if(group) {
        group.destroy();
      }
      // destroy ref
      if( destroies.length ) {
        destroies.forEach(function( destroy ){
          if( destroy ){
            if( typeof destroy.destroy === 'function' ){
              destroy.destroy()
            }else{
              destroy();
            }
          }
        })
      }
    }
  }
  return res;
}

function walkAttributes(attrs, element){
  var bindings = []
  for(var i = 0, len = attrs.length; i < len; i++){
    var binding = this._walk(attrs[i], {element: element, fromElement: true, attrs: attrs})
    if(binding) bindings.push(binding);
  }
  return bindings;
}

walkers.attribute = function(ast ,options){
  var attr = ast;
  var Component = this.constructor;
  var self = this;
  var element = options.element;
  var name = attr.name,
    value = attr.value || "", directive = Component.directive(name);

  value = this._touchExpr(value);


  if(directive && directive.link){
    var binding = directive.link.call(self, element, value, name, options.attrs);
    if(typeof binding === 'function') binding = {destroy: binding}; 
    return binding;
  }else{
    if( name === 'ref'  && value != null && options.fromElement){
      var ref = value.type === 'expression'? value.get(self): value;
      var refs = this.$refs;
      if(refs){
        refs[ref] = element
        return {
          destroy: function(){
            refs[ref] = null;
          }
        }
      }
    }
    if(value.type === 'expression' ){

      this.$watch(value, function(nvalue, old){
        dom.attr(element, name, nvalue);
      }, {init: true});
    }else{
      if(_.isBooleanAttr(name)){
        dom.attr(element, name, true);
      }else{
        dom.attr(element, name, value);
      }
    }
    if(!options.fromElement){
      return {
        destroy: function(){
          dom.attr(element, name, null);
        }
      }
    }
  }

}


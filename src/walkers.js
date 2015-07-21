var node = require("./parser/node.js");
var dom = require("./dom.js");
var animate = require("./helper/animate.js");
var Group = require('./group.js');
var _ = require('./util');
var combine = require('./helper/combine.js');
var diffArray = require('./helper/arrayDiff.js');

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
  var alternate = ast.alternate;
  var track = ast.track, keyOf, extraObj;
  if(track && track !== true){
    track = this._touchExpr(track);
    extraObj = _.createObject(extra);
    keyOf = function( item, index ){
      extraObj[ variable ] = item;
      extraObj[ indexName ] = index;
      return track.get( self, extraObj );
    }
  }
  function removeRange(index, rlen){
    for(var j = 0; j< rlen; j++){ //removed
      var removed = group.children.splice( index + 1, 1)[0];
      removed.destroy(true);
    }
  }
  function addRange(index, end, newValue){
    for(var o = index; o < end; o++){ //add
      // prototype inherit
      var item = newValue[o];
      var data = {};
      data[indexName] = o;
      data[variable] = item;

      data = _.createObject(extra, data);
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
  }

  function updateRange(start, end, newValue){
    for(var k = start; k < end; k++){ // no change
      var sect = group.get( k + 1 );
      sect.data[ indexName ] = k;
      sect.data[ variable ] = newValue[k];
    }
  }

  function updateLD(newValue, oldValue, splices){
    if(!newValue) {
      newValue = [];
      splices = diffArray(newValue, oldValue);
    }
     
    if(!splices || !splices.length) return;
    var cur = placeholder;
    var m = 0, len = newValue.length;
      

    for(var i = 0; i < splices.length; i++){ //init
      var splice = splices[i];
      var index = splice.index; // beacuse we use a comment for placeholder
      var removed = splice.removed;
      var add = splice.add;
      var rlen = removed.length;
      // for track
      if( track && rlen && add ){
        var minar = Math.min(rlen, add);
        var tIndex = 0;
        while(tIndex < minar){
          if( keyOf(newValue[index], index) !== keyOf( removed[0], index ) ){
            removeRange(index, 1)
            addRange(index, index+1, newValue)
          }
          removed.shift();
          add--;
          index++;
          tIndex++;
        }
        rlen = removed.length;
      }
      // update
      updateRange(m, index, newValue);
      removeRange( index ,rlen)

      addRange(index, index+add, newValue)

      m = index + add - rlen;
      m  = m < 0? 0 : m;

    }
    if(m < len){
      for(var i = m; i < len; i++){
        var pair = group.get(i + 1);
        pair.data[indexName] = i;
      }
    }
  }

  // if the track is constant test.
  function updateSimple(newValue, oldValue){
    newValue = newValue || [];
    oldValue  = oldValue || [];

    var nlen = newValue.length || 0;
    var olen = oldValue.length || 0;
    var mlen = Math.min(nlen, olen);


    updateRange(0, mlen, newValue)
    if(nlen < olen){ //need add
      removeRange(nlen, olen-nlen);
    }else if(nlen > olen){
      addRange(olen, nlen, newValue);
    }
  }

  function update(newValue, oldValue, splices){
    var nlen = newValue && newValue.length;
    var olen = oldValue && oldValue.length;
    if( !olen && nlen && group.get(1)){
      var altGroup = group.children.pop();
      if(altGroup.destroy)  altGroup.destroy(true);
    }

    if(track === true){
      updateSimple(newValue, oldValue, splices)
    }else{
      updateLD(newValue, oldValue, splices)
    }

    // @ {#list} {#else}
    if( !nlen && alternate && alternate.length){
      var section = self.$compile(alternate, {
        extra: extra,
        record: true,
        outer: options.outer,
        namespace: namespace
      })
      group.children.push(section);
      if(placeholder.parentNode){
        animate.inject(combine.node(section), placeholder, 'after');
      }
    }
  }


  this.$watch(ast.sequence, update, { init: true, indexTrack: track === true });
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
    is,
    Component = Constructor.component(ast.tag);


  if(ast.tag === 'svg') namespace = "svg";


  if(Component || ast.tag === 'r-component'){
    var data = {},events;
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = this._touchExpr(attr.value||true);
      var name = attr.name
      if(!attr.event){
        var etest = name.match(eventReg);
        // event: 'nav'
        if(etest) attr.event = etest[1];
      }
      
      // @if is r-component . we need to find the target Component
      if(name === 'is' && !Component){
        is = value;
        var componentName = this.$get(value, true);
        Component = Constructor.component(componentName)
        if(typeof Component !== 'function') throw new Error("component " + componentName + " has not registed!");
      }
      // bind event proxy
      var eventName;
      if(eventName = attr.event){
        events = events || {};
        events[eventName] = _.handleEvent.call(this, value, eventName);
        continue;
      }else{
        name = attr.name = _.camelCase(name);
      }

      if(value.type !== 'expression'){
        data[name] = value;
      }else{
        data[name] = value.get(self); 
      }
      if( name === 'ref'  && value != null){
        ref = value.type === 'expression'? value.get(self): value;
      }
      if( name === 'isolate'){
        // 1: stop: composite -> parent
        // 2. stop: composite <- parent
        // 3. stop 1 and 2: composite <-> parent
        // 0. stop nothing (defualt)
        isolate = value.type === 'expression'? value.get(self): parseInt(value === true? 3: value, 10);
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
      var value = attr.value||true;
      var name = attr.name;
      if(value.type === 'expression' && !attr.event){
        value = self._touchExpr(value);
        // use bit operate to control scope
        if( !(isolate & 2) ) 
          this.$watch(value, component.$update.bind(component, name))
        if( value.set && !(isolate & 1 ) ) 
          // sync the data. it force the component don't trigger attr.name's first dirty echeck
          component.$watch(name, self.$update.bind(self, value), {sync: true});
      }
    }
    if(ref){
      component.$on('destroy', function(){
        if(self.$refs) self.$refs[ref] = null;
      })
    }
    if(is && is.type === 'expression'  ){
      var group = new Group();
      group.push(component);
      this.$watch(is, function(value){
        // found the new component
        var Component = Constructor.component(value);
        if(!Component) throw new Error("component " + value + " has not registed!");
        var ncomponent = new Component(config);
        var component = group.children.pop();
        group.push(ncomponent);
        ncomponent.$inject(combine.last(component), 'after')
        component.destroy();
        if(ref){
          self.$refs[ref] = ncomponent;
        }
      }, {sync: true})
      return group;
    }
    return component;
  } else if( ast.tag === 'r-content' && this._getTransclude ){
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
  var destroies = walkAttributes.call(this, attrs, element, extra);



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

function walkAttributes(attrs, element, extra){
  var bindings = []
  for(var i = 0, len = attrs.length; i < len; i++){
    var binding = this._walk(attrs[i], {element: element, fromElement: true, attrs: attrs, extra: extra})
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

  var constant = value.constant;


  value = this._touchExpr(value);

  if(constant) value = value.get(this);

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


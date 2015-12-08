var diffArray = require('./helper/diff.js').diffArray;
var combine = require('./helper/combine.js');
var animate = require("./helper/animate.js");
var node = require("./parser/node.js");
var Group = require('./group.js');
var dom = require("./dom.js");
var _ = require('./util');


var walkers = module.exports = {};

walkers.list = function(ast, options){

  var Regular = walkers.Regular;  
  var placeholder = document.createComment("Regular list"),
    namespace = options.namespace,
    extra = options.extra;
  var self = this;
  var group = new Group([placeholder]);
  var indexName = ast.variable + '_index';
  var keyName = ast.variable + '_key';
  var variable = ast.variable;
  var alternate = ast.alternate;
  var track = ast.track, keyOf, extraObj;

  if( track && track !== true ){
    track = this._touchExpr(track);
    extraObj = _.createObject(extra);
    keyOf = function( item, index ){
      extraObj[ variable ] = item;
      extraObj[ indexName ] = index;
      // @FIX keyName
      return track.get( self, extraObj );
    }
  }

  function removeRange(index, rlen){
    for(var j = 0; j< rlen; j++){ //removed
      var removed = group.children.splice( index + 1, 1)[0];
      if(removed) removed.destroy(true);
    }
  }

  function addRange(index, end, newList, rawNewValue){
    for(var o = index; o < end; o++){ //add
      // prototype inherit
      var item = newList[o];
      var data = {};
      updateTarget(data, o, item, rawNewValue);

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

  function updateTarget(target, index, item, rawNewValue){

      target[ indexName ] = index;
      if( rawNewValue ){
        target[ keyName ] = item;
        target[ variable ] = rawNewValue[ item ];
      }else{
        target[ variable ] = item;
        target[keyName] = null
      }
  }


  function updateRange(start, end, newList, rawNewValue){
    for(var k = start; k < end; k++){ // no change
      var sect = group.get( k + 1 ), item = newList[ k ];
      updateTarget(sect.data, k, item, rawNewValue);
    }
  }

  function updateLD(newList, oldList, splices , rawNewValue ){

    var cur = placeholder;
    var m = 0, len = newList.length;

    if(!splices && (len !==0 || oldList.length !==0)  ){
      splices = diffArray(newList, oldList, true);
    }

    if(!splices || !splices.length) return;
      
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
          if( keyOf(newList[index], index) !== keyOf( removed[0], index ) ){
            removeRange(index, 1)
            addRange(index, index+1, newList, rawNewValue)
          }
          removed.shift();
          add--;
          index++;
          tIndex++;
        }
        rlen = removed.length;
      }
      // update
      updateRange(m, index, newList, rawNewValue);

      removeRange( index ,rlen)

      addRange(index, index+add, newList, rawNewValue)

      m = index + add - rlen;
      m  = m < 0? 0 : m;

    }
    if(m < len){
      for(var i = m; i < len; i++){
        var pair = group.get(i + 1);
        pair.data[indexName] = i;
        // @TODO fix keys
      }
    }
  }

  // if the track is constant test.
  function updateSimple(newList, oldList, rawNewValue ){

    var nlen = newList.length;
    var olen = oldList.length;
    var mlen = Math.min(nlen, olen);

    updateRange(0, mlen, newList, rawNewValue)
    if(nlen < olen){ //need add
      removeRange(nlen, olen-nlen);
    }else if(nlen > olen){
      addRange(olen, nlen, newList, rawNewValue);
    }
  }

  function update(newValue, oldValue, splices){

    var nType = _.typeOf( newValue );
    var oType = _.typeOf( oldValue );

    var newList = getListFromValue( newValue, nType );
    var oldList = getListFromValue( oldValue, oType );

    var rawNewValue;


    var nlen = newList && newList.length;
    var olen = oldList && oldList.length;

    // if previous list has , we need to remove the altnated section.
    if( !olen && nlen && group.get(1) ){
      var altGroup = group.children.pop();
      if(altGroup.destroy)  altGroup.destroy(true);
    }

    if( nType === 'object' ) rawNewValue = newValue;

    if(track === true){
      updateSimple( newList, oldList,  rawNewValue );
    }else{
      updateLD( newList, oldList, splices, rawNewValue );
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

  this.$watch(ast.sequence, update, { 
    init: true, 
    diff: track !== true ,
    deep: true
  });
  return group;
}


function updateItem(){
  
}


// {#include } or {#inc template}
walkers.template = function(ast, options){
  var content = ast.content, compiled;
  var placeholder = document.createComment('inlcude');
  var compiled, namespace = options.namespace, extra = options.extra;
  var group = new Group([placeholder]);
  if(content){
    var self = this;
    this.$watch(content, function(value){
      var removed = group.get(1), type= typeof value;
      if( removed){
        removed.destroy(true); 
        group.children.pop();
      }
      if(!value) return;

      group.push( compiled = type === 'function' ? value(): self.$compile( type !== 'object'? String(value): value, {
        record: true, 
        outer: options.outer,
        namespace: namespace, 
        extra: extra}) ); 
      if(placeholder.parentNode) {
        compiled.$inject(placeholder, 'before')
      }
    }, {
      init: true
    });
  }
  return group;
};

function getListFromValue(value, type){
  return type === 'object'? _.keys(value): (
      type === 'array'? value: []
    )
}


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
  },{init: true})
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
  var attrs = ast.attrs, self = this,
    Constructor = this.constructor,
    children = ast.children,
    namespace = options.namespace, 
    extra = options.extra,
    tag = ast.tag,
    Component = Constructor.component(tag),
    ref, group, element;

  if( tag === 'r-content' ){
    _.log('r-content is deprecated, use {#inc this.$body} instead (`{#include}` as same)', 'warn');
    return this.$body && this.$body();
  } 

  if(Component || tag === 'r-component'){
    options.Component = Component;
    return walkers.component.call(this, ast, options)
  }

  if(tag === 'svg') namespace = "svg";
  // @Deprecated: may be removed in next version, use {#inc } instead
  
  if( children && children.length ){
    group = this.$compile(children, {outer: options.outer,namespace: namespace, extra: extra });
  }

  element = dom.create(tag, namespace, attrs);

  if(group && !_.isVoidTag(tag)){
    dom.inject( combine.node(group) , element)
  }

  // sort before
  if(!ast.touched){
    attrs.sort(function(a1, a2){
      var d1 = Constructor.directive(a1.name),
        d2 = Constructor.directive(a2.name);
      if( d1 && d2 ) return (d2.priority || 1) - (d1.priority || 1);
      if(d1) return 1;
      if(d2) return -1;
      if(a2.name === "type") return 1;
      return -1;
    })
    ast.touched = true;
  }
  // may distinct with if else
  var destroies = walkAttributes.call(this, attrs, element, extra);

  return {
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
}

walkers.component = function(ast, options){
  var attrs = ast.attrs, 
    Component = options.Component,
    Constructor = this.constructor,
    isolate, 
    extra = options.extra,
    namespace = options.namespace,
    ref, self = this, is;

  var data = {}, events;

  for(var i = 0, len = attrs.length; i < len; i++){
    var attr = attrs[i];
    // consider disabled   equlasto  disabled={true}
    var value = this._touchExpr(attr.value === undefined? true: attr.value);
    if(value.constant) value = attr.value = value.get(this);
    if(attr.value && attr.value.constant === true){
      value = value.get(this);
    }
    var name = attr.name;
    if(!attr.event){
      var etest = name.match(eventReg);
      // event: 'nav'
      if(etest) attr.event = etest[1];
    }

    // @compile modifier
    if(attr.mdf === 'cmpl'){
      value = _.getCompileFn(value, this, {
        record: true, 
        namespace:namespace, 
        extra: extra, 
        outer: options.outer
      })
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
    }else {
      name = attr.name = _.camelCase(name);
    }

    if(value.type !== 'expression'){
      data[name] = value;
    }else{
      data[name] = value.get(self); 
    }
    if( name === 'ref'  && value != null){
      ref = value
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

  var definition = { 
    data: data, 
    events: events, 
    $parent: (isolate & 2)? null: this,
    $root: this.$root,
    $outer: options.outer,
    _body: {
      ctx: this,
      ast: ast.children
    }
  }
  var options = {
    namespace: namespace, 
    extra: options.extra
  }


  var component = new Component(definition, options), reflink;


  if(ref && this.$refs){
    reflink = Component.directive('ref').link
    this.$on('$destroy', reflink.call(this, component, ref) )
  }
  if(ref &&  self.$refs) self.$refs[ref] = component;
  for(var i = 0, len = attrs.length; i < len; i++){
    var attr = attrs[i];
    var value = attr.value||true;
    var name = attr.name;
    // need compiled
    if(value.type === 'expression' && !attr.event){
      value = self._touchExpr(value);
      // use bit operate to control scope
      if( !(isolate & 2) ) 
        this.$watch(value, (function(name, val){
          this.data[name] = val;
        }).bind(component, name))
      if( value.set && !(isolate & 1 ) ) 
        // sync the data. it force the component don't trigger attr.name's first dirty echeck
        component.$watch(name, self.$update.bind(self, value), {sync: true});
    }
  }
  if(is && is.type === 'expression'  ){
    var group = new Group();
    group.push(component);
    this.$watch(is, function(value){
      // found the new component
      var Component = Constructor.component(value);
      if(!Component) throw new Error("component " + value + " has not registed!");
      var ncomponent = new Component(definition);
      var component = group.children.pop();
      group.push(ncomponent);
      ncomponent.$inject(combine.last(component), 'after')
      component.destroy();
      // @TODO  if component changed , we need update ref
      if(ref){
        self.$refs[ref] = ncomponent;
      }
    }, {sync: true})
    return group;
  }
  return component;
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
  var name = attr.name;
  var value = attr.value || "";
  var constant = value.constant;
  var Component = this.constructor;
  var directive = Component.directive(name);
  var element = options.element;
  var self = this;


  value = this._touchExpr(value);

  if(constant) value = value.get(this);

  if(directive && directive.link){
    var binding = directive.link.call(self, element, value, name, options.attrs);
    if(typeof binding === 'function') binding = {destroy: binding}; 
    return binding;
  } else{
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


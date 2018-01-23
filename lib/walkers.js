var diffArray = require('./helper/diff').diffArray;
var combine = require('./helper/combine');
var animate = require("./helper/animate");
var Parser = require('./parser/Parser');
var node = require("./parser/node");
var Group = require('./group');
var dom = require("./dom");
var _ = require('./util');
var consts = require('./const');
var OPTIONS = consts.OPTIONS;
var ERROR = consts.ERROR;
var MSG = consts.MSG;
var nodeCursor = require('./helper/cursor');
var config = require('./config')
var shared = require('./render/shared');
var dconst = require('./const').DIFF



var walkers = module.exports = {};

// used in walkers.list
// remove block in group

walkers.list = function(ast, options){

  var Regular = walkers.Regular;
  var placeholder = document.createComment("Regular list"),
    namespace = options.namespace,
    extra = options.extra;

  var self = this;
  var group = new Group([placeholder]);
  var children = group.children;

  var indexName = ast.variable + '_index';
  var keyName = ast.variable + '_key';
  var variable = ast.variable;
  var alternate = ast.alternate;
  var track = ast.track, keyOf, extraObj;
  var cursor = options.cursor;

  insertPlaceHolder(placeholder, cursor)


  if( track && track !== true ){

    track = this._touchExpr(track);
    extraObj = _.createObject(extra);
    keyOf = function( item, index ){
      extraObj[ variable ] = item;
      // @FIX keyName
      return track.get( self, extraObj );
    }
  }

  function removeRange(index, rlen, children, oldKeyMap){
    for(var j = 1; j <= rlen; j++){ //removed
      var removed = children[ index + j ];
      if( oldKeyMap  ){
        var mayBeReuse = keyOf(removed.data[variable]);
        // 将被复用
        if(typeof oldKeyMap[mayBeReuse] !== 'undefined') {
          if(oldKeyMap[mayBeReuse]!==null){//hasn't already moved
            removed.inject(false);
          }
          continue;
        }
      }
      removed.destroy(true);
    }
    children.splice(index+1, rlen);
  }

  function addRange(index, end, newList, rawNewValue, oldKeyMap){
    for(var o = index; o < end; o++){ //add
      // prototype inherit
      var item = newList[o];
      var section = null;

      if(oldKeyMap){
        var key = keyOf( item );
        section = oldKeyMap[key];
        // 只能复用一次
        if(section) oldKeyMap[key] = null;
        // 如果在原来的节点中可以找到，则复用原节点
      }
      var hasReusedSection = !!section;

      if(!hasReusedSection){
        var data = _.createObject(extra);
        updateTarget(data, o, item, rawNewValue);
        section = self.$compile(ast.body, {
          extra: data,
          namespace:namespace,
          record: true,
          outer: options.outer,
          cursor: cursor
        })
        section.data = data;
      }else{
        // means track reused section
        updateTarget(section.data, o, item)
      }


      // autolink
      var insert =  combine.last(group.get(o));
      if(insert.parentNode && !(cursor && cursor.node) ){
        // hasReusedSection
        (hasReusedSection?dom:animate).inject(combine.node(section),insert, 'after');
      }
      // insert.parentNode.insertBefore(combine.node(section), insert.nextSibling);
      children.splice( o + 1 , 0, section);
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

  function updateLD(newList, oldList, steps, rawNewValue ){

    var cur = placeholder;
    var m = 0, len = newList.length;

    if(!steps && (len !==0 || oldList.length !==0)  ){
      steps = diffArray(newList, oldList, true);
    }

    if(!steps || !steps.length) return;
      
    for(var i = 0; i < steps.length; i++){ //init

      var splice = steps[i];
      var index = splice.index; // beacuse we use a comment for placeholder
      var removed = splice.removed;
      var add = splice.add;
      var rlen = removed.length;
      // update
      updateRange(m, index, newList, rawNewValue);

      removeRange( index ,rlen, children)

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
      removeRange(nlen, olen-nlen, children);
    }else if(nlen > olen){
      addRange(olen, nlen, newList, rawNewValue);
    }
  }



  // oldKeyMap: 复用原来的节点
  function updateTrack( newList, oldList, steps,  rawNewValue, oldKeyMap ){
    
    for(var i =0, slen = steps.length; i < slen ;i++){
      var step = steps[i];
      switch( step.mode){
        case 0 : //remove
          removeRange(step.index, step.len, group.children, oldKeyMap);
          break;
        case 1 : //insert
          addRange(step.index, step.index + step.len, newList, rawNewValue, oldKeyMap )
          break;
      }
    }     
    var children = group.children;
    for(var j=1, len = children.length; j < len; j++){
      var child = children[j];
      if( child ){
        child.data[variable] = newList[j-1];
        child.data[indexName] = j-1
      }
    }

    
  }

  function update(newValue, oldValue, steps, oldKeyMap, isSimple){

    var nType = _.typeOf( newValue );
    var oType = _.typeOf( oldValue );

    var newList = getListFromValue( newValue, nType );
    var oldList = getListFromValue( oldValue, oType );


    var rawNewValue;


    var nlen = newList && newList.length;
    var olen = oldList && oldList.length;

    // if previous list has , we need to remove the altnated section.

    if( nType === 'object' ) rawNewValue = newValue;

    if(!olen && nlen){
      if(group.get(1)){
        var altGroup = children.pop();
        if(altGroup.destroy)  altGroup.destroy(true);
      } 
      return addRange(0, nlen, newList, rawNewValue )
    }
    // @ {#list} {#else}
    if( !nlen ){
      if(olen){
        removeRange(0, olen, group.children) 
      }
      if(alternate && alternate.length){
        var section = self.$compile(alternate, {
          extra: extra,
          record: true,
          outer: options.outer,
          namespace: namespace
        })
        children.push(section);
        if(placeholder.parentNode){
          animate.inject(combine.node(section), placeholder, 'after');
        }
      }
      return;
    }

    if(track){
      
      if( track === true || (isSimple && !steps.length) ){ // track 可能走simple update
        updateSimple( newList, oldList,  rawNewValue );
      }else{
        if(oldKeyMap){
          for(var i in oldKeyMap){
            var index= oldKeyMap[i];
            if(children[index + 1]) oldKeyMap[i]= children[index + 1];
          }
        }
        updateTrack( newList, oldList , steps, rawNewValue, oldKeyMap);
      }
      
    }else{
      updateLD( newList, oldList, steps, rawNewValue );
    }

  }

  this.$watch(ast.sequence, update, { 
    init: true, 
    keyOf: keyOf,
    diff: track!==true,
    deep: true
  });
  //@FIXIT, beacuse it is sync process, we can
  cursor = null;
  return group;
}



// {#include } or {#inc template}
walkers.template = function(ast, options){
  var content = ast.content, compiled;
  var placeholder = document.createComment('inlcude');
  var compiled, namespace = options.namespace, extra = options.extra;
  var group = new Group([placeholder]);
  var cursor = options.cursor;

  insertPlaceHolder(placeholder, cursor);

  if(content){
    var self = this;
    this.$watch(content, function(value){
      var removed = group.get(1), type= typeof value;
      if( removed){
        removed.destroy(true);
        group.children.pop();
      }
      if(!value) return;

      group.push( compiled = type === 'function' ? value(cursor? {cursor: cursor}: null): self.$compile( type !== 'object'? String(value): value, {
        record: true,
        outer: options.outer,
        namespace: namespace,
        cursor: cursor,
        extra: extra}) );
      if(placeholder.parentNode && !cursor) {
        compiled.$inject(placeholder, 'before')
      }
    }, OPTIONS.INIT);
    cursor = null;
  }
  return group;
};

function getListFromValue(value, type){
  return type === 'array'? value: (type === 'object'? _.keys(value) :  []);
}


// how to resolve this problem
var ii = 0;
walkers['if'] = function(ast, options){
  var self = this, consequent, alternate, extra = options.extra;
  if(options && options.element){ // attribute inteplation
    var update = function(nvalue){
      if(!!nvalue){
        if(alternate) combine.destroy(alternate)
        if(ast.consequent) consequent = self.$compile(ast.consequent, {
          record: true,
          element: options.element ,
          extra:extra
        });
      }else{
        if( consequent ) combine.destroy(consequent)
        if( ast.alternate ) alternate = self.$compile(ast.alternate, {record: true, element: options.element, extra: extra});
      }
    }
    this.$watch(ast.test, update, OPTIONS.FORCE);
    return {
      destroy: function(){
        if(consequent) combine.destroy(consequent);
        else if(alternate) combine.destroy(alternate);
      }
    }
  }

  var test, node;
  var placeholder = document.createComment("Regular if" + ii++);
  var group = new Group();
  group.push(placeholder);
  var preValue = null, namespace= options.namespace;
  var cursor = options.cursor;
  insertPlaceHolder(placeholder, cursor)

  var update = function (nvalue, old){
    var value = !!nvalue, compiledSection;
    if(value === preValue) return;
    preValue = value;
    if(group.children[1]){
      group.children[1].destroy(true);
      group.children.pop();
    }
    var curOptions = {
      record: true,
      outer: options.outer,
      namespace: namespace,
      extra: extra,
      cursor: cursor
    }
    if(value){ //true

      if(ast.consequent && ast.consequent.length){
        compiledSection = self.$compile( ast.consequent , curOptions );
      }
    }else{ //false
      if(ast.alternate && ast.alternate.length){
        compiledSection = self.$compile(ast.alternate, curOptions);
      }
    }
    // placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
    if(compiledSection){
      group.push(compiledSection );
      if(placeholder.parentNode && !cursor){
        animate.inject(combine.node(compiledSection), placeholder, 'before');
      }
    }
    cursor = null;
    // after first mount , we need clear this flat;
  }
  this.$watch(ast.test, update, OPTIONS.FORCE_INIT);

  return group;
}


walkers._handleMountText = function(cursor, astText){
    var node, mountNode = cursor.node;
    // fix unused black in astText;
    var nodeText = dom.text(mountNode);

    if( nodeText === astText ){
      node = mountNode;
      cursor.next();
    }else{
      // maybe have some redundancy  blank
      var index = nodeText.indexOf(astText);
      if(~index){
        node = document.createTextNode(astText);
        dom.text( mountNode, nodeText.slice(index + astText.length) );
        dom.inject(node, mountNode, 'before');
      } else {
        // if( _.blankReg.test( astText ) ){ }
        throw Error( MSG[ERROR.UNMATCHED_AST]);
      }
    }

    return node;
}


walkers.expression = function(ast, options){

  var cursor = options.cursor, node,
    mountNode = cursor && cursor.node;

  if(mountNode){
    //@BUG: if server render &gt; in Expression will cause error
    var astText = _.toText( this.$get(ast) );
    node = walkers._handleMountText(cursor, astText);

  }else{
    node = document.createTextNode("");
  }

  this.$watch(ast, function(newval){
    dom.text(node, _.toText(newval));
  }, OPTIONS.STABLE_INIT )
  return node;

}


walkers.text = function(ast, options){
  var cursor = options.cursor , node;
  var text = ast.text;
  var astText = text.indexOf('&') !== -1? _.convertEntity(text): text;

  if(cursor && cursor.node) {
    var mountNode = cursor.node;
    // maybe regularjs parser have some difference with html builtin parser when process  empty text
    // @todo error report
    if(mountNode.nodeType !== 3 ){

      if( _.blankReg.test(astText) ) return {
        code:  ERROR.UNMATCHED_AST
      }

    }else{
      node = walkers._handleMountText( cursor, astText )
    }
  }


  return node || document.createTextNode( astText );
}




/**
 * walkers element (contains component)
 */
walkers.element = function(ast, options){

  var attrs = ast.attrs, self = this,
    Constructor = this.constructor,
    children = ast.children,
    namespace = options.namespace,
    extra = options.extra,
    cursor = options.cursor,
    tag = ast.tag,
    Component = Constructor.component(tag),
    ref, group, element, mountNode;
    



  if( tag === 'r-content' ){
    _.log('r-content is deprecated, use {#inc this.$body} instead (`{#include}` as same)', 'warn');
    return this.$body && this.$body(cursor? {cursor: cursor}: null);
  }


  // if inititalized with mount mode, sometime, 
  // browser will ignore the whitespace between node, and sometimes it won't
  if(cursor ){
    // textCOntent with Empty text
    if(cursor.node && cursor.node.nodeType === 3){
      if(_.blankReg.test(dom.text(cursor.node) ) ) cursor.next();
      else if( !Component && tag !== 'r-component' ) {
        throw Error(MSG[ERROR.UNMATCHED_AST]);
      } 
    }
  }
  
  if(Component || tag === 'r-component'){
    options.Component = Component;
    return walkers.component.call(this, ast, options)
  }

  if(cursor) mountNode = cursor.node;

  if(tag === 'svg') namespace = "svg";
  // @Deprecated: may be removed in next version, use {#inc } instead

  if( children && children.length && !hasStopDirective( attrs ) ){

    var subMountNode = mountNode? mountNode.firstChild: null;
    group = this.$compile(children, {
      extra: extra ,
      outer: options.outer,
      namespace: namespace,
      cursor: nodeCursor( subMountNode, mountNode )
    });
  }


  if(mountNode){
    element = mountNode
    cursor.next();
  }else{
    element = dom.create( tag, namespace, attrs);
  }

  if(group && !_.isVoidTag( tag ) && !mountNode ){ // if not init with mount mode
    animate.inject( combine.node( group ) , element)
  }

  // fix tag ast, some infomation only avaliable at runtime (directive etc..)
  _.fixTagAST(ast, Constructor)

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
    cursor = options.cursor,
    Constructor = this.constructor,
    isolate,
    extra = options.extra,
    namespace = options.namespace,
    refDirective = walkers.Regular.directive('ref'),
    ref, self = this, is;

  var data = {}, events;

  for(var i = 0, len = attrs.length; i < len; i++){
    var attr = attrs[i];
    // consider disabled   equlasto  disabled={true}

    shared.prepareAttr( attr, attr.name === 'ref' && refDirective );

    var value = this._touchExpr(attr.value === undefined? true: attr.value);
    if(value.constant) value = attr.value = value.get(this);
    if(attr.value && attr.value.constant === true){
      value = value.get(this);
    }
    var name = attr.name;
    if(!attr.event){
      var etest = name.match(_.eventReg);
      // event: 'nav'
      if(etest) attr.event = etest[1];
    }


    // @deprecated  use 
    if(attr.mdf === 'cmpl'){
      value = _.getCompileFn(value, this, {
        record: true,
        namespace:namespace,
        extra: extra,
        outer: options.outer
      })
    }

    // title = {~ <h2>{name}</h2>}
    if(value && value.type === 'body'){
      value = _.getCompileFn(value.body, this, {
        record: true,
        namespace: namespace,
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
      name = attr.name = _.camelCase( name );
    }

    if(!value || value.type !== 'expression'){
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
    cursor: cursor,
    extra: options.extra
  }


  var component = new Component(definition, options), reflink;


  if(ref && this.$refs){
    reflink = refDirective.link;
    var refDestroy = reflink.call(this, component, ref);
    component.$on('$destroy', refDestroy);
  }
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
        }).bind(component, name), OPTIONS.SYNC)
      if( value.set && !(isolate & 1 ) )
        // sync the data. it force the component don't trigger attr.name's first dirty echeck
        component.$watch(name, self.$update.bind(self, value), OPTIONS.INIT);
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
        var refName = ref.get? ref.get(this): ref;
        self.$refs[refName] = ncomponent;
      }
    }, OPTIONS.SYNC)
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
  var Component = this.constructor;
  var name = attr.name;
  var directive = Component.directive(name);

  shared.prepareAttr(ast, directive);

  var value = attr.value || "";
  var constant = value.constant;
  var element = options.element;
  var self = this;



  value = this._touchExpr(value);

  if(constant) value = value.get(this);

  if(directive && directive.link){
    var extra = {
      attrs: options.attrs,
      param: _.getParamObj(this, attr.param)
    }
    var binding = directive.link.call(self, element, value, name, extra);
    // if update has been passed in , we will  automately watch value for user
    if( typeof directive.update === 'function'){
      if(_.isExpr(value)){
        this.$watch(value, function(val, old){
          directive.update.call(self, element, val, old, extra);
        })
      }else{
        directive.update.call(self, element, value, undefined, extra );
      }
    }
    if(typeof binding === 'function') binding = {destroy: binding};
    return binding;
  } else{
    if(value.type === 'expression' ){
      this.$watch(value, function(nvalue, old){
        dom.attr(element, name, nvalue);
      }, OPTIONS.STABLE_INIT);
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

function insertPlaceHolder(placeholder, cursor){
  if(cursor){
    if(cursor.node) dom.inject( placeholder , cursor.node,'before')
    else if(cursor.prev) {
      dom.inject( placeholder , cursor.prev,'after')
      cursor.prev = placeholder;
    }else if(cursor.parent){
      dom.inject( placeholder , cursor.parent)
      cursor.prev = placeholder
    }
  }
}


// @FIXIT
function hasStopDirective(attrs){
  for( var i = attrs.length; i--; ){
    var attr = attrs[i];
    if(attr.name === 'r-html') return true;
  }
}

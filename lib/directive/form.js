// Regular
var _ = require("../util");
var dom = require("../dom");
var OPTIONS = require('../const').OPTIONS
var STABLE = OPTIONS.STABLE;
var hasInput;
var Regular = require("../render/client");

var modelHandlers = {
  "text": initText,
  "select": initSelect,
  "checkbox": initCheckBox,
  "radio": initRadio
}


// @TODO


// autoUpdate directive for select element
// to fix r-model issue , when handle dynamic options


/**
 * <select r-model={name}> 
 *   <r-option value={value} ></r-option>
 * </select>
 */


// two-way binding with r-model
// works on input, textarea, checkbox, radio, select


Regular.directive("r-model", {
  param: ['throttle', 'lazy'],
  link: function( elem, value, name, extra ){
    var tag = elem.tagName.toLowerCase();
    var sign = tag;
    if(sign === "input") sign = elem.type || "text";
    else if(sign === "textarea") sign = "text";
    if(typeof value === "string") value = this.$expression(value);

    if( modelHandlers[sign] ) return modelHandlers[sign].call(this, elem, value, extra);
    else if(tag === "input"){
      return modelHandlers.text.call(this, elem, value, extra);
    }
  }
  //@TODO
  // ssr: function(name, value){
  //   return value? "value=" + value: ""
  // }
});





// binding <select>

function initSelect( elem, parsed, extra){
  var self = this;
  var wc = this.$watch(parsed, function(newValue){
    var children = elem.getElementsByTagName('option');
    for(var i =0, len = children.length ; i < len; i++){
      if(children[i].value == newValue){
        elem.selectedIndex = i;
        break;
      }
    }
  }, STABLE);

  function handler(){
    parsed.set(self, this.value);
    wc.last = this.value;
    self.$update();
  }
  // var isChanging = true 
  // var __change = function(){
  //   if(isChanging) return;
  //   isChanging = true;
  //   setTimeout(handler,0)
  // }

  dom.on( elem, "change", handler );

  
  if(parsed.get(self) === undefined && elem.value){
    parsed.set(self, elem.value);
  }

  return function destroy(){
    dom.off(elem, "change", handler);
    // @TODO remove __change function 
    // elem.__change = null;
  }
}

// input,textarea binding
function initText(elem, parsed, extra){
  var param = extra.param;
  var throttle, lazy = param.lazy

  if('throttle' in param){
    // <input throttle r-model>
    if(param.throttle === true){
      throttle = 400;
    }else{
      throttle = parseInt(param.throttle, 10)
    }
  }

  var self = this;
  var wc = this.$watch(parsed, function(newValue){
    if(elem.value !== newValue) elem.value = newValue == null? "": "" + newValue;
  }, STABLE);

  // @TODO to fixed event
  var isCompositing = false;
  var handler = function (ev){

    if(isCompositing) return;

    isCompositing = false;

    var that = this;
    if(ev.type==='cut' || ev.type==='paste'){
      _.nextTick(function(){
        var value = that.value
        parsed.set(self, value);
        wc.last = value;
        self.$update();
      })
    }else{
        var value = that.value
        parsed.set(self, value);
        wc.last = value;
        self.$update();
    }
  };

  function onCompositionStart(){
    isCompositing = true;
  }

  function onCompositionEnd(ev){
    isCompositing = false;
    handler.call(this,ev)
  }

  if(throttle && !lazy){
    var preHandle = handler, tid;
    handler = _.throttle(handler, throttle);
  }

  if(hasInput === undefined){
    hasInput = dom.msie !== 9 && "oninput" in document.createElement('input')
  }

  if(lazy){
    dom.on(elem, 'change', handler)
  }else{

    if(typeof CompositionEvent === 'function' ){ //lazy的情况不需要compositionend
      elem.addEventListener("compositionstart", onCompositionStart );
      elem.addEventListener("compositionend", onCompositionEnd );
    }

    if( hasInput){
      elem.addEventListener("input", handler );
    }else{
      dom.on(elem, "paste keyup cut change", handler)
    }
  }
  if(parsed.get(self) === undefined && elem.value){
     parsed.set(self, elem.value);
  }
  return function (){
    if(lazy) return dom.off(elem, "change", handler);
    if( hasInput ){
      elem.removeEventListener("input", handler );
    }else{
      dom.off(elem, "paste keyup cut change", handler)
    }
  }
}


// input:checkbox  binding

function initCheckBox(elem, parsed){
  var self = this;
  var watcher = this.$watch(parsed, function(newValue){
    dom.attr(elem, 'checked', !!newValue);
  }, STABLE);

  var handler = function handler(){
    var value = this.checked;
    parsed.set(self, value);
    watcher.last = value;
    self.$update();
  }
  if(parsed.set) dom.on(elem, "change", handler)

  if(parsed.get(self) === undefined){
    parsed.set(self, !!elem.checked);
  }

  return function destroy(){
    if(parsed.set) dom.off(elem, "change", handler)
  }
}


// input:radio binding

function initRadio(elem, parsed){
  var self = this;
  var wc = this.$watch(parsed, function( newValue ){
    if(newValue == elem.value) elem.checked = true;
    else elem.checked = false;
  }, STABLE);


  var handler = function handler(){
    var value = this.value;
    parsed.set(self, value);
    self.$update();
  }
  if(parsed.set) dom.on(elem, "change", handler)
  // beacuse only after compile(init), the dom structrue is exsit. 
  if(parsed.get(self) === undefined){
    if(elem.checked) {
      parsed.set(self, elem.value);
    }
  }

  return function destroy(){
    if(parsed.set) dom.off(elem, "change", handler)
  }
}




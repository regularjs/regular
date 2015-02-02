// Regular
var _ = require("../util.js");
var dom = require("../dom.js");
var Regular = require("../Regular.js");

var modelHandlers = {
  "text": initText,
  "select": initSelect,
  "checkbox": initCheckBox,
  "radio": initRadio
}


// @TODO


// two-way binding with r-model
// works on input, textarea, checkbox, radio, select

Regular.directive("r-model", function(elem, value){
  var tag = elem.tagName.toLowerCase();
  var sign = tag;
  if(sign === "input") sign = elem.type || "text";
  else if(sign === "textarea") sign = "text";
  if(typeof value === "string") value = this.$expression(value);

  if( modelHandlers[sign] ) return modelHandlers[sign].call(this, elem, value);
  else if(tag === "input"){
    return modelHandlers.text.call(this, elem, value);
  }
});



// binding <select>

function initSelect( elem, parsed){
  var self = this;
  var wc =this.$watch(parsed, function(newValue){
    var children = _.slice(elem.getElementsByTagName('option'))
    children.forEach(function(node, index){
      if(node.value == newValue){
        elem.selectedIndex = index;
      }
    })
  });

  function handler(){
    parsed.set(self, this.value);
    wc.last = this.value;
    self.$update();
  }

  dom.on(elem, "change", handler);
  
  if(parsed.get(self) === undefined && elem.value){
     parsed.set(self, elem.value);
  }
  return function destroy(){
    dom.off(elem, "change", handler);
  }
}

// input,textarea binding

function initText(elem, parsed){
  var self = this;
  var wc = this.$watch(parsed, function(newValue){
    if(elem.value !== newValue) elem.value = newValue == null? "": "" + newValue;
  });

  // @TODO to fixed event
  var handler = function handler(ev){
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

  if(dom.msie !== 9 && "oninput" in dom.tNode ){
    elem.addEventListener("input", handler );
  }else{
    dom.on(elem, "paste", handler)
    dom.on(elem, "keyup", handler)
    dom.on(elem, "cut", handler)
    dom.on(elem, "change", handler)
  }
  if(parsed.get(self) === undefined && elem.value){
     parsed.set(self, elem.value);
  }
  return function destroy(){
    if(dom.msie !== 9 && "oninput" in dom.tNode ){
      elem.removeEventListener("input", handler );
    }else{
      dom.off(elem, "paste", handler)
      dom.off(elem, "keyup", handler)
      dom.off(elem, "cut", handler)
      dom.off(elem, "change", handler)
    }
  }
}


// input:checkbox  binding

function initCheckBox(elem, parsed){
  var self = this;
  var watcher = this.$watch(parsed, function(newValue){
    dom.attr(elem, 'checked', !!newValue);
  });

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
  });


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

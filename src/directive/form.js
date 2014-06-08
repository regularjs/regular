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


// two-way binding with r-model
// works on input, textarea, checkbox, radio, select

Regular.directive("r-model", function(elem, value){
  var tag = elem.tagName.toLowerCase();
  var sign = tag;
  if(sign === "input") sign = elem.type || "text";
  else if(sign === "textarea") sign = "text";
  if(typeof value === "string") value = Regular.parse(value);

  if( modelHandlers[sign] ) modelHandlers[sign].call(this, elem, value);
  else if(tag === "input"){
    modelHandlers["text"].call(this, elem, value);
  }
});



// binding <select>

function initSelect( elem, parsed){
  var self = this;
  var inProgress = false;
  var value = elem.value;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    var children = _.slice(elem.getElementsByTagName('option'))
    children.forEach(function(node, index){
      if(node.value == newValue){
        elem.selectedIndex = index;
      }
    })
  });

  function handler(ev){
    parsed.set(self, this.value);
    inProgress = true;
    self.$update();
    inProgress = false;
  }
  dom.on(elem, "change", handler);
  this.$on('init', function(){
    if(parsed.get(self) === undefined){
       parsed.set(self, elem.value);
    }
  })
}

// input,textarea binding

function initText(elem, parsed){
  var inProgress = false;
  var self = this;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress){ return; }
    if(elem.value !== newValue) elem.value = newValue == null? "": "" + newValue;
  });

  // @TODO to fixed event
  var handler = function handler(ev){
    var value = this.value
    parsed.set(self, value);
    inProgress = true;
    self.$update();
    inProgress = false;
  };

  if(dom.msie !== 9 && "oninput" in dom.tNode ){
    elem.addEventListener("input", handler );
  }else{
    dom.on(elem, "paste", handler)
    dom.on(elem, "keypress", handler)
    dom.on(elem, "cut", handler)
  }
  this.$on('init', function(){
    if(parsed.get(self) === undefined){
       parsed.set(self, elem.value);
    }
  })
}

// input:checkbox  binding

function initCheckBox(elem, parsed){
  var inProgress = false;
  var self = this;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    dom.attr(elem, 'checked', !!newValue);
  });

  var handler = function handler(ev){
    var value = this.checked;
    parsed.set(self, value);
    inProgress= true;
    self.$update();
    inProgress = false;
  }
  if(parsed.set) dom.on(elem, "change", handler)
  this.$on('init', function(){
    if(parsed.get(self) === undefined){
      parsed.set(self, elem.checked);
    }
  });
}


// input:radio binding

function initRadio(elem, parsed){
  var self = this;
  var inProgress = false;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    if(newValue === elem.value) elem.checked = true;
  });


  var handler = function handler(ev){
    var value = this.value;
    parsed.set(self, value);
    inProgress= true;
    self.$update();
    inProgress = false;
  }
  if(parsed.set) dom.on(elem, "change", handler)
  this.$on('init', function(){
    if(parsed.get(self) === undefined){
      if(elem.checked) parsed.set(self, elem.value);
    }
  });
}

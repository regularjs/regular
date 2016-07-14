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
  params: ['delay', 'debounce'],
  link: function( elem, value, attr, extra ){
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
})



// binding <select>

function initSelect( elem, parsed, extra){
  var self = this;
  var wc = this.$watch(parsed, function(newValue){
    var children = elem.getElementsByTagName('option');
    for(var i =0, len = children.length ; i < len; i++){
      if(children[i].value == newValue){
        elem.selectedIndex = index;
        break;
      }
    }
  });

  function handler(){
    parsed.set(self, this.value);
    wc.last = this.value;
    self.$update();
  }

  dom.on( elem, "change", handler );
  
  if(parsed.get(self) === undefined && elem.value){
    parsed.set(self, elem.value);
  }

  return function destroy(){
    dom.off(elem, "change", handler);
  }
}

// input,textarea binding

function initText(elem, parsed, extra){
  var params = extra.params;
  var debounce = params.debounce;
  var delay = params.delay;

  if(delay){
    delay = this.$get( delay, true);
  }

  if(debounce){
    debounce = parseInt(this.$get(debounce, true), 10);
  }

  var self = this;
  var wc = this.$watch(parsed, function(newValue){
    if(elem.value !== newValue) elem.value = newValue == null? "": "" + newValue;
  });

  // @TODO to fixed event
  var handler = function (ev){
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

  if(debounce && !delay){
    var preHandle = handler, tid;
    handler = function(ev){
      if(tid) clearTimeout(tid);
      tid = setTimeout(function(){
        preHandle(ev);
        tid = null;
      })
    }
  }

  if(delay){
    elem.addEventListener("change", handler );
  }else{
    if(dom.msie !== 9 && "oninput" in dom.tNode ){
      elem.addEventListener("input", handler );
      
    }else{
      dom.on(elem, "paste", handler)
      dom.on(elem, "keyup", handler)
      dom.on(elem, "cut", handler)
      dom.on(elem, "change", handler)
    }
  }
  if(parsed.get(self) === undefined && elem.value){
     parsed.set(self, elem.value);
  }
  return function (){
    if(delay) return elem.removeEventListener("change", handler);
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




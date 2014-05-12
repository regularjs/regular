var dom = module.exports;
var env = require("./env.js");
var _ = require("./util");
var tNode = document.createElement('div')

dom.tNode = tNode;

dom.msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
if (isNaN(dom.msie)) {
  dom.msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
}

// createElement 
dom.create = function(type, ns){
  return document[  !ns? "createElement": 
    _.assert( ns !== "svg" || evn.svg, "this browser has no svg support") && "createElementNS"](type, ns);
}

// documentFragment
dom.fragment = function(){
  return document.createDocumentFragment();
}

dom.append = function(parent, el){
  if(_.typeOf(el) === 'array'){
    for(var i = 0, len = el.length; i < len ;i++){
      dom.append(parent ,el[i]);
    }
  }else{
    if(el) parent.appendChild(el);
  }
}


// attribute Setter & Getter
dom.attr = function(node, name, value){
  if(value === undefined){
    return node.getAttribute(name, value);
  }
  if(value === null){
    return node.removeAttribute(name)
  }
  return node.setAttribute(name, value);
}


dom.on = function(node, type, handler, capture){
  if (node.addEventListener) node.addEventListener(type, handler, !!capture);
  else node.attachEvent('on' + type, handler);
}

dom.off = function(node, type, handler, capture){
  if (node.removeEventListener) node.removeEventListener(type, handler, !!capture);
  else node.detachEvent('on' + type, handler);
}

dom.text = (function (){
      var map = {};
      if (dom.msie && dom.msie < 9) {
        map[1] = 'innerText';    
        map[3] = 'nodeValue';    
      } else {
        map[1] =                
        map[3] = 'textContent';  
      }
  
  return function (element, value) {
    var textProp = map[element.nodeType];
    if (value == null) {
      return textProp ? element[textProp] : '';
    }
    element[textProp] = value;
  }
})();

var mapSetterGetter = {
  "html": "innerHTML"
}

dom.html = function(){
  if(text === undefined){
    return node.innerHTML
  }else{
    node.innerHTML = text;
  }
}

// css Settle & Getter
dom.css = function(name, value){

}

dom.addClass = function(){

}

dom.delClass = function(){

}

dom.hasClass = function(){

}




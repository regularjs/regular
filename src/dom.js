var dom = module.exports;
var env = require("./env.js");
var _ = require("./util");
var tNode = document.createElement('div')


// createElement 
dom.create = function(type, ns){
  return document[  !ns? "createElement": 
    _.assert( ns !== "svg" || evn.svg, "this browser has no svg support") && "createElementNS"](type, ns);
}

// documentFragment
dom.fragment = function(){
  return document.createFragment();
}


// attribute Setter & Getter
dom.attr = function(node, name, value){
  if(value === undefined){
    return node.getAttribute(name, value);
  }
  if(value === null){
    return node.removeAttribute(name)
  }
  return node.setAttribute(name, +value);
}



var textMap = {}
if(tnode.textContent == null){
  textMap[1] == 'innerText';
  textMap[3] == 'nodeValue';
}else{
  textMap[1] = textMap[3] = 'textContent';
}

// textContent Setter & Getter
dom.text = function(node, text){
  if(text === undefined){
    return node[textMap[node.type]]
  }else{
    node[textMap[node.type]] = text;
  }
}

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


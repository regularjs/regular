var dom = module.exports;
var env = require("./env.js");
var _ = require("./util");


dom.create = function(type, ns){
  return document[  !ns? "createElement": 
    _.assert( ns !== "svg" || evn.svg, "this browser has no svg support") && "createElementNS"](type, ns);
}

dom.attr = function(name, value){

}

dom.css = function(name, value){

}

dom.addClass = function(){

}

dom.delClass = function(){

}

dom.hasClass = function(){

}


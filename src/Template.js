// every runtime have template instance then can call some helper function to avoid logic;
var dom = require('./dom');
var components = require('./components');









function Template(ast, data){
  this.ast = ast;
  this.data = data;
  this.watcher = {};
  this.stack = [];
}




var to = Template.prototype;

var wk = _.walk(co); 

wk.element = function(ast, data){
  var name = ast.name;
  if(components)
}

wk.if = function(ast){

}

wk.list = function(ast){

}


// hogan escape
// ==============
to.escape = (function(){
  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos = /\'/g,
      rQuot = /\"/g,
      hChars = /[&<>\"\']/;

  return function(str) {
    return hChars.test(str) ?
      str
        .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }
})();


to.enter = function(parent){
  this.stack.push(parent);
}

to.watch = function(expression, callback){

}

to.leave = function(){
  this.stack.pop();
}

to.current = function(){
  var stack = this.stack;
  return stack[stack.length - 1];
}

to.dom = require('./dom');




module.exports = Template;


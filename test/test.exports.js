var expect = require('expect.js');
var ao = expect.Assertion.prototype;
ao.typeEqual = function(list){
  if(typeof list == 'string') list = list.split(',')
  var types = this.obj.map(function(item){
    return item.type
  });
  this.assert(
      expect.eql(types, list) 
    , function(){ return 'expected ' + list + ' to equal ' + types }
    , function(){ return 'expected ' + list + ' to not equal ' + types });
  return this;
}






require("./spec/browser-syntax.js");
require("./spec/browser-bugfix.js");
require("./spec/browser-animate.js");
require("./spec/browser-dom.js");
require("./spec/browser-api.js");
require("./spec/browser-modular.js");
require("./spec/browser-list.js");
require("./spec/browser-if.js");
require("./spec/browser-include.js");
require("./spec/browser-directive.js");
require("./spec/browser-filter.js");
require("./spec/browser-watcher.js");
require("./spec/browser-nested.js");
require("./spec/browser-modifier.js");
require("./spec/test-util.js");
require("./spec/test-event.js");
require("./spec/test-lexer.js");

if(Object.create !== undefined){
  require("./spec/test-ssr.js");
}

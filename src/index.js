var env =  require("./env.js");
var config = require("./config"); 
var Regular = module.exports = require("./Regular.js");
var Parser = Regular.Parser;
var Lexer = Regular.Lexer;

if(env.browser){
    require("./directive/base.js");
    require("./directive/animation.js");
    require("./module/timeout.js");
    Regular.dom = require("./dom.js");
}
Regular.env = env;
Regular.util = require("./util.js");
Regular.parse = function(str, options){
  options = options || {};

  if(options.BEGIN || options.END){
    if(options.BEGIN) config.BEGIN = options.BEGIN;
    if(options.END) config.END = options.END;
    Lexer.setup();
  }
  var ast = new Parser(str).parse();
  return !options.stringify? ast : JSON.stringify(ast);
}


var env =  require("./env");
var config = require("./config"); 
var Regular = module.exports = require("./render/client");
var Parser = Regular.Parser;
var Lexer = Regular.Lexer;

// if(env.browser){
    require("./directive/base");
    require("./directive/animation");
    require("./module/timeout");
    Regular.dom = require("./dom");
// }
Regular.env = env;
Regular.util = require("./util");
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
Regular.Cursor =require('./helper/cursor') 

Regular.isServer = env.node;
Regular.isRegular = function( Comp ){
  return  Comp.prototype instanceof Regular;
}



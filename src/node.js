
var Parser = require("./parser/Parser")
var Lexer = require("./parser/Lexer")
var config = require("./config"); 

exports.parse = function(str, options){
  options = options || {};

  if(options.BEGIN || options.END){
    if(options.BEGIN) config.BEGIN = options.BEGIN;
    if(options.END) config.END = options.END;
    Lexer.setup();
  }
  var ast = new Parser(str).parse();
  return options.stringify === false? ast : JSON.stringify(ast);
}



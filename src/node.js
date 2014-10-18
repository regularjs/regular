
var Parser = require("./parser/Parser")
var Lexer = require("./parser/Lexer")

exports.parse = function(str, stringify){
  var ast = new Parser(str).parse();
  return stringify === false? ast : JSON.stringify(ast);
}


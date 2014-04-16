var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");

// zencoding expand
exports.rule = function(){

}


tn.rule('zen', function(code){
  return sl.parser.parse(code);
})
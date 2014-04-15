var _ = require('../util.js'); 
var Parser = require('../parser/parser.js');


function Compiler(input){
   this.ast = new Parser(input, {mode: 2}).parse();
}

var co = Compiler.prototype;

co.compile = function(){

}

co.walk =_.walk; 

co.walkers = {
  
}






module.exports = Compiler;
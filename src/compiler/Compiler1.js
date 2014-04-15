// compiler1 for first 
var _ = require('../util.js'); 
var Parser = require('../parser/parser.js');


function Compiler(input, opts){
   this.ast = new Parser(input, opts).parse();
}

var co = Compiler.prototype;

co.compile = function(){

}

co.walk =_.walk; 

co.walkers = {
  'default': function(){

  },
  'element': function(ast){

  },
  "list": function(){
    
  }
}





module.exports = Compiler;
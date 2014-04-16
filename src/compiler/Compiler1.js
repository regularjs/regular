// compiler1 for first 
var _ = require('../util.js'); 
var dom = require('../dom');
var Parser = require('../parser/parser.js');


function Compiler(input, opts){
   this.ast = new Parser(input, opts).parse();
}

var co = Compiler.prototype;


function data(){

}

co.compile = function(){
  this.buffer=["var r = terminator.runtime;d = r.dom;u=r.util;"]; 
  var code = this.walk(this.ast);
  return new Function('data', code);
}

co.walk =_.walk; 

// how to get object in angular?  text based template can do!!
tn.decorate('style', function(node, value){
  if(typeof value == 'object'){

  }else{

  }
});




co.walkers = {
  default: function(ast){

  },
  element: function(ast){
    var attrs = ast.attrs;

    var code  = ["var el,attrs, dcor;d.create(" + ast.tag +');']
    if(attrs){
      for(var i = 0, len; i < attrs; i++){
        var attr = attrs[i];
        code.push("if(dcor = d.decorate(" + attr.name + ")){")

        code.push("}else{d.attr("+['el',attr.name, attr.value +")}")
      }
    }
    
    code.push()
    this.buffer.push()
    var element = dom.create(ast.tag);
    this.walk(attrs, element)
    var fragment = this.walk(ast.children);
  },
  attribute: function(ast, element){
    if(attributeHooks[ast.name]) attr
    else dom.attr(element, ast.name, ast.value);
  },
  list: function(ast){

  },
  if: function(ast){

  },
  text: function(){

  }
}


attributeHooks = {
  'style': function(value){
    this.watch(value, function(){

    })
  },
  'on-tap': function(){

  }
}






module.exports = Compiler;
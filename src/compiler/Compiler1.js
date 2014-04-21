// compiler1 for first 
var _ = require('../util.js'); 
var dom = require('../dom');
var Parser = require('../parser/Parser.js');


function Compiler(input, opts){
   this.ast = new Parser(input, opts).parse();
}

var co = Compiler.prototype;



co.compile = function(){
  var prefix = "var r=this.r, d=r.dom, u=r.util, el=d.fragement(); "; 
  var code = this.walk(this.ast);
  var suffix = "";
  var result = prefix + code.join("") + suffix;
  return new Function(_.varName, result);
}

var wk = _.walk(co); 


wk.default = function(){

}

wk.element = function(ast){
  var attrs = ast.attrs;
  var elName = _.randomVar('el');
  var fragName = _.randomVar('fr');
  var code  = ["\nvar ",elName," = d.create('" + ast.tag +"');"]

  if(attrs){
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      code.push(" d.attr("+ elName +",'" + attr.name +"','"+ attr.value +"');")
    }
  }
  code.push(
      "var ", fragName, "=d.fragement();",
      "\nthis.enter(" + fragName + ");"
      );
  code.push.apply(code, this.walk(ast.children));
  code.push("\nthis.leave(" + fragName + ");");

  return code.join("")
}

wk.interplation = function(ast){

}

wk.expression = function(){

}


var attributeHooks = {
  'style': function(value){
    this.watch(value, function(){

    })
  },
  'on-tap': function(){

  }
}






module.exports = Compiler;
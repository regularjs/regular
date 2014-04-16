var _ = require('../util.js'); 
function ExpressionCompiler(ast, options){
  options = options || {};
  this.buffer = _.buffer();
  if(!options.standalone){
    return "function(data){ return (" + this.walk(ast) + ")}";
  }else{
    return new Function("data", "(" + this.walk(ast) + ")")
  }
}

var eo = ExpressionCompiler.prototype;


var wk = _.walk(eo);

wk.filter = function(ast){
  var attr, filter;
  this.buffer.push("var "+(attr = _.varName())+"=" + this.walk(ast.object) + ";");
  for(var i = 0, len = ast.filters.length; i < len; i++){
    var filter = filters[i];
    this.buffer.push (attr + " = tn.f["+filter.name+"]( + "attr" + ," + this.walk(filter.args).join(",") + ");")
  }
}

wk.condition = function(ast){
  var testAttr = _.varName();
  var code = +this.walk( ast.test )+"?" + this.walk(ast.consequent) ":"
}
wk.default = function(primary){
  var type = primary.type || typeof  primary;
  switch(type){
    case "number": 
      return primary;
  }
}





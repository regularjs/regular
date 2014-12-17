// // Base is The Parent of Client and Server
// var _ = require("./util");

// function parse(){

// }

// function comiple(template){
//   if(typeof template === "string") template = parse(template);
//   var code = "";
//   walkers._walk(template);
// }

// function render(template, data){
//   return comiple(template).render.call(this, data);
// }


// function Render(ast){
  
// }



// var ro = Render.prototype;


// var DATA = "_d_";

// var ctxName = _.ctxName;
// var varName = _.varName;
// var prefix = _.prefix;
// var textName = "_txt";

// var uid = 0;
// function randomVar(){
//   return "v_" + uid++;
// }



// var walkers = {}; 

// walkers.walk = function(){
//   var code = return this._walk(ast);
//   return new Function(DATA, _.prefix +  code.join(""));
// }

// walkers._walk = function(ast){
//   var arr = [];
//   if( _.typeOf(ast) === array){
//     for(var i = 0, len = ast.length ; i < len; i++){
//       arr.push(this._walk(ast[]) || "")
//     }
//     return arr.join("+");
//   }
//   return this[ast.type||'error'](ast);
// }

// var _p = list;
//   for(var i = 0; i < _p; i++){
//     _txt += (function(){return this._walk(ast)})(context, ctxName._.create(data,{,var_index:1}))
//   }

// walkers.list = function(ast){
//   var sequence = ast.sequence, variable = ast.variable;
//   var sequenceName = randomVar();
//   var codes = "var " + sequenceName ";for( var i = 0; i< "+ ctxName + ")"
// }

// walkers.expression = function(ast){
//   return "(" + ast.body + ")" ;
// }

// walkers.text = function(ast, varName){
//   return varName '+="' + ast.text + '"';
// }


// // walkers.template = function(ast){

// // }

// // walkers["if"] = function(ast){

// // }




// walkers.error = function(ast){
//   throw "you may got a invalid ast type: " + ast.type;
// }


// exports.render = (template, data){

// }

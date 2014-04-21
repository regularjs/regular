// source code relation

function Buffer(){
  this.code = [];
}

var bo = Buffer.prototype;

bo.line = function(){
  this.code

}
bo.add = function(str){
  this.code.push(str)
}

bo.toString = function(){
  return this.code.join("");
}




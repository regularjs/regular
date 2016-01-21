function NodeCursor(node){
  this.node = node;
}


var no = NodeCursor.prototype;

no.next = function(){
  this.node = this.node.nextSibling;
  return this;
}

module.exports = function(n){ return new NodeCursor(n)}

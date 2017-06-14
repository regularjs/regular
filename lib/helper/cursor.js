function NodeCursor(node, parentNode){
  this.node = node;
  this.parent = parentNode;
}


var no = NodeCursor.prototype;

no.next = function(){
  this.prev = this.node;
  this.node = this.node.nextSibling;
  return this;
}

module.exports = function(n){ return new NodeCursor(n)}

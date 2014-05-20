var _ = require('./util');
var dom = require('./dom');

function Group(list){
  this.children = list || [];
}


_.extend(Group.prototype, {
  destroy: function(){
    var children = this.children, child;
    if(!this.children) return;
    for(var i = 0, len = children.length; i < len; i++){
      child = children[i];
      if(typeof child.destroy === 'function'){ // destroy interface
        child.destroy();
      }else if(child.nodeType == 3){ // textnode
        dom.remove(child);
      }else{// TODO 
      }
    }
    this.children = null;
  },
  get: function(i){
    return this.children[i]
  },
  push: function(item){
    this.children.push( item );
  }
})



module.exports = Group;



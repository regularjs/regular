var _ = require('./util');
var dom = require('./dom');

function Group(list){
  this.children = list || [];
}

_.extend(Group.prototype, {
  destroy: function(){

    var children = this.children, child;

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
  generate: function(){
    var children = this.children, child, node, 
      fragment = dom.fragment();

    for(var i = 0, len = children.length; i < len; i++){

      var node = null;
      child = children[i];
      if(child.generate) node = child.generate();
      else if(typeof child.nodeType == 'number') node = child;
      if(node) fragment.appendChild(node);

    }
    return fragment;
  },
  get: function(index){
    if(index < 0) index = this.children.length + index;
    return this.children[index];
  },
  first: function(){
    
  },
  splice: function(){

  },
  push: function(item){
    this.children.push( item );
  }
})



module.exports = Group;



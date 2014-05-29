var _ = require('./util');
var dom = require('./dom');
var combine = require('./helper/combine')

function Group(list){
  this.children = list || [];
}


_.extend(Group.prototype, {
  destroy: function(){
    combine.destroy(this.children);
    if(this.ondestroy) this.ondestroy();
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



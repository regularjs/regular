var _ = require('./util');
var dom = require('./dom');
var animate = require('./helper/animate')
var combine = require('./helper/combine')

function Group(list){
  this.children = list || [];
}


_.extend(Group.prototype, {
  destroy: function(first){
    combine.destroy(this.children, first);
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



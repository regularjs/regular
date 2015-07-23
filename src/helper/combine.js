// some nested  operation in ast 
// --------------------------------

var dom = require("../dom.js");

var combine = module.exports = {

  // get the initial dom in object
  node: function(item){
    var children,node, nodes;
    if(item.element) return item.element;
    if(typeof item.node === "function") return item.node();
    if(typeof item.nodeType === "number") return item;
    if(item.group) return combine.node(item.group)
    if(children = item.children){
      if(children.length === 1){
        return combine.node(children[0]);
      }
      nodes = [];
      for(var i = 0, len = children.length; i < len; i++ ){
        node = combine.node(children[i]);
        if(Array.isArray(node)){
          nodes.push.apply(nodes, node)
        }else if(node) {
          nodes.push(node)
        }
      }
      return nodes;
    }
  },
  inject: function(node, pos, group ){
    if(!group) group = this;
    if(node === false) {
      if(!group._fragContainer)  group._fragContainer = dom.fragment();
      return combine.inject( group._fragContainer, pos, group);
    }
    var fragment = combine.node(group.group || group);
    if(!fragment) return group;
    if(typeof node === 'string') node = dom.find(node);
    if(!node) throw 'injected node is not found';
    dom.inject(fragment, node, pos);
    // if it is a component
    if(group.$emit) {
      group.$emit("$inject", node, pos);
      group.parentNode = (pos ==='after' || pos === 'before')? node.parentNode : node;
    }


    return group;
  },

  // get the last dom in object(for insertion operation)
  last: function(item){
    var children = item.children;

    if(typeof item.last === "function") return item.last();
    if(typeof item.nodeType === "number") return item;

    if(children && children.length) return combine.last(children[children.length - 1]);
    if(item.group) return combine.last(item.group);

  },

  destroy: function(item, first){
    if(!item) return;
    if(Array.isArray(item)){
      for(var i = 0, len = item.length; i < len; i++ ){
        combine.destroy(item[i], first);
      }
    }
    var children = item.children;
    if(typeof item.destroy === "function") return item.destroy(first);
    if(typeof item.nodeType === "number" && first)  dom.remove(item);
    if(children && children.length){
      combine.destroy(children, true);
      item.children = null;
    }
  }

}
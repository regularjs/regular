// some nested  operation in ast
// --------------------------------

var dom = require("../dom");
var animate = require("./animate");

var combine = module.exports = {

  // get the initial dom in object
  node: function(item){
    var children,node, nodes;
    if(!item) return;
    if(typeof item.node === "function") return item.node();
    if(typeof item.nodeType === "number") return item;
    if(item.group) return combine.node(item.group)

    item = item.children || item;
    if( Array.isArray(item )){
      var len = item.length;
      if(len === 1){
        return combine.node(item[0]);
      }
      nodes = [];
      for(var i = 0, len = item.length; i < len; i++ ){
        node = combine.node(item[i]);
        if(Array.isArray(node)){
          for (var j = 0, len1 = node.length; j < len1; j++){
            nodes.push(node[j])
          }
        }else if(node) {
          nodes.push(node)
        }
      }
      return nodes;
    }
    
  },
  // @TODO remove _gragContainer
  inject: function(node, pos ){
    var group = this;
    var fragment = combine.node(group.group || group);
    if(node === false) {
      animate.remove(fragment)
      return group;
    }else{
      if(!fragment) return group;
      if(typeof node === 'string') node = dom.find(node);
      if(!node) throw Error('injected node is not found');
      // use animate to animate firstchildren
      animate.inject(fragment, node, pos);
    }
    // if it is a component
    if(group.$emit) {
      var preParent = group.parentNode;
      var newParent = (pos ==='after' || pos === 'before')? node.parentNode : node;
      group.parentNode = newParent;
      group.$emit("$inject", node, pos, preParent);
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
    if( typeof item.nodeType === "number"  ) return first && dom.remove(item)
    if( typeof item.destroy === "function" ) return item.destroy(first);

    if( Array.isArray(item)){
      for(var i = 0, len = item.length; i < len; i++ ){
        combine.destroy(item[i], first);
      }
    }
  }

}


// @TODO: need move to dom.js
dom.element = function( component, all ){
  if(!component) return !all? null: [];
  var nodes = combine.node( component );
  if( nodes.nodeType === 1 ) return all? [nodes]: nodes;
  var elements = [];
  for(var i = 0; i<nodes.length ;i++){
    var node = nodes[i];
    if( node && node.nodeType === 1){
      if(!all) return node;
      elements.push(node);
    }
  }
  return !all? elements[0]: elements;
}




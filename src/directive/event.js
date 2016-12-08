/**
 * event directive  bundle
 *
 */
var _ = require("../util");
var dom = require("../dom");
var Regular = require("../render/client");

Regular._addProtoInheritCache("event");

Regular.directive( /^on-\w+$/, function( elem, value, name , attrs) {
  if ( !name || !value ) return;
  var type = name.split("-")[1];
  return this._handleEvent( elem, type, value, attrs );
});
// TODO.
/**
- $('dx').delegate()
*/
Regular.directive( /^(delegate|de)-\w+$/, function( elem, value, name ) {
  var root = this.$root;
  var _delegates = root._delegates || ( root._delegates = {} );
  if ( !name || !value ) return;
  var type = name.split("-")[1];
  var fire = _.handleEvent.call(this, value, type);

  function delegateEvent(ev){
    matchParent(ev, _delegates[type], root.parentNode);
  }

  if( !_delegates[type] ){
    _delegates[type] = [];

    if(root.parentNode){
      dom.on(root.parentNode, type, delegateEvent);
    }else{
      root.$on( "$inject", function( node, position, preParent ){
        var newParent = this.parentNode;
        if( preParent ){
          dom.off(preParent, type, delegateEvent);
        }
        if(newParent) dom.on(this.parentNode, type, delegateEvent);
      })
    }
    root.$on("$destroy", function(){
      if(root.parentNode) dom.off(root.parentNode, type, delegateEvent)
      _delegates[type] = null;
    })
  }
  var delegate = {
    element: elem,
    fire: fire
  }
  _delegates[type].push( delegate );

  return function(){
    var delegates = _delegates[type];
    if(!delegates || !delegates.length) return;
    for( var i = 0, len = delegates.length; i < len; i++ ){
      if( delegates[i] === delegate ) delegates.splice(i, 1);
    }
  }

});


function matchParent(ev , delegates, stop){
  if(!stop) return;
  var target = ev.target, pair;
  while(target && target !== stop){
    for( var i = 0, len = delegates.length; i < len; i++ ){
      pair = delegates[i];
      if(pair && pair.element === target){
        pair.fire(ev)
      }
    }
    target = target.parentNode;
  }
}
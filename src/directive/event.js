/**
 * event directive  bundle
 *
 */
var _ = require("../util.js");
var dom = require("../dom.js");
var Regular = require("../Regular.js");

Regular._addProtoInheritCache("event");

Regular.event("enter", function(elem, fire) {
  _.log("on-enter will be removed in 0.4.0", "error");
  function update( ev ) {
    if ( ev.which === 13 ) {
      ev.preventDefault();
      fire(ev);
    }
  }
  dom.on( elem, "keypress", update );

  return function() {
    dom.off( elem, "keypress", update );
  }
})


Regular.directive( /^on-\w+$/, function( elem, value, name , attrs) {
  if ( !name || !value ) return;
  var type = name.split("-")[1];
  return this._handleEvent( elem, type, value, attrs );
});
// TODO.
/**
- $('dx').delegate()
*/
Regular.directive( /^delegate-\w+$/, function( elem, value, name, attrs ) {
  var root = this.$root;
  var _delegates = root._delegates || ( root._delegates = {} );
  if ( !name || !value ) return;
  var type = name.split("-")[1];
  var fire = _.handleEvent.call(this, value, type);

  function delegateEvent(ev){
    matchParent(ev, _delegates[type]);
  }

  if( !_delegates[type] ){
    _delegates[type] = [];

    root.$on( "$inject", function( newParent ){
      var preParent = this.parentNode;
      if( preParent ){
        dom.off(preParent, type, delegateEvent);
      }
      dom.on(newParent, type, delegateEvent);
    })

    root.$on("$destroy", function(){
      if(root.parentNode) dom.off(root.parentNode, type, delegateEvent)
      root._delegates[type] = null;
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


function matchParent(ev , delegates){
  var target = ev.target;
  while(target && target !== dom.doc){
    for( var i = 0, len = delegates.length; i < len; i++ ){
      if(delegates[i].element === target){
        delegates[i].fire(ev);
      }
    }
    target = target.parentNode;
  }
}
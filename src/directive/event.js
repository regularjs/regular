/**
 * event directive  bundle
 * 
 */
var _ = require("../util.js");
var dom = require("../dom.js");
var Regular = require("../Regular.js");

Regular.events = {
  enter: function(elem, fire){
    function update(ev){
      if(ev.which == 13){
        ev.preventDefault();
        fire(ev);
      }
    }
    dom.on(elem, "keypress", update);
    return function(){
      dom.off(elem, "keypress", update);
    }
  }
}



Regular.directive(/^on-\w+$/, function(elem, value, name){

  if(!name || !value) return;
  var type = name.split("-")[1], 
    events = Regular.events;
  var parsed = Regular.parse(value);
  var self = this;

  function fire(obj){
    self.data.$event = obj;
    var res = parsed.get(self);
    if(res === false && obj && obj.preventDefault) obj.preventDefault();
    self.data.$event = null;
    self.$update();
  }
  var handler = events[type];
  if(handler){
    var destroy = handler(elem, fire);
  }else{
    dom.on( elem, type, fire );
  }
  return  handler? destroy : function(){
    dom.off(elem, type, fire);
  }
});


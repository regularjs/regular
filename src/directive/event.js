/**
 * event directive  bundle
 * 
 */
var _ = require("../util.js");
var dom = require("../dom.js");
var Regular = require("../Regular.js");

Regular._events = {
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

Regular.event = function(name, handler){
  if(!handler) return this._events[name];
  this._events[name] = handler;
  return this;
}


Regular.directive(/^on-\w+$/, function(elem, value, name){

  var Component = this.constructor;

  if(!name || !value) return;
  var type = name.split("-")[1];
  var parsed = Regular.expression(value);
  var self = this;

  function fire(obj){
    self.data.$event = obj;
    var res = parsed.get(self);
    if(res === false && obj && obj.preventDefault) obj.preventDefault();
    delete self.data.$event;
    self.$update();
  }
  
  var handler = Component.event(type);
  if(handler){
    var destroy = handler(elem, fire);
  }else{
    dom.on( elem, type, fire );
  }
  return  handler? destroy : function(){
    dom.off(elem, type, fire);
  }
});


/**
 * event directive  bundle
 *
 */
var _ = require("../util.js");
var dom = require("../dom.js");
var Regular = require("../Regular.js");

Regular._events = {
  enter: function(elem, fire) {
    function update(ev) {
      if (ev.which == 13) {
        ev.preventDefault();
        fire(ev);
      }
    }
    dom.on(elem, "keypress", update);
    return function() {
      dom.off(elem, "keypress", update);
    }
  }
}

Regular.event = function(name, handler) {
  if (!handler) return this._events[name];
  this._events[name] = handler;
  return this;
}


Regular.directive(/^on-\w+$/, function(elem, value, name) {

  if (!name || !value) return;
  var type = name.split("-")[1];
  return this._handleEvent(elem, type, value);
});
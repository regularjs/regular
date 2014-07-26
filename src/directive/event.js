/**
 * event directive  bundle
 *
 */
var _ = require("../util.js");
var dom = require("../dom.js");
var Regular = require("../Regular.js");

Regular._addProtoInheritCache("event")

Regular.event( "enter" , function(elem, fire) {
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
})


Regular.directive(/^on-\w+$/, function(elem, value, name) {
  if (!name || !value) return;
  var type = name.split("-")[1];
  return this._handleEvent(elem, type, value);
});
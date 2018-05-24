// simplest event emitter 60 lines
// ===============================
var _ = require("../util.js");
var fallbackEvent = {
  destroy: '$destroy',
  update: '$update',
  init: '$init',
  config: '$config'
}

// to fix 0.2.x version event
// map init to $init;
// @FIXIT after version 1.0
function fix(type){
  return fallbackEvent[type] || type
}
var API = {
  $on: function(event, fn, desc) {
    if(typeof event === "object" && event){
      for (var i in event) {
        this.$on(i, event[i], fn);
      }
    }else{
      desc = desc || {};
      // @patch: for list
      var context = this;
      event = fix(event);
      var handles = context._handles || (context._handles = {}),
        calls = handles[event] || (handles[event] = []);
      var realFn;
      if(desc.once){
        realFn = function(){
          fn.apply( this, arguments )
          this.$off(event, fn);
        }
        // @FIX: if  same fn
        fn.real = realFn;
      }
      calls.push( realFn || fn );
    }
    return this;
  },
  $off: function(event, fn) {
    var context = this;
    if(!context._handles) return;
    if(!event) this._handles = {};
    var handles = context._handles,
      calls;

    event = fix(event);
    if (calls = handles[event]) {
      if (!fn) {
        handles[event] = [];
        return context;
      }
      fn = fn.real || fn;
      for (var i = 0, len = calls.length; i < len; i++) {
        if (fn === calls[i]) {
          calls.splice(i, 1);
          return context;
        }
      }
    }
    return context;
  },
  // bubble event
  $emit: function(event){
    // @patch: for list
    var context = this;
    var handles = context._handles, calls, args, type;
    if(!event) return;
    var args = _.slice(arguments, 1);
    var type = fix(event);

    if(!handles) return context;
    if (!(calls = handles[type])) return context;

    if(calls.length > 1){ // handle, when first is off the event
      calls = calls.slice();
    }
    
    for (var i = 0, len = calls.length; i < len; i++) {
      if(typeof calls[i] === 'function') calls[i].apply(context, args)
    }
    return context;
  },
  // capture  event
  $once: function(event, fn){
    var args = _.slice(arguments);
    args.push({once: true})
    return this.$on.apply(this, args);
  }
}
// container class
function Event() {}
_.extend(Event.prototype, API)

Event.mixTo = function(obj){
  obj = typeof obj === "function" ? obj.prototype : obj;
  _.extend(obj, API)
}
module.exports = Event;

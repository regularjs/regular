// simplest event emitter 60 lines
// ===============================
var slice = [].slice, _ = require("../util.js");
var API = {
    $on: function(event, fn) {
        if(typeof event === "object"){
            for (var i in event) {
                this.$on(i, event[i]);
            }
        }else{
            // @patch: for list
            var context = this;
            var handles = context._handles || (context._handles = {}),
                calls = handles[event] || (handles[event] = []);
            calls.push(fn);
        }
        return this;
    },
    $off: function(event, fn) {
        var context = this;
        if(!context._handles) return;
        if(!event) this._handles = {};
        var handles = context._handles,
            calls;

        if (calls = handles[event]) {
            if (!fn) {
                handles[event] = [];
                return context;
            }
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
        var args = slice.call(arguments, 1);
        var type = event;

        if(!handles) return context;
        if(calls = handles[type.slice(1)]){
            for (var j = 0, len = calls.length; j < len; j++) {
                calls[j].apply(context, args)
            }
        }
        if (!(calls = handles[type])) return context;
        for (var i = 0, len = calls.length; i < len; i++) {
            calls[i].apply(context, args)
        }
        // if(calls.length) context.$update();
        return context;
    },
    // capture  event
    $broadcast: function(){
        
    }
}
// container class
function Event() {
  if (arguments.length) this.$on.apply(this, arguments);
}
_.extend(Event.prototype, API)

Event.mixTo = function(obj){
  obj = typeof obj === "function" ? obj.prototype : obj;
  _.extend(obj, API)
}
module.exports = Event;
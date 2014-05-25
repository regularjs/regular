// simplest event emitter 60 lines
// ===============================
var slice = [].slice, _ = require('../util.js');
var API = {
    $on: function(event, fn) {
        if(typeof event === 'object'){
            for (var i in event) {
                this.$on(i, event[i]);
            }
        }else{
            var handles = this._handles || (this._handles = {}),
                calls = handles[event] || (handles[event] = []);
            calls.push(fn);
        }
        return this;
    },
    $off: function(event, fn) {
        if(!this._handles) return;
        var handles = this._handles,
            calls;

        if (calls = handles[event]) {
            if (!fn) {
                handles[event] = [];
                return this;
            }
            for (var i = 0, len = calls.length; i < len; i++) {
                if (fn === calls[i]) {
                    calls.splice(i, 1);
                    return this;
                }
            }
        }
        return this;
    },
    // bubble event
    $emit: function(event){
        var args = slice.call(arguments, 1),
            handles = this._handles,
            $parent = this.$parent,
            calls;

        if($parent) $parent.$emit.apply($parent, arguments)
        if (!handles || !(calls = handles[event])) return this;
        for (var i = 0, len = calls.length; i < len; i++) {
            calls[i].apply(this, args)
        }
        // if(calls.length) this.$update();
        return this;
    },
    // capture  event
    $broadcast: function(event){

    }
}
// container class
function Event(handles) {
  if (arguments.length) this.$on.apply(this, arguments);
};
_.extend(Event.prototype, API)

Event.mixTo = function(obj){
  obj = typeof obj == "function" ? obj.prototype : obj;
  _.extend(obj, API)
}
module.exports = Event;
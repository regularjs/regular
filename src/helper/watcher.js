var _ = require('../util.js');
var parseExpression = require('./parse.js').expression;


function Watcher(){}

var methods = {
  $watch: function(expr, fn, options){
    if(!this._watchers) this._watchers = [];
    options = options || {};
    if(options === true){
       options = { deep: true }
    }
    var uid = _.uid('w_');
    if(Array.isArray(expr)){
      var tests = [];
      for(var i=0,len = expr.length; i < len; i++){
          tests.push(Regular.expression(expr[i]).get) 
      }
      var prev = [];
      var test = function(context){
        var equal = true;
        for(var i =0, len = tests.length; i < len; i++){
          var splice = tests[i](context);
          if(!_.equals(splice, prev[i])){
             equal = false;
             prev[i] = _.clone(splice);
          }
        }
        return equal? false: prev;
      }
    }else{
      var expr = parseExpression(expr);
      var get = expr.get;
      var once = expr.once || expr.constant;
    }
    this._watchers.push({
      id: uid, 
      get: get, 
      fn: fn, 
      once: once, 
      force: options.force,
      test: test,
      deep: options.deep
    });
    this._records && this._records.push(uid);
    return uid;

  },
  $unwatch: function(uid){
    if(!this._watchers) this._watchers = [];
    if(Array.isArray(uid)){
      for(var i =0, len = uid.length; i < len; i++){
        this.$unwatch(uid[i]);
      }
    }else{
      var watchers = this._watchers, watcher, len;
      if(!uid || !watchers || !(len = watchers.length)) return;
      for(;len--;){
        watcher = watchers[len];
        if(watcher && watcher.id === uid ){
          watchers.splice(len, 1);
        }
      }
    }
  },

  /**
   * the whole digest loop ,just like angular, it just a dirty-check loop;
   * @param  {String} path  now regular process a pure dirty-check loop, but in parse phase, 
   *                  Regular's parser extract the dependencies, in future maybe it will change to dirty-check combine with path-aware update;
   * @return {Void}   
   */

  $digest: function(){
    if(this.$phase === 'digest') return;
    this.$phase = 'digest';
    var dirty = false, n =0;
    while(dirty = this._digest()){
      if((++n) > 20){ // max loop
        throw 'there may a circular dependencies reaches' 
      }
    }
    this.$phase = null;
  },
  // private digest logic
  _digest: function(){
    // if(this.context) return this.context.$digest();
    if(this.$emit) this.$emit('digest');

    var watchers = this._watchers || (this._watchers = []);
    if(!watchers || !watchers.length) return;
    var dirty = false, anyupdates;
    for(var i = 0, len = watchers.length;i < len; i++){
      var watcher = watchers[i];
      if(!watcher) continue;
      if(watcher.test) { //multi 
        var result = watcher.test(this);
        if(result){
          dirty = true;
          watcher.fn.apply(this, result)
        }
        continue;
      }
      var now = watcher.get(this);
      var last = watcher.last;
      var eq = true;
      if(_.typeOf( now ) == 'object' && watcher.deep){
        if(!watcher.last){
           eq = false;
         }else{
          for(var j in now){
            if(watcher.last[j] !== now[j]){
              eq = false;
              break;
            }
          }
          if(eq !== false){
            for(var j in last){
              if(last[j] !== now[j]){
                eq = false;
                break;
              }
            }
          }
        }
      }else{
        eq = _.equals(now, watcher.last);
      }
      if(eq === false || watcher.force){
        eq = false;
        watcher.force = null;
        watcher.fn.call(this, now, watcher.last);
        if(typeof now !== 'object'|| watcher.deep){
          if(watcher.deep) console.log(now)
          watcher.last = _.clone(now);
        }else{
          watcher.last = now;
        }
      }else{
        if(_.typeOf(eq)=='array' && eq.length){
          watcher.fn.call(this, now, eq);
          watcher.last = _.clone(now);
        }else{
          eq = true;
        }
      }
      if(eq !== true) dirty = true;
      if(watcher.once){
         watchers.splice(i, 1);
      }
    }
    if(this.$emit && dirty) this.$emit('update');
    return dirty;
  },
  _record: function(){
    this._records = [];
  },
  _release: function(){
    var _records = this._records;
    this._records = null;
    return _records;
  }
}


_.extend(Watcher.prototype, methods)


Watcher.mixTo = function(obj){
  obj = typeof obj == "function" ? obj.prototype : obj;
  return _.extend(obj, methods)
}

module.exports = Watcher;
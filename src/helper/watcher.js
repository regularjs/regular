var _ = require('../util.js');
var parseExpression = require('./parse.js').expression;


function Watcher(){}

var methods = {
  $watch: function(expr, fn, options){
    var get, once, test;
    if(!this._watchers) this._watchers = [];
    options = options || {};
    if(options === true){
       options = { deep: true }
    }
    var uid = _.uid('w_');
    if(Array.isArray(expr)){
      var tests = [];
      for(var i = 0,len = expr.length; i < len; i++){
          tests.push(parseExpression(expr[i]).get) 
      }
      var prev = [];
      test = function(context){
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
      expr = parseExpression(expr);
      get = expr.get;
      once = expr.once || expr.constant;
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
      var watchers = this._watchers, watcher, wlen;
      if(!uid || !watchers || !(wlen = watchers.length)) return;
      for(;wlen--;){
        watcher = watchers[wlen];
        if(watcher && watcher.id === uid ){
          watchers.splice(wlen, 1);
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
    if(n>0 && this.$emit) this.$emit("update");
    this.$phase = null;
  },
  // private digest logic
  _digest: function(){
    // if(this.context) return this.context.$digest();
    // if(this.$emit) this.$emit('digest');
    var watchers = this._watchers;
    var dirty = false;
    if(watchers && watchers.length){
      for(var i = 0, len = watchers.length;i < len; i++){
        var loopDirty = false;
        var watcher = watchers[i];
        if(!watcher) continue;
        if(watcher.test) { //multi 
          var result = watcher.test(this);
          if(result){
            dirty = true;
            loopDirty = true;
            watcher.fn.apply(this, result)
          }
          continue;
        }
        var now = watcher.get(this);
        var last = watcher.last;
        var eq = true;
        if(_.typeOf( now ) === 'object' && watcher.deep){
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
              for(var m in last){
                if(last[m] !== now[m]){
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
          loopDirty = true;
          watcher.fn.call(this, now, watcher.last);
          if(typeof now !== 'object'|| watcher.deep){
            watcher.last = _.clone(now);
          }else{
            watcher.last = now;
          }
        }else{
          if( _.typeOf(eq) === 'array' && eq.length ){
            watcher.fn.call(this, now, eq);
            loopDirty = true;
            watcher.last = _.clone(now);
          }else{
            eq = true;
          }
        }
        if(eq !== true) dirty = true;
        if(loopDirty && watcher.once) watchers.splice(i, 1);
      }
    }
    var children = this._children;
    if(children && children.length){
      for(var m = 0, mlen = children.length; m < mlen; m++){
        if(children[m]._digest()) dirty = true;
      }
    }
    return dirty;
  },
  /**
   * **tips**: whatever param you passed in $update, after the function called, dirty-check(digest) phase will enter;
   * 
   * @param  {Function|String|Expression} path  
   * @param  {Whatever} value optional, when path is Function, the value is ignored
   * @return {this}     this 
   */
  $update: function(path, value){
    if(path != null){
      var type = _.typeOf(path);
      if( type === 'string' || path.type === 'expression' ){
        path = parseExpression(path);
        path.set(this, value);
      }else if(type === 'function'){
        path.call(this, this.data);
      }else{
        for(var i in path) {
          if(path.hasOwnProperty(i)){
            this.data[i] = path[i];
          }
        }
      }
    }
    if(this.$root) this.$root.$digest()
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

function dirtyWatcher(watcher, index, watchers){

}


_.extend(Watcher.prototype, methods)


Watcher.mixTo = function(obj){
  obj = typeof obj === "function" ? obj.prototype : obj;
  return _.extend(obj, methods)
}

module.exports = Watcher;
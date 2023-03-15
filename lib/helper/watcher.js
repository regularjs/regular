var _ = require('../util');
var parseExpression = require('./parse').expression;
var diff = require('./diff');
var diffTrack = require('./diffTrack');
var diffArray = diff.diffArray;
var diffObject = diff.diffObject;
const { activeWatcherManager } = require('../reactive/activeWatcherManager');
const { reactive, toRaw } = require('../reactive');
const { update_immediately } = require('../scheduler');

function Watcher(){}

var methods = {
  $watch: function(expr, fn, options){
    var get, once, test, rlen, isStable = false, extra = this.__ext__; //records length
    if(!this._watchers) this._watchers = [];
    if(!this._watchersForStable) this._watchersForStable = [];

    options = options || {};
    if(options === true){
       options = { deep: true }
    }
    var uid = _.uid('w_');
    if(Array.isArray(expr)){
      var tests = [];
      for(var i = 0,len = expr.length; i < len; i++){
          tests.push(this.$expression(expr[i]).get)
      }
      var prev = [];
      test = function(context){
        var equal = true;
        for(var i =0, len = tests.length; i < len; i++){
          var splice = tests[i](context, extra);
          if(!_.equals(splice, prev[i])){
             equal = false;
             prev[i] = splice;//_.clone(splice);
          }
        }
        return equal? false: prev;
      }
    }else{
      if(typeof expr === 'function'){
        get = expr.bind(this);
      }else{
        expr = this.$expression(expr);
        if(_.isExpr(expr)) {
          get = expr.get;
          once = expr.once;
        } else {
          get = function(){return expr};
          once = true;
          isStable = true;
        }
      }
    }

    var watcher = {
      id: uid,
      get: function getWrap(params) {
        // track state
        activeWatcherManager.push(watcher);
        let result = get.apply(this, arguments);
        activeWatcherManager.pop(watcher);
        return result;
      },
      getRaw: get,
      hostName: this._cid,
      host: this,
      fn: function fnWrap(params) {
        // track state
        activeWatcherManager.push(watcher);
        let result = fn.apply(this, arguments);
        activeWatcherManager.pop(watcher);
        return result;
      },
      rawFn: fn,
      once: once,
      force: options.force,
      // don't use ld to resolve array diff
      diff: options.diff,
      keyOf: options.keyOf,
      test: test ? function testWrap() {
        // track state
        activeWatcherManager.push(watcher);
        let result = test.apply(this, arguments);
        activeWatcherManager.pop(watcher);
        return result;
      } : undefined,
      deep: options.deep,
      last: options.last,
      // cache the trackInfo for list tarck.
    }

    const init = options.init || this.handling === 'directive';
    let now;
    if (!init || options.sync) {
      if (test) {
        watcher.test(this);
      } else {
        now = watcher.get(this);
        if (options.sync) {
          watcher.last = now;
        }
      }
    }

    this[(options.stable || isStable)? '_watchersForStable': '_watchers'].push(watcher);
    
    rlen = this._records && this._records.length;
    if(rlen) this._records[rlen-1].push(watcher)
    // init state.
    if(init === true){
      var prephase = this.$phase;
      this.$phase = 'digest';
      this._checkSingleWatch( watcher);
      this.$phase = prephase;
    }
    return watcher;
  },
  $unwatch: function( watcher ){
    if(!this._watchers || !watcher) return;
    var watchers = this._watchers;
    var type = typeof watcher;

    if(type === 'object'){
      var len = watcher.length;
      if(!len){
        watcher.removed = true
      }else{
        while( (len--) >= 0 ){
          this.$unwatch(watcher[len])
        }
      }
    }else if(type === 'number'){
      var id = watcher;
      watcher =  _.findItem( watchers, function(item){
        return item.id === id;
      } );
      if(!watcher) watcher = _.findItem(this._watchersForStable, function( item ){
        return item.id === id
      })
      return this.$unwatch(watcher);
    }
    return this;
  },
  $expression: function(value){
    return this._touchExpr(parseExpression(value))
  },
  /**
   * the whole digest loop ,just like angular, it just a dirty-check loop;
   * @param  {String} path  now regular process a pure dirty-check loop, but in parse phase, 
   *                  Regular's parser extract the dependencies, in future maybe it will change to dirty-check combine with path-aware update;
   * @return {Void}   
   */

  $digest: function(){
    if(this.$phase === 'digest' || this._mute) return;
    this.$phase = 'digest';
    var dirty = false, n =0;
    while(dirty = this._digest()){

      if((++n) > 20){ // max loop
        throw Error('there may a circular dependencies reaches')
      }
    }
    // stable watch is dirty
    var stableDirty =  this._digest(true);

    if( (n > 0 || stableDirty) && this.$emit) {
      this.$emit("$update");
      if (this.devtools) {
        this.devtools.emit("flush", this)
      }
    }
    this.$phase = null;
  },
  // private digest logic
  _digest: function(stable){
    if(this._mute) return;
    var watchers = !stable? this._watchers: this._watchersForStable;
    var dirty = false, children, watcher, watcherDirty;
    var len = watchers && watchers.length;
    if(len){
      var mark = 0, needRemoved=0;
      for(var i =0; i < len; i++ ){
        watcher = watchers[i];
        var shouldRemove = !watcher ||  watcher.removed;
        if( shouldRemove ){
          needRemoved += 1;
        }else{
          watcherDirty = this._checkSingleWatch(watcher);
          if(watcherDirty) dirty = true;
        }
        // remove when encounter first unmoved item or touch the end
        if( !shouldRemove || i === len-1 ){
          if( needRemoved ){
            watchers.splice(mark, needRemoved );          
            len -= needRemoved;
            i -= needRemoved;
            needRemoved = 0;
          }
          mark = i+1;
        }
      }
    }
    return dirty;
  },
  // check a single one watcher 
  _checkSingleWatch: function(watcher){
    var dirty = false;
    if(!watcher) return;

    var now, last, tlast, tnow,  
      eq, diff, keyOf, trackDiff
     

    if(!watcher.test){

      now = watcher.get(this);
      last = watcher.last;
      keyOf = watcher.keyOf

      if(toRaw(now) !== toRaw(last) || watcher.force){
        tlast = _.typeOf(last);
        tnow = _.typeOf(now);
        eq = true;

        // !Object
        if( !(tnow === 'object' && tlast==='object' && watcher.deep) ){
          // Array
          if( tnow === 'array' && ( tlast=='undefined' || tlast === 'array') ){
            if(typeof keyOf === 'function'){
              trackDiff = diffTrack(now, watcher.last || [], keyOf )
              diff = trackDiff.steps;
              if(trackDiff.dirty) dirty = true;
            }else{
              diff = diffArray(now, watcher.last || [], watcher.diff)
            }
            
            if(!dirty && (tlast !== 'array' || diff === true || diff.length) ) dirty = true;
          }else{
            eq = _.equals( now, last );
            if( !eq || watcher.force ){
              watcher.force = null;
              dirty = true; 
            }
          }
        }else{
          diff =  diffObject( now, last, watcher.diff, keyOf  );
          if(diff.isTrack){
            trackDiff = diff;
            diff = trackDiff.steps;
          }
          if( diff === true || diff.length ) dirty = true;
        }
      }

    } else{
      // @TODO 是否把多重改掉
      var result = watcher.test(this);
      if(result){
        dirty = true;
        watcher.fn.apply(this, result)
      }
    }
    if(dirty && !watcher.test){
      if(tnow === 'object' && watcher.deep || tnow === 'array'){
        watcher.last = _.clone(now);
      }else{
        watcher.last = now;
      }
      watcher.fn.call(this, now, last, diff, trackDiff && trackDiff.oldKeyMap, trackDiff && trackDiff.dirty)
      if(watcher.once) this.$unwatch(watcher)
    }
    if (!this.$ready) {
      // compile之前设置check标志位
      watcher.checked = true;
    }
    return dirty;
  },

  /**
   * **tips**: whatever param you passed in $update, after the function called, dirty-check(digest) phase will enter;
   *            if options.pure is true, dirty-check(digest) phase will enter only if data is changed;
   *
   * @param  {Function|String|Expression} path
   * @param  {Whatever} value optional, when path is Function, the value is ignored
   * @param  {Object|Boolean} options optional
   * @return {Boolean} changed
   */
  $set: function(path, value, options) {
    if (path != null) {
      var type = typeof (path),
        changed = false, last, tlast, tnow;
      options = (type === 'object' ? value : options) || {};
      if (options === true) {
        options = {pure: true};
      }
      if (type === 'string' || path.type === 'expression') {
        path = this.$expression(path);
        if (options.pure) {
          last = path.get(this);
          if (!_.equals(value, last)) {
            changed = true;
            tlast = _.typeOf(last);
            tnow = _.typeOf(value);
            if (options.deep && tnow === 'object' && tlast === 'object') {
              changed = diffObject(value, last); // Object
            } else if (tnow === 'array' && tlast === 'array') {
              changed = diffArray(value, last); // Array
            }
          }
        } else {
          changed = true;
        }
        if (changed) {
          path.set(this, value);
        }
      } else if (type === 'function') {
        path.call(this, this.data);
        changed = true;
      } else {
        for (var i in path) {
          if (this.$set(i, path[i], options)) changed = true;
        }
      }
      return changed;
    }
    return true;
  },
  // 1. expr canbe string or a Expression
  // 2. detect: if true, if expr is a string will directly return;
  $get: function(expr, detect) {
    if (detect && typeof expr === 'string') return expr;
    return this.$expression(expr).get(this);
  },
  $update: function() {
    var rootParent = this;
    if (rootParent.$phase === 'destroyed') return this;
    var prephase = rootParent.$phase;
    rootParent.$phase = 'digest';

    var needDigest = this.$set.apply(this, arguments);

    rootParent.$phase = prephase;

    if (needDigest && !this.$ready) {
      // 在$ready之前的$update立即更新
      update_immediately();
    }
    return this;
  },
  // auto collect watchers for logic-control.
  _record: function(){
    if(!this._records) this._records = [];
    this._records.push([]);
  },
  _release: function(){
    return this._records.pop();
  }
}


_.extend(Watcher.prototype, methods)


Watcher.mixTo = function(obj){
  obj = typeof obj === "function" ? obj.prototype : obj;
  return _.extend(obj, methods)
}

module.exports = Watcher;

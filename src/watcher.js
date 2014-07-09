var _ = require('./util');

function Watcher(){
  this._watchers = [];
}


_.extend(Watcher.prototype, {
  push: function(watcher){
    if(!this._watchers) this._watchers = [];
    this._watchers.push(watcher)
  },
  digest: function(){
    if(!this._watchers) this._watchers = [];
    var watchers = this._watchers, watcher;
    for(var i = 0, len = watchers.length; i < len; i++ ){
      var watcher = watchers[i],
        last = watcher.last;
    }
  }
})
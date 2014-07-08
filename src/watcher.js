var _ = require('./util');

function Watcher(){
  this._watchers = [];
}


_.extend(Watcher.prototype, {
  push: function(watcher){
    this._watchers.push(watcher)
  },
  digest: function(){
    var watchers = this._watchers, watcher;
    for(var i = 0, len = watchers.length; i < len; i++ ){
      var watcher = watchers[i],
        last = watcher.last;
        


    }
  }
})
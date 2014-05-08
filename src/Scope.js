var _ = require('./util.js');
var Parser = require('./parser/Parser.js');

function Scope(context){
  this.$id = _.uid('scope');
  this.$watchers = [];
  this.$children = [];
  this.$context = context;

}


_.extend(Scope.prototype, {

  $watch: function(expr, fn, deep){
    if(typeof expr === "string") expr = new Parser(expr).expr(expr);
    var watcher = { get: expr.body.bind(this.$context), fn: fn, pathes: expr.pathes };
    this.$watchers.push(watcher);
  },

  $set: function(path, value){
    if(typeof path === 'function' ){
      path.call(this);
      this.$digest();
    }else{
      this.$pathValue(path, value);
      this.$digest();
    }
  },
  $get: function(pathes){
    if(_.typeOf( pathes ) !== 'array'){
      pathes = pathes.split(".");
    }
    var base = this[pathes[0]];

    for(var i =i,len = pathes.length; i < len ; i++){
      if(!base) return base;
      base = base[pathes[i]];
    }
    return base;
  },

  $digest: function(path){
    var watchers = this.$watchers;
    var children = this.$children;

    for(var i = 0, len = watchers.length;i<len; i++){
      var watcher = watchers[i];
      var now = watcher.get(this);
      var eq = true;
      if(watcher.deep && _.typeOf(now) == 'object'){
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
            for(var j in watcher.last){
              if(watcher.last[j] !== now[j]){
                eq = false;
                break;
              }
            }
          }
        }
      }else{
        eq = _.equals(now, watcher.last);
      }
      if(eq===false){
        watcher.fn(now, watcher.last);
        watcher.last = _.clone(now);
      }else{
        if(_.typeOf(eq)=='array' && eq.length){
          watcher.fn(now, eq);
          watcher.last = _.clone(now);
        }
      }
    }

    for(var i = 0, len = children.length; i < len ; i++){
      children[i].$digest(); 
    }
  },

  $destroy: function(){
    var $parent = this.$parent;

    if($parent){
      var childs = $parent.$chidren;
      var index = childs.indexOf(this);
      if(~index) childs.splice(index,1);
    }
    this.$chidren = null;
    this.$context = null;
    this.$watcher = null;
    this.$parent  =null;
  },

  $new: function(before){
    var child = _.create(this);
    child.$root = this.$root;
    child.$id = _.uid('scope')
    child.$parent = this;
    this.$children.push(child)
    child.$watcher = [];
    child.$children = [];
    child.$context = this.$context;
    return child;
  },
  /**
   * 设置某个path的属性值
   * @param  {String} path  如name.hello
   * @param  {Mix} value 所有设置值
   */
  $pathValue: function(path, value){
    var base = this;
    if(typeof value !== 'undefined'){
      var spaths = path.split('.');
      for(var i=0,len=spaths.length-1;i<len;i++){
        if((base = base[spaths[i]]) == null) return ;
      }
      base[spaths[len]] = value
      return;
    }
    if(~path.indexOf('.')){
      var spaths = path.split('.');
      for(var i=0,len=spaths.length;i<len;i++){
        if((base = base[spaths[i]]) == null) return ;
      }
    }else{
      base = base[path];
    }
    if(typeof base === 'function') return base();
    return base;
  }

});


module.exports = Scope;
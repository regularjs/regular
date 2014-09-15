// shim for es5
var slice = [].slice;
var tstr = ({}).toString;

function extend(o1, o2 ){
  for(var i in o2) if( o1[i] === undefined){
    o1[i] = o2[i]
  }
}

// String proto ;
extend(String.prototype, {
  trim: function(){
    return this.replace(/^\s+|\s+$/g, '');
  }
});


// Array proto;
extend(Array.prototype, {
  indexOf: function(obj, from){
    from = from || 0;
    for (var i = from, len = this.length; i < len; i++) {
      if (this[i] === obj) return i;
    }
    return -1;
  },
  forEach: function(callback, context){
    for (var i = 0, len = this.length; i < len; i++) {
      callback.call(context, this[i], i, this);
    }
  },
  filter: function(callback, context){
    var res = [];
    for (var i = 0, length = this.length; i < length; i++) {
      var pass = callback.call(context, this[i], i, this);
      if(pass) res.push(this[i]);
    }
    return res;
  },
  map: function(callback, context){
    var res = [];
    for (var i = 0, length = this.length; i < length; i++) {
      res.push(callback.call(context, this[i], i, this));
    }
    return res;
  }
});

// Function proto;
extend(Function.prototype, {
  bind: function(context){
    var fn = this;
    var preArgs = slice.call(arguments, 1);
    return function(){
      var args = preArgs.concat(slice.call(arguments));
      return fn.apply(context, args);
    }
  }
})

// Object
extend(Object, {
  keys: function(obj){
    var keys = [];
    for(var i in obj) if(obj.hasOwnProperty(i)){
      keys.push(i);
    }
    return keys;
  } 
})

// Date
extend(Date, {
  now: function(){
    return +new Date;
  }
})
// Array
extend(Array, {
  isArray: function(arr){
    return tstr.call(arr) === "[object Array]";
  }
})

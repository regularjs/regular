
var f = module.exports = {};

// json:  two way filter.
//  - get: JSON.stringify
//  - set: JSON.parse
//  - example: title | json
f.json = {
  get: function( value ){
    return typeof JSON !== 'undefined'? JSON.stringify(value): value;
  },
  set: function( value ){
    return typeof JSON !== 'undefined'? JSON.parse(value) : value;
  }
}

f.last = function(arr){
  return arr && arr[arr.length - 1];
}

f.every = {
  get: function(arr, key){
    key = key || 'checked';
    arr = arr || [];

    var len = arr.length;
    for(;len--;){
      if( !arr[len][key] ) return false;
    }
    return true
  },
  set: function(checkAll, key, arr){
    arr = arr || [];
    checkAll = !!checkAll;

    var len = arr.length;
    for(;len--;){
      arr[len][key] = checkAll;
    }
    return arr;
  }
}
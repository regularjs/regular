
var f = module.exports = {};

// json:  two way 
//  - get: JSON.stringify
//  - set: JSON.parse
//  - example: `{ title|json }`
f.json = {
  get: function( value ){
    return typeof JSON !== 'undefined'? JSON.stringify(value): value;
  },
  set: function( value ){
    return typeof JSON !== 'undefined'? JSON.parse(value) : value;
  }
}

// last: one-way
//  - get: return the last item in list
//  - example: `{ list|last }`
f.last = function(arr){
  return arr && arr[arr.length - 1];
}

// average: one-way
//  - get: copute the average of the list
//  - example: `{ list| average: "score" }`
f.average = function(array, key){
  array = array || [];
  return array.length? f.total(array, key)/ array.length : 0;
}


// total: one-way
//  - get: copute the total of the list
//  - example: `{ list| total: "score" }`
f.total = function(array, key){
  var total = 0;
  if(!array) return;
  array.forEach(function( item ){
    total += key? item[key] : item;
  })
  return total;
}



var _ = require('../util');
var diffTrack = require('./diffTrack');


function equals(a,b){
  return a === b;
}

// array1 - old array
// array2 - new array
function ld(array1, array2, equalFn){
  var n = array1.length;
  var m = array2.length;
  var equalFn = equalFn || equals;
  var matrix = [];
  for(var i = 0; i <= n; i++){
    matrix.push([i]);
  }
  for(var j=1;j<=m;j++){
    matrix[0][j]=j;
  }
  for(var i = 1; i <= n; i++){
    for(var j = 1; j <= m; j++){
      if(equalFn(array1[i-1], array2[j-1])){
        matrix[i][j] = matrix[i-1][j-1];
      }else{
        matrix[i][j] = Math.min(
          matrix[i-1][j]+1, //delete
          matrix[i][j-1]+1//add
          )
      }
    }
  }
  return matrix;
}
// arr2 - new array
// arr1 - old array
function diffArray(arr2, arr1, diff, diffFn) {
  if(!diff) return _.simpleDiff(arr2, arr1);
  var matrix = ld(arr1, arr2, diffFn)
  var n = arr1.length;
  var i = n;
  var m = arr2.length;
  var j = m;
  var edits = [];
  var current = matrix[i][j];
  while(i>0 || j>0){
  // the last line
    if (i === 0) {
      edits.unshift(3);
      j--;
      continue;
    }
    // the last col
    if (j === 0) {
      edits.unshift(2);
      i--;
      continue;
    }
    var northWest = matrix[i - 1][j - 1];
    var west = matrix[i - 1][j];
    var north = matrix[i][j - 1];

    var min = Math.min(north, west, northWest);

    if (min === west) {
      edits.unshift(2); //delete
      i--;
      current = west;
    } else if (min === northWest ) {
      if (northWest === current) {
        edits.unshift(0); //no change
      } else {
        edits.unshift(1); //update
        current = northWest;
      }
      i--;
      j--;
    } else {
      edits.unshift(3); //add
      j--;
      current = north;
    }
  }
  var LEAVE = 0;
  var ADD = 3;
  var DELELE = 2;
  var UPDATE = 1;
  var n = 0;m=0;
  var steps = [];
  var step = { index: null, add:0, removed:[] };

  for(var i=0;i<edits.length;i++){
    if(edits[i] > 0 ){ // NOT LEAVE
      if(step.index === null){
        step.index = m;
      }
    } else { //LEAVE
      if(step.index != null){
        steps.push(step)
        step = {index: null, add:0, removed:[]};
      }
    }
    switch(edits[i]){
      case LEAVE:
        n++;
        m++;
        break;
      case ADD:
        step.add++;
        m++;
        break;
      case DELELE:
        step.removed.push(arr1[n])
        n++;
        break;
      case UPDATE:
        step.add++;
        step.removed.push(arr1[n])
        n++;
        m++;
        break;
    }
  }
  if(step.index != null){
    steps.push(step)
  }
  return steps
}



// diffObject
// ----
// test if obj1 deepEqual obj2
function diffObject( now, last, diff, keyOf, lastTrackInfo ){

  if(!diff){

    for( var j in now ){
      if( last[j] !== now[j] ) return true
    }

    for( var n in last ){
      if(last[n] !== now[n]) return true;
    }

  }else{

    var nValues = _.values( now );
    var lValues = _.values( last );

    /**
     * [description]
     * @param  {[type]} a    [description]
     * @param  {[type]} b){                   return now[b] [description]
     * @return {[type]}      [description]
     */
    if(typeof keyOf === 'function'){
      return diffTrack( nValues, lValues, keyOf, lastTrackInfo);
    }
    return diffArray( nValues, lValues, diff);

  }

  return false;
}




module.exports = {
  diffArray: diffArray,
  diffObject: diffObject,
  diffTrack: diffTrack
}
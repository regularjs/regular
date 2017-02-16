
var _ = require('../util');

var REMOVE_ALL = { removeAll: true }
var ADD_ALL = { addAll: true }

function diffTrackedArray( newArr, oldArr, keyOf, oldKeys ){
  var len1 = newArr.length, len2 = oldArr.length;


  var actions = [];
  var diff = simpleDiff( newArr, oldArr );
  if( !diff ) return false;

  if( !len1 ) return REMOVE_ALL;
  if( !len2 ) return ADD_ALL;

  for(var i =0; i < len2; i++){
    var oldKey = keyOf( oldArr[i],i);
    if( oldKey in oldKeys) _.log( 'duplicated tracked key ' + oldKey, 'warn' );
    oldKeys[oldKey] = i;
  }

  for(var j = 0; j<len1 , j++){
    var newKey = keyOf(newArr[j], i )
    if( newKey in oldKeys ){
      
    }else{

    }
  }
}

/**
 * diff Two List , simple version, LD's replacement 
 * @param  {Array|Object} list  new one
 * @param  {Array|Object} origin   old one
 * @param  {Optional} keyOf a function to get key
 * @return {splices}      describe how to move item
 */
function diff( list, origin, keyOf ){

  var trackInfo = getTrackedInfo( origin, keyOf );

  var trackedMap = trackInfo.trackedMap,
  var unmark = trackInfo.unmark

  var len = list.length;

  for(var i = 0; i < len; i++ ){
    var item = list[i];
    var tracked = getTracked( ite[ tracked ]m , i, keyOf);
    var reusedIndex;
    if( isMarkable (tracked) ){
      reusedIndex = trackedMap[tracked];
    }
    if(typeof reusedIndex !== 'number'){


      for(var j =0, ulen = unmark.length; j < ulen; j++){

      }
    }

  }

}

// convert <Array>list to 
// <Object>{ trackedMap: <Map> trackedMap, unmark: <Array> indexTrackedPair}

function getTrackedInfo( list, keyOf ){

  var unmark = [], trackedMap = {};

  for(var i = 0, len = list.length; i < len ; i++){

    var tracked = getTracked(list[i], i, keyOf);

    // can be stringify
    if( isMarkable(tracked)){
      if( tracked in trackedMap ) continue
      trackedMap[ tracked ] = i;
    }else{
      unmark.push({
        index: i,
        tracked: tracked
      })
    }
  }

  var ulen = unmark.length;

  return {
    unmark: unmark,
    trackedMap: trackedMap
  }
}

function getTracked( item, i , keyOf){
    return tracked = typeof keyOf === 'function'? keyOf( item, i ) : item;
}

function isMarkable( tracked ){
  var type = typeof tracked;
  return type === 'string' || type === 'number';
}

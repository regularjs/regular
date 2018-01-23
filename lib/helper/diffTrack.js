
var _ = require('../util');

var dconst = require('../const').DIFF
var ADD_ALL = dconst.ADD_ALL
var REMOVE_ALL = dconst.REMOVE_ALL


// tracked 与 ls不同， 我们要确保所有被tracked的数据对应的节点是存在的，不能有任何损失
function diffTrack( newArr, oldArr, keyOf  ){

  var olen = oldArr.length;
  var nlen = newArr.length;


  var steps = [];
  var ret = {
    isTrack: true,
    steps:steps
  }

  // 确保当存在无法被keyOf的item时，不会死循环
  // true 说明 不同
  // false 说明 引用相同
  if( !_.simpleDiff(newArr, oldArr) ) return ret;

  ret.dirty = true;

  if( olen && !nlen ) { // 直接删除所有
    createStep( steps, 0,0,olen );
    return ret
  }
  if(nlen && !olen){ //直接添加所有
    createStep(steps, 1,0,nlen);
    return ret
  }

  // 模拟被真实操作的groups获得真实的下标
  var substitute = _.slice( oldArr );
  var newTrack = getTrackInfo( newArr, keyOf );
  var oldTrack = getTrackInfo( oldArr, keyOf );

  var newTrackMap = newTrack.trackMap;
  var oldTrackMap = oldTrack.trackMap;

  var oldRemoved = {};

  // 使用替身数组完成对应操作，模拟DOM操作

  // i 老数据下标， 
  // j 新数组下标
  var untrackIndex = 0, 
    oldUntracked = oldTrack.untrack, 
    oldUntrackedLength = oldUntracked.length;

  // @FIXIT, 当数组对应的key发生改变，而缓存key其实是一种错误开销
  // 暂时将所有untraked的东西都进行删除，实际这是用户的一种错误使用, 可以引发性能开销
  if(oldUntrackedLength){
    while(oldUntrackedLength--){
      var oidx = oldUntracked[oldUntrackedLength];
      remove( substitute, steps, oldUntracked[ oldUntrackedLength ] );
    }
  }

  var len = substitute.length;
  for(var i =0; i<len ;i++){
    var oldItem = substitute[i];
    var oldKey = keyOf( oldItem);

    // 将所有其它不存在与
    if( !newTrackMap.hasOwnProperty(oldKey) ){
      oldRemoved[ oldKey ] = oldTrackMap[ oldKey ]
      remove( substitute, steps, i );
      i--;
      len--;
    }
    
  }


  var jlen = newArr.length;
  // i old index
  // j new index
  var i = 0, j = 0;

  while( j < jlen  ){

    //@TODO 大量重复key的计算
    if(i >= substitute.length){
      insert( substitute, steps, i, 1 );
      i++;
      j++;
      continue
    }
    var oldKey = keyOf( substitute[i] );


    var item = newArr[ j ];
    var key = keyOf( item );

    if( key === oldKey ){
      i++; j++;
      continue;
    }else{
      //先插入一个节点
      insert( substitute, steps, i, 1 );
      i++;
      j++;
      continue;
    }

  }
  // 说明还未完全处理完毕，因为j条件短了

  var slen = substitute.length;
  if( j < slen ){
    createStep(steps, 0, j, slen - j )
    for(var k = j; k < slen; k++ ){
      var oldKey = keyOf( substitute[k]);
      oldRemoved[oldKey] = oldTrackMap[oldKey];
    }
  }
  // 这些将在apply到前台时，被复用
  ret.oldKeyMap = oldRemoved;

  return ret;
}


function createStep(steps ,mode, index, len, oldIndex){
  len = len || 1;
  var last = steps[steps.length-1];
  if(last && last.mode === mode  ){
    if( (mode === 0 && last.index === index) ||
        (mode === 1 && last.index + last.len === index)
      ){
      last.len++;
      return steps;
    }
    
  }
  steps.push( {
    mode: mode,
    index:index,
    len: len
  } );
  return steps;

}

function insert( substitute, steps ,index, len){

  createStep(steps, 1, index, len, steps)
  substitute.splice(index, 0, null)
}

function remove( substitute, steps ,index, len ){
  createStep(steps, 0, index, len)
  substitute.splice(index, 1);
}

// convert <Array>list to 
// <Object>{ trackMap: <Map> trackMap, unmark: <Array> indextrackPair}

function getTrackInfo( list, keyOf ){

  var untrack = [], trackMap = {};

  for(var i = 0, len = list.length; i < len ; i++){

    var item = list[i];
    var trackKey = keyOf(list[i]);

    // can be stringify
    if( !trackMap.hasOwnProperty(trackKey) ){

      trackMap[ trackKey ] = i
    }else{

      untrack.push( i )
    }
  }

  return {
    untrack: untrack,
    trackMap: trackMap
  }
}

function isTrackable( key ){
  var type = typeof key;
  return type !== 'object' && type !== 'undefined';
}


module.exports = diffTrack
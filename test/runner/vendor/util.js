

var ao = expect.Assertion.prototype;


Array.prototype.map = Array.prototype.map || function(callback, thisArg){
  var T, A, k;

     if (this == null) {
       throw new TypeError(" this is null or not defined");
     }

     // 1. 将O赋值为调用map方法的数组.
     var O = Object(this);

     // 2.将len赋值为数组O的长度.
     var len = O.length >>> 0;

     // 4.如果callback不是函数,则抛出TypeError异常.
     if ({}.toString.call(callback) != "[object Function]") {
       throw new TypeError(callback + " is not a function");
     }

     // 5. 如果参数thisArg有值,则将T赋值为thisArg;否则T为undefined.
     if (thisArg) {
       T = thisArg;
     }

     // 6. 创建新数组A,长度为原数组O长度len
     A = new Array(len);

     // 7. 将k赋值为0
     k = 0;

     // 8. 当 k < len 时,执行循环.
     while(k < len) {

       var kValue, mappedValue;

       //遍历O,k为原数组索引
       if (k in O) {

         //kValue为索引k对应的值.
         kValue = O[ k ];

         // 执行callback,this指向T,参数有三个.分别是kValue:值,k:索引,O:原数组.
         mappedValue = callback.call(T, kValue, k, O);

         // 返回值添加到新数组A中.
         A[ k ] = mappedValue;
       }
       // k自增1
       k++;
     }

     // 9. 返回新数组A
     return A;
}

ao.typeEqual = function(list){
  if(typeof list == 'string') list = list.split(',')
  var types = this.obj.map(function(item){
    return item.type
  });
  this.assert(
      expect.eql(types, list) 
    , function(){ return 'expected ' + list + ' to equal ' + types }
    , function(){ return 'expected ' + list + ' to not equal ' + types });
  return this;
}



var dispatchMockEvent = (function(){

    var rMouseEvent = /^(?:click|dblclick|contextmenu|DOMMouseScroll|mouse(?:\w+))$/
    var rKeyEvent = /^key(?:\w+)$/
    function findEventType(type){
      if(rMouseEvent.test(type)) return 'MouseEvent';
      else if(rKeyEvent.test(type)) return 'KeyboardEvent';
      else return 'HTMLEvents'
    }
    return function(el, type){
      var EventType = findEventType(type), ev;

      if(document.createEvent){ // if support createEvent

        switch(EventType){

          case 'MouseEvent':
            ev = document.createEvent('MouseEvent');
            ev.initMouseEvent(type, true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
            break;

          case 'KeyboardEvent':
            ev = document.createEvent(EventType || 'MouseEvent'),
                initMethod = ev.initKeyboardEvent ? 'initKeyboardEvent': 'initKeyEvent';
            ev[initMethod]( type, true, true, null, false, false, false, false, 9, 0 )
            break;

          case 'HTMLEvents':
            ev = document.createEvent('HTMLEvents')
            ev.initEvent(type, true, true)
        }
        el.dispatchEvent(ev);
      }else{
        try{
          el[type]()
        }catch(e){
          // TODO...
        }
      }
    }
})();


if(typeof window!=='undefined'){
  window.dispatchMockEvent = dispatchMockEvent
}else if(typeof global !== 'undefined'){
  global.dispatchMockEvent = dispatchMockEvent;
}
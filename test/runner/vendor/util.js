var ao = expect.Assertion.prototype;


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


expect.template = (function(){
  var cache = {};
  return {
    get: function(name){
      return cache[name];
    },
    set: function(fn){
      return (cache[fn.name] = fn.toString().match(/\/\*([\s\S]*)\*\//)[1].trim())
    }
  }
})()


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

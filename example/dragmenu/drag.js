
/**
 * simple drag 
 */
var dom = Regular.dom;
void function(){
  Regular.events.drag = function(elem, fire){
    var tid;
    function start(ev){
      ev.preventDefault();
      // delay
      tid = setTimeout(function(){
        dom.on(document, 'mousemove', move);
        dom.on(document, 'mouseup', end);
        fire({type: 'dragstart', target: elem, pageX: ev.pageX, pageY: ev.pageY});
      },200)
    }
    function move(ev){
      ev.preventDefault();
      fire({type: 'dragmove', target:elem, pageX: ev.pageX, pageY: ev.pageY})
    }

    function end(ev){
      ev.preventDefault();
      ev.stopImmediatePropagation();
      fire({type: 'dragend', pageX: ev.pageX, pageY: ev.pageY, target: elem});
      dom.off(document, 'mousemove', move);
      dom.off(document, 'mouseup', end);
    }
    function cancel(ev){clearTimeout(tid);}

    dom.on(elem, 'mousedown', start);
    dom.on(elem, 'mouseup', cancel);

    return function destroy(){
      dom.off(elem, 'mousedown', start);
      dom.off(elem, 'mouseup', cancel);
    }
  }
}();
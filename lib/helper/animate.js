var _ = require("../util");
var dom  = require("../dom");
var animate = {};
var env = require("../env");


if(typeof window !== 'undefined'){
var 
  transitionEnd = 'transitionend', 
  animationEnd = 'animationend', 
  transitionProperty = 'transition', 
  animationProperty = 'animation';

if(!('ontransitionend' in window)){
  if('onwebkittransitionend' in window) {
    
    // Chrome/Saf (+ Mobile Saf)/Android
    transitionEnd += ' webkitTransitionEnd';
    transitionProperty = 'webkitTransition'
  } else if('onotransitionend' in dom.tNode || navigator.appName === 'Opera') {

    // Opera
    transitionEnd += ' oTransitionEnd';
    transitionProperty = 'oTransition';
  }
}
if(!('onanimationend' in window)){
  if ('onwebkitanimationend' in window){
    // Chrome/Saf (+ Mobile Saf)/Android
    animationEnd += ' webkitAnimationEnd';
    animationProperty = 'webkitAnimation';

  }else if ('onoanimationend' in dom.tNode){
    // Opera
    animationEnd += ' oAnimationEnd';
    animationProperty = 'oAnimation';
  }
}
}

/**
 * inject node with animation
 * @param  {[type]} node      [description]
 * @param  {[type]} refer     [description]
 * @param  {[type]} direction [description]
 * @return {[type]}           [description]
 */
animate.inject = function( node, refer ,direction, callback ){
  callback = callback || _.noop;
  if( Array.isArray(node) ){
    var fragment = dom.fragment();
    var count=0;

    for(var i = 0,len = node.length;i < len; i++ ){
      fragment.appendChild(node[i]); 
    }
    dom.inject(fragment, refer, direction);

    // if all nodes is done, we call the callback
    var enterCallback = function (){
      count++;
      if( count === len ) callback();
    }
    if(len === count) callback();
    for( i = 0; i < len; i++ ){
      if(node[i].onenter){
        node[i].onenter(enterCallback);
      }else{
        enterCallback();
      }
    }
  }else{
    if(!node) return;
    dom.inject( node, refer, direction );
    if(node.onenter){
      node.onenter(callback)
    }else{
      callback();
    }
  }
}

/**
 * remove node with animation
 * @param  {[type]}   node     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */

animate.remove = function(node, callback){
  if(!node) return;
  var count = 0;
  function loop(){
    count++;
    if(count === len) callback && callback()
  }
  if( Array.isArray(node) ){
    for(var i = 0, len = node.length; i < len ; i++){
      animate.remove(node[i], loop)
    }
    return;
  }
  if(typeof node.onleave ==='function'){
    node.onleave(function(){
      removeDone(node, callback)
    })
  }else{
    removeDone(node, callback)
  }
}

function removeDone(node, callback){
    dom.remove(node);
    callback && callback();
}



animate.startClassAnimate = function ( node, className,  callback, mode ){
  var activeClassName, timeout, tid, onceAnim;
  if( (!animationEnd && !transitionEnd) || env.isRunning ){
    return callback();
  }

  if(mode !== 4){
    onceAnim = _.once(function onAnimateEnd(){
      if(tid) clearTimeout(tid);

      if(mode === 2) {
        dom.delClass(node, activeClassName);
      }
      if(mode !== 3){ // mode hold the class
        dom.delClass(node, className);
      }
      dom.off(node, animationEnd, onceAnim)
      dom.off(node, transitionEnd, onceAnim)

      callback();

    });
  }else{
    onceAnim = _.once(function onAnimateEnd(){
      if(tid) clearTimeout(tid);
      callback();
    });
  }
  if(mode === 2){ // auto removed
    dom.addClass( node, className );

    activeClassName = _.map(className.split(/\s+/), function(name){
       return name + '-active';
    }).join(" ");

    dom.nextReflow(function(){
      dom.addClass( node, activeClassName );
      timeout = getMaxTimeout( node );
      tid = setTimeout( onceAnim, timeout );
    });

  }else if(mode===4){
    dom.nextReflow(function(){
      dom.delClass( node, className );
      timeout = getMaxTimeout( node );
      tid = setTimeout( onceAnim, timeout );
    });

  }else{
    dom.nextReflow(function(){
      dom.addClass( node, className );
      timeout = getMaxTimeout( node );
      tid = setTimeout( onceAnim, timeout );
    });
  }



  dom.on( node, animationEnd, onceAnim )
  dom.on( node, transitionEnd, onceAnim )
  return onceAnim;
}


animate.startStyleAnimate = function(node, styles, callback){
  var timeout, onceAnim, tid;

  dom.nextReflow(function(){
    dom.css( node, styles );
    timeout = getMaxTimeout( node );
    tid = setTimeout( onceAnim, timeout );
  });


  onceAnim = _.once(function onAnimateEnd(){
    if(tid) clearTimeout(tid);

    dom.off(node, animationEnd, onceAnim)
    dom.off(node, transitionEnd, onceAnim)

    callback();

  });

  dom.on( node, animationEnd, onceAnim )
  dom.on( node, transitionEnd, onceAnim )

  return onceAnim;
}


/**
 * get maxtimeout
 * @param  {Node} node 
 * @return {[type]}   [description]
 */
function getMaxTimeout(node){
  var timeout = 0,
    tDuration = 0,
    tDelay = 0,
    aDuration = 0,
    aDelay = 0,
    ratio = 5 / 3,
    styles ;

  if(window.getComputedStyle){

    styles = window.getComputedStyle(node),
    tDuration = getMaxTime( styles[transitionProperty + 'Duration']) || tDuration;
    tDelay = getMaxTime( styles[transitionProperty + 'Delay']) || tDelay;
    aDuration = getMaxTime( styles[animationProperty + 'Duration']) || aDuration;
    aDelay = getMaxTime( styles[animationProperty + 'Delay']) || aDelay;
    timeout = Math.max( tDuration+tDelay, aDuration + aDelay );

  }
  return timeout * 1000 * ratio;
}

function getMaxTime(str){

  var maxTimeout = 0, time;

  if(!str) return 0;

  str.split(",").forEach(function(str){

    time = parseFloat(str);
    if( time > maxTimeout ) maxTimeout = time;

  });

  return maxTimeout;
}

module.exports = animate;
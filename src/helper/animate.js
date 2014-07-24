var _ = require("../util");
var dom  = require("../dom.js");
var animate = {};
var env = require("../env.js");


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
    var total = 0, count=0;

    for(var i = 0,len = node.length;i < len; i++ ){
      fragment.appendChild(node[i]); 
    }
    dom.inject(fragment, refer, direction);

    var enterCallback = function (){
      count++;
      if( count === count ) callback();
    }
    for( i = 0; i < len; i++ ){

      if( node[i].nodeType === 1){
        total++;
        startClassAnimate( node[i], 'r-enter', enterCallback , 1)
      }

      if(total === count) callback();
    }
  }else{
    dom.inject( node, refer, direction );
    if( node.nodeType === 1 && callback !== false ){
      return startClassAnimate( node, 'r-enter', callback , 1);
    }
    // ignored else
    
  }
}

/**
 * remove node with animation
 * @param  {[type]}   node     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
animate.remove = function(node, callback){
  callback = callback || _.noop;
  return startClassAnimate( node, 'r-leave', function(){
    dom.remove( node );
    callback();
  }, 1)
}



var startClassAnimate = animate.startClassAnimate = function ( node, className,  callback, mode ){
  var animtion = dom.attr( node, 'r-animate' ), 
    activeClassName, timeout, tid, onceAnim;
  if((!animationEnd && !transitionEnd) || env.isRunning ){
    return callback();
  }


  onceAnim = _.once(function onAnimateEnd(){
    if(tid) clearTimeout(tid);
    console.log("END")

    if(mode === 1) {
      dom.delClass(node, activeClassName);
    }
    dom.delClass(node, className);
    dom.off(node, animationEnd, onceAnim)
    dom.off(node, transitionEnd, onceAnim)

    callback();

  });
  if(mode == 1){ // auto removed
    dom.addClass( node, className );
    activeClassName = className.split(/\s+/).map(function(name){
       return name + '-active';
    }).join(" ");
    dom.nextReflow(function(){
      dom.addClass( node, activeClassName );
      timeout = getMaxTimeout( node );
      tid = setTimeout( onceAnim, timeout );
    })
  }else{
    dom.nextReflow(function(){
      dom.addClass( node, className );
      timeout = getMaxTimeout( node );
      tid = setTimeout( onceAnim, timeout );
    })
  }



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
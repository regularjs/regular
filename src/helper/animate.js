var _ = require("../util");
var dom  = require("../dom.js");
var animate = {};
var env = require("../env.js");


var transitionEnd = 'transitionend', 
  animationEnd = 'animationend', 
  transitionProperty = 'transition', 
  animationProperty = 'animation';
if('ontransitionend' in window) {
  // W3C ignored @TODO
  // transitionEnd = 
} else if('onwebkittransitionend' in window) {
  // Chrome/Saf (+ Mobile Saf)/Android
  transitionEnd += ' webkitTransitionEnd';
  transitionProperty = 'webkitTransition'
} else if('onotransitionend' in dom.tNode || navigator.appName == 'Opera') {
  // Opera
  transitionEnd += ' oTransitionEnd';
  transitionProperty = 'oTransition';
}

if('onanimationend' in window){
  // W3C ignored @TODO
  // animationEnd = 'animationend';
}else if ('onwebkitanimationend' in window){
  // Chrome/Saf (+ Mobile Saf)/Android
  animationEnd += ' webkitAnimationEnd';
  animationProperty = 'webkitAnimation';

}else if ('onoanimationend' in dom.tNode){
  // Opera
  animationEnd += ' oAnimationEnd';
  animationProperty = 'oAnimation';
}



/**
 * inject node with animation
 * @param  {[type]} node      [description]
 * @param  {[type]} refer     [description]
 * @param  {[type]} direction [description]
 * @return {[type]}           [description]
 */
animate.inject = function(node, refer ,direction, callback){

  callback = callback|| _.noop;
  if(Array.isArray(node)){
    var fragment = dom.fragment();
    var total = 0, count=0;
    for(var i = 0,len = node.length;i < len; i++ ){
      fragment.appendChild(node[i]); 
    }
    dom.inject(fragment, refer, direction);
    for(var i = 0; i < len; i++ ){
      if(node[i].nodeType===1){
        total++;
        startAnimate(node[i], 'r-enter', function(){
          count++;
          if(count===count) callback();
        })
      }
      if(total == count) callback();
    }
  }else{
    dom.inject(node, refer, direction);
    if(node.nodeType === 1 && callback !== false){
      startAnimate(node, 'r-enter', callback);
    }else{
      // ignored
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
  callback = callback || _.noop;;
  var d = +new Date();
  startAnimate(node, 'r-leave', function(){
    dom.remove(node);
    callback();
  })
}


function startAnimate(node, className, callback){
  var animtion = dom.attr(node ,'r-animate')
  if((!animationEnd && !transitionEnd) || env.isRunning || !animtion){
    return callback();
  }

  var activeClassName = className + '-active';
  dom.addClass(node, className);
  dom.on(node, animationEnd, onAnimateEnd)
  dom.on(node, transitionEnd, onAnimateEnd)
  var timeout = getMaxTimeout(node);
  var isEnd = false;
  dom.nextReflow(function(){
    dom.addClass(node, activeClassName);
  })
  var tid = setTimeout(onAnimateEnd, timeout);

  function onAnimateEnd(ev){
    clearTimeout(tid);
    dom.delClass(node, activeClassName);
    dom.delClass(node, className);
    dom.off(node, animationEnd, onAnimateEnd)
    dom.off(node, transitionEnd, onAnimateEnd)
    callback();
  }
}


"<div r-animation={{left? 'left': 'right'}}></div>"

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
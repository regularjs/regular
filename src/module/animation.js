var // packages
  _ = require("../util.js"),
 animate = require("../helper/animate.js"),
 parse = require("../helper/parse.js"),
 Regular = require("../Regular.js");


var // variables
  rClassName = /^[-\w]+(\s[-\w]+)*$/,
  rCommaSep = /[\r\n\f ]*,[\r\n\f ]*(?=\w+\:)/, //  dont split comma in  Expression
  CONDITION_COMMAND = "when",
  EVENT_COMMAND = "when",
  THEN_COMMAND = "then";

/**
 * Animation Plugin
 * @param {Component} Component 
 */

var _animates = 
function AnimationPlugin( Component, Regular ){

  Component.directive( "r-animate", processAnimate)
  if( typeof Regular.animate !== "function" ){
    Regular._animates = {}
    Regular.animate = function(name, config){
      Regular._animates[name] = config;
    }
  }

}

// hancdle the r-animate directive
// el : the element to process
// value: the directive value
function processAnimate( el, value){
  value = value.trim();
  var sentences = value.split( ";" ), sentence;
  var context = this;
  sentences.map( function( sentence ){
    sentence = sentence.trim();
    if(!sentence) return;
    return processSentence( sentence, context, el );

  }).filter(function( id ){

    return typeof id === "number";

  })


}

// process each sentence
// - setence
// - context : the component
// - el:  the bound element
function processSentence( sentence, context, el ){
  var composites = sentence.split( rCommaSep ), 
    parsed = {chains: []}, chains = parsed.chains,
    composite, command, action, len, current = 0, tmp, animator;


  for( var i = 0, len = composites.length; i < len; i++ ){

    composite = composites[i];
    tmp = composite.split(":");
    command = tmp[0] && tmp[0].trim();
    action = tmp[1] && tmp[1].trim();

    if( !command ) throw "need command name in composite of animation(e.g. then)";
    if( i === 0 && command !== CONDITION_COMMAND ) throw "the first composite in sentence must be " + CONDITION_COMMAND + " or" + EVENT_COMMAND;

    if( command === CONDITION_COMMAND ){
      // convert to Expression
    }

    if( command === EVENT_COMMAND){
      continue
    }
    switch(command){
      case CONDITION_COMMAND: 
        parsed.condition = parse.expression( action );
        break;
      case EVENT_COMMAND:
        parsed.condition = parse.expression( action );
        break;
      case THEN_COMMAND:
        animator = Regular.animate(action);
        if( animator ) chains.push( animator.call( context, el ) );
        
        if( rClassName.test( action ) ){  // if action is ClassName

          chains.push( bindClassName( action, context, el ) );

        }

        if( action ){

          var parsed = parse.expression(action);

        }
    }


    if( command === THEN_COMMAND ){
    }

  }

  len  = chains.length;

  function done(){
    if( ++current < len )  next();
    // else compelete
  }
  function next(){
    chains[current](done);
  }
  return context.$watch(parsed.condition, function(value){
    if(!!value){
      current = 0;
      next();
    } 
  })
}


function bindClassName(className, context, elem){
  return function(done){
    animate.startClassAnimate(elem, className, done);
  }
}







Regular.plugin( "animate", AnimationPlugin );
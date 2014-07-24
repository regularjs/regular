var // packages
  _ = require("../util.js"),
 animate = require("../helper/animate.js"),
 animate = require("../dom.js"),
 parse = require("../helper/parse.js"),
 Regular = require("../Regular.js");


var // variables
  rClassName = /^[-\w]+(\s[-\w]+)*$/,
  rCommaSep = /[\r\n\f ]*,[\r\n\f ]*(?=\w+\:)/, //  dont split comma in  Expression
  WHEN_COMMAND = "when",
  EVENT_COMMAND = "on",
  THEN_COMMAND = "then";

/**
 * Animation Plugin
 * @param {Component} Component 
 */



Regular._animates = {
  "on": function(seed){
    seed.reset();
    return function destroy(){

    }
  },
  "when": function(seed){
    seed.reset();

    return function(done){

    }
  },
  "wait": function( seed ){
    var timeout = parseInt( seed.param ) || 0, element = seed.element;
    return function(done){
      setTimeout( done, timeout );
    }
    
  },
  "class": function(seed){

    var tmp = seed.param.split(",");
      className = tmp[0] || "",
      mode = parseInt(tmp[1]) || 1;

    animate.startClassAnimate( seed.element, className , seed.done, mode );

  },
  "call": function(){
    this.$get( seed.param );

  },
  "emit": function(){
    this.$emit( seed, seed)
  },
  "style": function(){

  },
  "remove": function(){

  }
}



Regular.animate = function(name, config){
  if(typeof config === "undefined") return Regular._animates[name];
  Regular._animates[name] = config;
}


function AnimationPlugin( Component, Regular ){
  Component.directive( "r-animate", processAnimate)
}

// hancdle the r-animate directive
// el : the element to process
// value: the directive value
function processAnimate( el, value ){
  value = value.trim();
  var composites = value.split(";"), 
    composite, context = this, parsed = {chains: []},
    command, param, len, current = 0, tmp, animator;

  for( var i = 0, len = composites.length; i < len; i++ ){

    composite = composites[i];
    tmp = composite.split(":");
    command = tmp[0] && tmp[0].trim();
    param = tmp[1] && tmp[1].trim();

    if( !command ) throw "need command name in composite of animation(e.g. when)";

    if( command === WHEN_COMMAND ){
      // convert to Expression
    }

    if( command === EVENT_COMMAND){
      continue
    }

    switch(command){
      case WHEN_COMMAND: 
        parsed.condition = parse.expression( param );
        break;
      case EVENT_COMMAND:
        parsed.condition = parse.expression( param );
        break;
      case THEN_COMMAND:
        animator = Regular.animate(param);
        if( animator ) chains.push( animator.call( context, el ) );
        
        if( rClassName.test( param ) ){  // if param is ClassName

          chains.push( bindClassName( param, context, el ) );

        }

        if( param ){

          var parsed = parse.expression(param);

        }
    }
  }


}

// process each sentence
// - setence
// - context : the component
// - el:  the bound element
function processSentence( sentence, context, el ){
  // var composites = sentence.split( rCommaSep )




  // len  = chains.length;

  // function done(){
  //   if( ++current < len )  next();
  //   // else compelete
  // }
  // function next(){
  //   chains[current](done);
  // }
  // return context.$watch(parsed.condition, function(value){
  //   if(!!value){
  //     current = 0;
  //     next();
  //   } 
  // })
}





function bindClassName(className, context, elem){
    animate.startClassAnimate(elem, className, done);
}






Regular.plugin( "animate", AnimationPlugin );
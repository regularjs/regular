var // packages
  _ = require("../util"),
 animate = require("../helper/animate"),
 dom = require("../dom"),
 Regular = require("../render/client");


var // variables
  rClassName = /^[-\w]+(\s[-\w]+)*$/,
  rCommaSep = /[\r\n\f ]*,[\r\n\f ]*(?=\w+\:)/, //  dont split comma in  Expression
  rStyles = /^\{.*\}$/, //  for Simpilfy
  rSpace = /\s+/, //  for Simpilfy
  WHEN_COMMAND = "when",
  EVENT_COMMAND = "on",
  THEN_COMMAND = "then";

/**
 * Animation Plugin
 * @param {Component} Component 
 */


function createSeed(type){

  var steps = [], current = 0, callback = _.noop;
  var key;

  var out = {
    type: type,
    start: function(cb){
      key = _.uid();
      if(typeof cb === "function") callback = cb;
      if(current> 0 ){
        current = 0 ;
      }else{
        out.step();
      }
      return out.compelete;
    },
    compelete: function(){
      key = null;
      callback && callback();
      callback = _.noop;
      current = 0;
    },
    step: function(){
      if(steps[current]) steps[current ]( out.done.bind(out, key) );
    },
    done: function(pkey){
      if(pkey !== key) return; // means the loop is down
      if( current < steps.length - 1 ) {
        current++;
        out.step();
      }else{
        out.compelete();
      }
    },
    push: function(step){
      steps.push(step)
    }
  }

  return out;
}

Regular._addProtoInheritCache("animation")


// builtin animation
Regular.animation({
  "wait": function( step ){
    var timeout = parseInt( step.param ) || 0
    return function(done){
      // _.log("delay " + timeout)
      setTimeout( done, timeout );
    }
  },
  "class": function(step){
    var tmp = step.param.split(","),
      className = tmp[0] || "",
      mode = parseInt(tmp[1]) || 1;

    return function(done){
      // _.log(className)
      animate.startClassAnimate( step.element, className , done, mode );
    }
  },
  "call": function(step){
    var fn = this.$expression(step.param).get, self = this;
    return function(done){
      // _.log(step.param, 'call')
      fn(self);
      self.$update();
      done()
    }
  },
  "emit": function(step){
    var param = step.param;
    var tmp = param.split(","),
      evt = tmp[0] || "",
      args = tmp[1]? this.$expression(tmp[1]).get: null;

    if(!evt) throw Error("you shoud specified a eventname in emit command");

    var self = this;
    return function(done){
      self.$emit(evt, args? args(self) : undefined);
      done();
    }
  },
  // style: left {10}px,
  style: function(step){
    var styles = {}, 
      param = step.param,
      pairs = param.split(","), valid;
    pairs.forEach(function(pair){
      pair = pair.trim();
      if(pair){
        var tmp = pair.split( rSpace ),
          name = tmp.shift(),
          value = tmp.join(" ");

        if( !name || !value ) throw Error("invalid style in command: style");
        styles[name] = value;
        valid = true;
      }
    })

    return function(done){
      if(valid){
        animate.startStyleAnimate(step.element, styles, done);
      }else{
        done();
      }
    }
  }
})



// hancdle the r-animation directive
// el : the element to process
// value: the directive value
function processAnimate( element, value ){
  var Component = this.constructor;

  if(_.isExpr(value)){
    value = value.get(this);
  }

  value = value.trim();

  var composites = value.split(";"), 
    composite, context = this, seeds = [], seed, destroies = [], destroy,
    command, param , current = 0, tmp, animator, self = this;

  function reset( type ){
    seed && seeds.push( seed )
    seed = createSeed( type );
  }

  function whenCallback(start, value){
    if( !!value ) start()
  }

  function animationDestroy(element){
    return function(){
      element.onenter = null;
      element.onleave = null;
    } 
  }

  for( var i = 0, len = composites.length; i < len; i++ ){

    composite = composites[i];
    tmp = composite.split(":");
    command = tmp[0] && tmp[0].trim();
    param = tmp[1] && tmp[1].trim();

    if( !command ) continue;

    if( command === WHEN_COMMAND ){
      reset("when");
      this.$watch(param, whenCallback.bind( this, seed.start ) );
      continue;
    }

    if( command === EVENT_COMMAND){
      reset(param);
      if( param === "leave" ){
        element.onleave = seed.start;
        destroies.push( animationDestroy(element) );
      }else if( param === "enter" ){
        element.onenter = seed.start;
        destroies.push( animationDestroy(element) );
      }else{
        if( ("on" + param) in element){ // if dom have the event , we use dom event
          destroies.push(this._handleEvent( element, param, seed.start ));
        }else{ // otherwise, we use component event
          this.$on(param, seed.start);
          destroies.push(this.$off.bind(this, param, seed.start));
        }
      }
      continue;
    }

    var animator =  Component.animation(command) 
    if( animator && seed ){
      seed.push(
        animator.call(this,{
          element: element,
          done: seed.done,
          param: param 
        })
      )
    }else{
      throw Error( animator? "you should start with `on` or `event` in animation" : ("undefined animator 【" + command +"】" ));
    }
  }

  if(destroies.length){
    return function(){
      destroies.forEach(function(destroy){
        destroy();
      })
    }
  }
}


Regular.directive( "r-animation", processAnimate)
Regular.directive( "r-anim", processAnimate)


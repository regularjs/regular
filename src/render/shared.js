var _ = require('../util');
var parse = require('../helper/parse');


function initDefinition(context, definition, beforeConfig){

  var eventConfig, hasInstanceComputed = !!definition.computed, template;
  var usePrototyeString = typeof context.template === 'string' && !definition.template;

  if(definition.events || context.events){
    eventConfig = _.extend(definition.events || {}, context.events);
    if(definition.events) delete definition.events;
  }


  definition.data = definition.data || {};
  definition.computed = definition.computed || {};
  if(context.data) _.extend(definition.data, context.data);
  if(context.computed) _.extend(definition.computed, context.computed);

  var usePrototyeString = typeof context.template === 'string' && !definition.template;

  _.extend(context, definition, true);

  if ( eventConfig ) {
    context.$on( eventConfig );
  }

  // we need add some logic at client.
  beforeConfig && beforeConfig();

  // only have instance computed, we need prepare the property
  if( hasInstanceComputed ) context.computed = handleComputed(context.computed);

  context.$emit( "$config", context.data );
  context.config && context.config( context.data );
  context.$emit( "$afterConfig", context.data );

  template = context.template;

 
  if(typeof template === 'string') {
    template = parse.parse(template);
    if(usePrototyeString) {
    // avoid multiply compile
      context.constructor.prototype.template = template;
    }else{
      delete context.template;
    }
  }
  return template;
}

var handleComputed = (function(){
  // wrap the computed getter;
  function wrapGet(get){
    return function(context){
      return get.call(context, context.data );
    }
  }
  // wrap the computed setter;
  function wrapSet(set){
    return function(context, value){
      set.call( context, value, context.data );
      return value;
    }
  }

  return function( computed ){
    if(!computed) return;
    var parsedComputed = {}, handle, pair, type;
    for(var i in computed){
      handle = computed[i]
      type = typeof handle;

      if(handle.type === 'expression'){
        parsedComputed[i] = handle;
        continue;
      }
      if( type === "string" ){
        parsedComputed[i] = parse.expression(handle)
      }else{
        pair = parsedComputed[i] = {type: 'expression'};
        if(type === "function" ){
          pair.get = wrapGet(handle);
        }else{
          if(handle.get) pair.get = wrapGet(handle.get);
          if(handle.set) pair.set = wrapSet(handle.set);
        }
      } 
    }
    return parsedComputed;
  }
})();



module.exports = {
  // share logic between server and client
  initDefinition: initDefinition,
  handleComputed: handleComputed
}
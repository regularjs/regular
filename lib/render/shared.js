var _ = require('../util');
var config = require('../config');
var parse = require('../helper/parse');
var node = require('../parser/node');


function initDefinition(context, definition, beforeConfig){

  var eventConfig, hasInstanceComputed = !!definition.computed, template;
  var usePrototyeString = typeof context.template === 'string' && !definition.template;

 // template is a string (len < 16). we will find it container first

  definition.data = definition.data || {};
  definition.computed = definition.computed || {};
  if( context.data ) _.extend( definition.data, context.data );
  if( context.computed ) _.extend( definition.computed, context.computed );

  var listeners = context._eventListeners || [];
  var normListener;
  // hanle initialized event binding
  if( definition.events){
    normListener = _.normListener(definition.events);
    if(normListener.length){
      listeners = listeners.concat(normListener)
    }
    delete definition.events;
  }


  definition.data = definition.data || {};
  definition.computed = definition.computed || {};
  if(context.data) _.extend(definition.data, context.data);
  if(context.computed) _.extend(definition.computed, context.computed);

  var usePrototyeString = typeof context.template === 'string' && !definition.template;

  _.extend(context, definition, true);



  if(listeners && listeners.length){
    listeners.forEach(function( item ){
      context.$on(item.type, item.listener)
    })
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


function prepareAttr ( ast ,directive ){
  if(ast.parsed ) return ast;
  var value = ast.value;
  var name=  ast.name, body, constant;
  if(typeof value === 'string' && ~value.indexOf(config.BEGIN) && ~value.indexOf(config.END) ){
    if( !directive || !directive.nps ) {
      var parsed = parse.parse(value, { mode: 2 });
      if(parsed.length === 1 && parsed[0].type === 'expression'){ 
        body = parsed[0];
      } else{
        constant = true;
        body = [];
        parsed.forEach(function(item){
          if(!item.constant) constant=false;
          // silent the mutiple inteplation
            body.push(item.body || "'" + item.text.replace(/'/g, "\\'") + "'");        
        });
        body = node.expression("[" + body.join(",") + "].join('')", null, constant);
      }
      ast.value = body;
    }
  }
  ast.parsed = true;
  return ast;
}

module.exports = {
  // share logic between server and client
  initDefinition: initDefinition,
  handleComputed: handleComputed,
  prepareAttr: prepareAttr
}
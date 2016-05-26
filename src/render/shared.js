
var shared = module.exports = {
  initDefinition: function(context, definition, afterPrepare){


    context.extra = definition.extra;

    var eventConfig;

    if(definition.events || context.events){
      eventConfig = _.extend(definition.events || {}, context.events);
      if(definition.events) delete definition.events;
    }

    definition.data = definition.data || {};
    definition.computed = definition.computed || {};
    if(context.data) _.extend(definition.data, context.data);
    if(context.computed) _.extend(definition.computed, context.computed);

    _.extend(context, definition, true);

    if(eventConfig){
      context.$on(eventConfig);
    }

    afterPrepare && afterPrepare();


    context.$emit( "$config", context.data);
    context.config && context.config(context.data);
    context.$emit( "$afterConfig", context.data);

  }
}
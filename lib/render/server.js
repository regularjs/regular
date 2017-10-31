// server side rendering for regularjs


var _ = require('../util');
var parser = require('../helper/parse');
var diffArray = require('../helper/diff').diffArray;
var shared = require('./shared');






/**
 * [compile description]
 * @param  {[type]} ast     [description]
 * @param  {[type]} options [description]
 */

function SSR (Component){

  this.Component = Component;
}


var ssr = _.extend(SSR.prototype, {});


ssr.render = function( definition){

  definition = definition || {};

  var context = this.context = Object.create(this.Component.prototype)

  var template = shared.initDefinition(context, definition);

  return this.compile(template);

}

ssr.compile = function(ast){

  if(typeof ast === 'string'){
    ast = parser.parse(ast);
  }
  return this.walk(ast)
}


ssr.walk = function(ast, options){

  if(!ast) return '';
  var type = ast.type; 

  if(Array.isArray(ast)){

    return ast.map(function(item){

      return this.walk(item, options)

    }.bind(this)).join('');

  }

  return this[ast.type](ast, options)

}


ssr.element = function(ast ){

  var children = ast.children,
    attrs = ast.attrs,
    tag = ast.tag;

  if( tag === 'r-component' ){
    attrs.some(function(attr){
      if(attr.name === 'is'){
        tag = attr.value;
        if( _.isExpr(attr.value)) tag = this.get(attr.value);
        return true;
      }
    }.bind(this))
  }

  var Component = this.Component.component(tag);

  if(ast.tag === 'r-component' && !Component){
    throw Error('r-component with unregister component ' + tag)
  }

  if( Component ) return this.component( ast, { 
    Component: Component 
  } );


  var tagObj = {
    body:  children && children.length? this.compile(children) : "" 
  }
  var attrStr = this.walk( attrs, tagObj ).trim();

  return "<" + tag + ( attrStr? " " + attrStr: ""  ) + ">" + tagObj.body +
  "</" + tag + ">"

}



ssr.component = function(ast, options){

  var children = ast.children,
    attrs = ast.attrs,
    data = {},
    Component = options.Component, body;

  if(children && children.length){
    body = function(){
      return this.compile(children)
    }.bind(this)
  }

  attrs.forEach(function(attr){
    if(!_.eventReg.test(attr.name)){
      shared.prepareAttr(attr);
      data[attr.name] = _.isExpr(attr.value)? this.get(attr.value): attr.value
    }
  }.bind(this))


  return SSR.render(Component, {
    $body: body,
    data: data,
    extra: this.extra
  })
}



ssr.list = function(ast){

  var 
    alternate = ast.alternate,
    variable = ast.variable,
    indexName = variable + '_index',
    keyName = variable + '_key',
    body = ast.body,
    context = this.context,
    self = this,
    prevExtra = context.extr;

  var sequence = this.get(ast.sequence);
  var keys, list; 

  var type = _.typeOf(sequence);

  if( type === 'object'){

    keys = Object.keys(list);
    list = keys.map(function(key){return sequence[key]})

  }else{

    list = sequence || [];

  }

  return list.map(function(item, item_index){

    var sectionData = {};
    sectionData[variable] = item;
    sectionData[indexName] = item_index;
    if(keys) sectionData[keyName] = sequence[item_index];
    context.extra = _.extend(
      prevExtra? Object.create(prevExtra): {}, sectionData );
    var section =  this.compile( body );
    context.extra = prevExtra;
    return section;

  }.bind(this)).join('');

}




// {#include } or {#inc template}
ssr.template = function(ast, options){
  var content = this.get(ast.content);
  var type = typeof content;


  if(!content) return '';
  if(type === 'function' ){
    return content();
  }else{
    return this.compile(type !== 'object'? String(content): content)
  }

};

ssr['if'] = function(ast, options){
  var test = this.get(ast.test);  
  if(test){
    if(ast.consequent){
      return this.walk( ast.consequent, options );
    }
  }else{
    if(ast.alternate){
      return this.walk( ast.alternate, options );
    }
  }
}


ssr.expression = function(ast, options){
  var str = this.get(ast);
  return _.escape(str);
}

ssr.text = function(ast, options){
  return _.escape(ast.text) 
}



ssr.attribute = function(attr, options){

  var
    Component = this.Component,
    directive = Component.directive(attr.name);

  
  shared.prepareAttr(attr, directive);
  
  var name = attr.name, 
    value = attr.value || "";

  if( directive ){
    if(directive.ssr){

      // @TODO: 应该提供hook可以控制节点内部  ,比如r-html
      return directive.ssr.call(this.context, _.isExpr(value)? this.get(value): value ,options);
    }
  }else{
    // @TODO 对于boolean 值
    if( _.isExpr(value) ) value = this.get(value); 
    if( _.isBooleanAttr(name)  ){
      if(!!value) return name + " ";
    }else{
      if( value != null ){
        return name + '="' + _.escape(value) + '" ';
      }
    }
  }
}

ssr.get = function(expr){

  var rawget, 
    self = this,
    context = this.context,
    touched = {};

  if(expr.get) return expr.get(context);
  else {
    var rawget = new Function(_.ctxName, _.extName , _.prefix+ "return (" + expr.body + ")")
    expr.get = function(context){
      return rawget(context, context.extra)
    }
    return expr.get(this.context)
  }

}

SSR.render = function(Component, definition){

  return new SSR(Component).render( definition );

}

SSR.escape = _.escape;

module.exports = SSR;

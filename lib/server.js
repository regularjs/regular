
var Server = module.exports = require( './render/server' );

//JSON.stringify 不处理 注入 
Server.safeStringify = function( json ){

  return JSON.stringify.apply( JSON, arguments)
     .replace(/<\/(script)/ig, '<\\/$1')
     .replace(/<!--/g, '<\\!--')
     .replace(/\u2028/g, '\\u2028') // Only necessary if interpreting as JS, which we do
     .replace(/\u2029/g, '\\u2029')
  
}
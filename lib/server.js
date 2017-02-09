
var Server = module.exports = require( './render/server' );

//JSON.stringify 不处理 注入 
Server.safeStringify = function( json ){
  return JSON.stringify.apply( JSON, arguments).replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');
}
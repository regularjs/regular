
exports.dirty = function(){
  global.expect = require('expect.js')
}

exports.clean = function(){
  delete global.expect;
}
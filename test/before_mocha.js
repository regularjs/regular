exports.dirty = function(){
  global.expect = require("expect.js");
  require("./runner/vendor/util.js");
  var path = require("path");

  global.require_lib = function(src){
    return require( path.join(__dirname, "../src/", src));
  }
}

exports.clean = function(){
  delete global.expect;
  delete global._;
  delete global.require_lib;
}



// (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org

// klass: a classical JS OOP façade
// https://github.com/ded/klass
// License MIT (c) Dustin Diaz 2014
  
// inspired by backbone's extend and klass
var _ = require("../util.js"),
  fnTest = /xy/.test(function(){xy}) ? /\bsupr\b/ : /.*/,
  isFn = function(o){return typeof o === "function"};


function wrap(k, fn, supro) {
  return function () {
    var tmp = this.supr;
    this.supr = supro[k];
    var ret = fn.apply(this, arguments);
    this.supr = tmp;
    return ret;
  }
}

function process( what, o, supro ) {
  for ( var k in o ) {
    if (o.hasOwnProperty(k)) {

      what[k] = isFn( o[k] ) && isFn( supro[k] )
        && fnTest.test( o[k] ) ? wrap(k, o[k], supro) : o[k];
    }
  }
}

module.exports = function extend(o){
  var supr = this, proto,
    supro = supr.prototype;

  function fn() {
    supr.apply(this, arguments);
  }

  proto = _.createProto(fn, supro);

  (fn.implement = function (o) {
    process(proto, o, supro); 
    return fn;
  })(o);

  if(supr.__after__) supr.__after__.call(fn, supr, o);
  fn.extend = supr.extend;
  // _.extend(fn, supr, supr.__statics__ || []);
  return fn;
}


// some fixture test;
// ---------------
var _ = require('./util');
exports.svg = (function(){
  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
})();


exports.transition = (function(){
  
})();

// whether have component in initializing
exports.exprCache = _.cache(100);
exports.isRunning = false;

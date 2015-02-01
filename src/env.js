// some fixture test;
// ---------------
var _ = require('./util');
exports.svg = (function(){
  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
})();


exports.browser = typeof document !== "undefined" && document.nodeType;
// whether have component in initializing
exports.exprCache = _.cache(1000);
exports.isRunning = false;

// some fixture test;
// ---------------

exports.browser = typeof document !== "undefined" && document.nodeType;
exports.svg = (function(){
  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
})();

exports.useBury = true;
if (exports.browser) {
  const routerParams = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  window.de = (routerParams.de || window.de);
}
var _ = require('./util');
// whether have component in initializing
exports.exprCache = _.cache(1000);
exports.node = typeof process !== "undefined" && ( '' + process ) === '[object process]';
exports.isRunning = false;

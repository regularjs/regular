var exprCache = require('../env').exprCache;
var _ = require("../util");
var Parser = require("../parser/Parser.js");
module.exports = {
  expression: function(expr, simple){
    // @TODO cache
    if( typeof expr === 'string' && ( expr = expr.trim() ) ){
      expr = exprCache.get( expr ) || exprCache.set( expr, new Parser( expr, { state: 'JST', mode: 2 } ).expression() )
    }
    if(expr) return _.touchExpression( expr );
  },
  parse: function(template){
    return new Parser(template).parse();
  }
}


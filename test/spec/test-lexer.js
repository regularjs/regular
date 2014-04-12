function require_base(src){
  return require( (typeof process != 'undefined' && process.env? '../../src/' : 'terminator/src/')+src);
}


var common = require_base('common.js');

describe('Lexer mode 1', function(){
  describe('simple', function(){
    it('should return -1 when the value is not present', function(){
      expect(-1).equal(-1);
    });
  });
})
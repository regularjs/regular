function require_base(src){
  return require( (typeof process != 'undefined' && process.env? '../../src/' : 'terminator/src/')+src);
}


var common = require_base('common.js');


describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      expect([1,2,3].indexOf(5)).equal(-1);
      expect(common()).equal('common');
    });
  });
})
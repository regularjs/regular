
var Parser = require_lib("parser/Parser.js");
var node = require_lib("parser/node.js");
var _ = require_lib("util.js");

var expr = function(input){
  return expect(parse(input));
}

var raw = function(input){
  return expect(parse(input));
}

var parse = function(input){
  return new Parser(input, {mode: 2, state: 'JST'}).expression()
}



describe("parse Expression", function(){
  it('Primary should parsed as expect', function(){

    console.log(raw("1"))
    raw("1").to.equal(1);
    raw("1.1").to.equal(1.1);
    raw("1.1e1").to.equal(11);
    raw("-1.1e2").to.equal(-110);
    raw("'abc'").to.equal('abc')
    raw("true").to.equal(true)
    raw("false").to.equal(false)
    raw("undefined").to.equal(undefined)
    raw("null").to.equal(null);
    raw("[1,2,3,4]").to.eql([1,2,3,4]);

  })

  it('no depends Expression should return primative type', function(){

    raw("1 + 1").to.equal(2);
    raw("1 + 'a'").to.equal('1a');
    raw("1 || 2").to.equal(1);
    raw("1 && 2").to.equal(2);
    raw("1? 3 : 4").to.equal(3);
    raw("1==1").to.equal(true);
    raw("1>1").to.equal(false);
    raw("1<1").to.equal(false);
    raw("!1").to.equal(false);
    raw("+1").to.equal(1);
    raw("1 + null").to.equal(1);
    raw("1 == '1'").to.equal(true);

  })

  it('deep path should check undefined before return value', function(){
    var data = {a: 1, b: 2}
    var context = {data: data }
    expect(parse('a + b').get(context)).to.equal(3);

  })

})




describe("Parse Expression", function(){

  describe('Array Literal should Parsed as expect', function(){

    it("no constant interplation should return expression when no genertic", function(){

    });

    it("constant interplation should return value", function(){
    });
  })



})






var Parser = require_lib("parser/Parser.js");
var node = require_lib("parser/node.js");
var _ = require_lib("util.js");

var p = function(input){
  return new Parser(input).parse()
}
var p2 = function(input){
  return new Parser(input, {mode: 2}).parse()
}


var eqExp = function(input, result){
  return expect( p(input)[0].expression.body ).eql(result);
}



describe("Parse XML", function(){
  it("pure xml input should return diff ast under mode 1 and 2", function(){
    var input = "<ul><div>hello name</div></ul>";
    var input = "<ul><div>hello name</div></ul>";
    // mode 1
    expect(p(input)).to.eql([
      node.element("ul", undefined, [
        node.element("div", undefined, [
          "hello name"
          ])
      ])
    ]);

    // mode 2
    expect(p2(input)).to.eql([input]);
  });




  it('if directive should parse as expect', function(){
    var if_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_else_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_elseif_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var error_input = "{if}hello{else}<div>{=dadad}</div>{/if}";


    expect(function(){
      p(error_input);
    }).to.throwError();

  })
});


describe('Parse JST', function(){

  describe('mode 1 and mode2 should work as expected', function(){
    it("complex input should parse under mode 1 and 2", function(){
      var input = "{if 1 > test}<div data=data>{-dadad}</div> {else} hello{/if}";

      var json = p(new Array(100).join(input))

      expect( p(input) ).eql([
        node.if(
            node.expression("1>"+_.varName+"['test']",["test"]),
            [node.element("div", undefined, [{"type":"IDENT","value":"dadad","pos":26}])," "], 
            [" hello"])
        ])
      //mode 2
      expect( p2(input) ).eql( [
        node.if(
        {"type":"IDENT","value":"test","pos":4}, 
        ["<div data=data>",{"type":"IDENT","value":"dadad","pos":26},"</div> "], 
        [" hello"])
      ] );
    });

  })

});

describe("Parse Expression", function(){

  describe('Expression Syntax should equal as Javascript Expression', function(){

    it("no constant interplation should return expression when no genertic", function(){
      var input_dot_call = "{-hello.haha('hahaha') + 1 + 1}";
      var input_call_call = "{= hello('name')(1,2,3,4).haha}"
      var input_relation_ident = "{= hello == true == undefined == null }"
      eqExp(input_dot_call, _.varName + "['hello']['haha']('hahaha')+1+1");
      eqExp(input_call_call, _.varName + "['hello']('name')(1,2,3,4)['haha']");
      eqExp(input_relation_ident, _.varName + "['hello']==true==undefined==null");
    });

    it("constant interplation should return value", function(){
      var input_num = "{- -1 + 1 + 1}";
      var input_str = "{= 'a' + 'b' + 1}"
      expect(p(input_num)).eql(
        [node.interplation(1, false)]
      );
      expect(p(input_str)).eql(
        [node.interplation('ab1', true)]
      );
    });
  })



})





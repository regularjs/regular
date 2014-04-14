
var Parser = require_lib("parser/Parser.js");
var node = require_lib("parser/node.js");

var p = function(input){
  return new Parser(input).parse()
}
var p2 = function(input){
  return new Parser(input, {mode: 2}).parse()
}

describe("Parser Test Case", function(){
  it("pure xml input should return diff ast under mode 1 and 2", function(){
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
    expect(p2(input)).to.eql([input])
  });

  it("pure jst parser should equals under mode 1 and mode 2", function(){
    var input = "{list haha as t}{=haha}{/list}";
    expect( p(input) ).eql( [
      node.list({
        "pos": 6,
        "type": "IDENT",
        "value": "haha"
      }, "t", [{
        "pos": 18,
        "type": "IDENT",
        "value": "haha"
      }])
    ] );
    var input = "{list haha as t}{=haha}{/list}";
    expect( p2(input) ).eql( [
      node.list({
        "pos": 6,
        "type": "IDENT",
        "value": "haha"
      }, "t", [{
        "pos": 18,
        "type": "IDENT",
        "value": "haha"
      }])
    ] );
  });


  it("complex input should parse under mode 1 and 2", function(){
    var input = "{if test}<div data=data>{-dadad}</div> {else} hello{/if}";
    expect( p(input) ).eql( [
      node.if(
          {"type":"IDENT","value":"test","pos":4}, 
          [node.element('div', undefined, [{"type":"IDENT","value":"dadad","pos":26}])," "], 
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



  it('if directive should parse as expect', function(){
    var if_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_else_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_elseif_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var error_input = "{if}hello{else}<div>{=dadad}</div>{/if}";


    expect(function(){
      p(error_input);
    }).to.throwError();

  })
  it('list directive should parse as expect', function(){
    var if_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_else_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_elseif_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var error_input = "{if}hello{else}<div>{=dadad}</div>{/if}";


    expect(function(){
      p(error_input);
    }).to.throwError();

  })
  it('macro directive should parse as expect', function(){
    var if_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_else_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_elseif_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var error_input = "{if}hello{else}<div>{=dadad}</div>{/if}";


    expect(function(){
      p(error_input);
    }).to.throwError();
  })

  it('var directive should parse as expect', function(){
    var if_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_else_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_elseif_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var error_input = "{if}hello{else}<div>{=dadad}</div>{/if}";


    expect(function(){
      p(error_input);
    }).to.throwError();
  })

  it('var directive should parse as expect', function(){
    var if_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_else_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var if_elseif_input = "{if test}hello{else}<div>{-dadad}</div>{/if}";
    var error_input = "{if}hello{else}<div>{=dadad}</div>{/if}";


    expect(function(){
      p(error_input);
    }).to.throwError();
  })


})




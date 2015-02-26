var Lexer = require_lib("parser/Lexer.js");
var config = require_lib("config.js");

/**
 * setup template
 */


var l = function(input){
  return new Lexer(input).lex()
}
var l2 = function(input){
  return new Lexer(input, {mode: 2}).lex()
}

describe("Lexer under mode 1 and 2", function(){

  it("pure xml lex should return diff tokens under mode 1 and 2", function(){
    var input = "<ul><div>hello name</div></ul>";
    var input_attr = "<div attr='hello'></div>";
    var input_attr_jst = "<div attr={hello}></div>";
    // mode 1
    expect(l(input))
      .typeEqual("TAG_OPEN,>,TAG_OPEN,>,TEXT,TAG_CLOSE,TAG_CLOSE,EOF");
    // mode 2
    expect(l2(input))
      .typeEqual("TEXT,EOF");

    expect(l(input_attr))
      .typeEqual("TAG_OPEN,NAME,=,STRING,>,TAG_CLOSE,EOF");

    expect(l(input_attr_jst)).typeEqual("TAG_OPEN,NAME,=,EXPR_OPEN,IDENT,END,>,TAG_CLOSE,EOF")


    // expect(function(){
    //   l("<<div>")
    // }).to.throwError();
  })


  it("pure jst lex is equals under mode 1 and mode 2", function(){
    var input = "{#list haha}{haha}{/list}";
    // mode 1
    expect(l(input))
      .typeEqual("OPEN,IDENT,END,EXPR_OPEN,IDENT,END,CLOSE,EOF");

    // mode 2
    expect(l2(input))
      .typeEqual("OPEN,IDENT,END,EXPR_OPEN,IDENT,END,CLOSE,EOF");

  })
  it("inteplation is parsed as expect", function(){
    expect(l2('{hello}'))
      .typeEqual("EXPR_OPEN,IDENT,END,EOF");
  })

  it("complex input should works under mode 1 and 2", function(){

    var input = "{#dada}<div data=data>{dadad}</div>{/dada}";

    // mode 1
    expect(l(input))
      .typeEqual("OPEN,END,TAG_OPEN,NAME,=,NAME,>,EXPR_OPEN,IDENT,END,TAG_CLOSE,CLOSE,EOF");

    // mode 2
    expect(l2(input))
      .typeEqual("OPEN,END,TEXT,EXPR_OPEN,IDENT,END,TEXT,CLOSE,EOF");

  })

  it("config should work", function(){
    config.END = "}}";
    config.BEGIN = "{{";

  })

})




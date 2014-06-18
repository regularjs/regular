
var Parser = require_lib("parser/Parser.js");
var node = require_lib("parser/node.js");
var _ = require_lib("util.js");

var p = function(input){
  return new Parser(input).parse()
}

var p2 = function(input){
  return new Parser(input, {mode: 2}).parse()
}

var s = function(input, jst){
  var parse = jst? p2: p;
  return JSON.stringify(parse(input), null, 2)
}


var eqExp = function(input, result){
  return expect( p(input)[0].expression.body ).eql(result);
}


var list2 = expect.template.set(function list2(){/*
{{#list [a,2,3,4,5] as num}} 
  <p>{{num}}</p>
{{/list}}
*/});




describe("Parse XML", function(){

  describe("basic XML should parsed as expect", function(){
    it("pure xml input should return diff ast under mode 1 and 2", function(){
      var input = "<ul><div>hello name</div></ul>";
      var input2 = "<ul><div>hello name</div></ul>";
      // mode 1
      expect(p(input)).to.eql([
        node.element("ul", [], [
          node.element("div", [], [
            node.text("hello name")
            ])
        ])
      ]);

      // mode 2
      expect(p2(input)).to.eql([node.text(input)]);
    });
  })

  describe("attribute should parsed as expect", function(){
    var string_attr = "<ul class='a'></ul>";
    var expression_attr = "<ul class={{a}}></ul>";
    var inteplation_attr = "<ul class='a {{a}} b'></ul>";
    var inteplation_attr_2 = "<ul class='{{a}}'></ul>";
    var entity_attr = "<ul class=-hl*lo-></ul>";
    var num_attr = "<ul class=1></ul>";
    var empty_attr = "<ul class></ul>";
    it("attribute should accept String", function(){
      expect(p(string_attr)[0].attrs).eql([{ type: 'attribute', name: 'class', value: 'a' } ])
    })

    it("attribute should accept Number", function(){
      expect(p(num_attr)[0].attrs).eql([{ type: 'attribute', name: 'class', value: '1' } ])
    })

    it("attribute should accept expression", function(){
      expect(p(expression_attr)[0].attrs).eql([
        { 
          type: 'attribute',
          name: 'class',
          value: 
            { 
              type: 'expression',
              body: '_d_[\'a\']',
              constant: false,
              setbody: '_d_[\'a\']=_p_' 
            }
        }
      ]);
    })

    it("attribute should accept StringInteplation", function(){
      expect( p(inteplation_attr)[0].attrs[0].value ).eql(
        { 
          type: 'expression',
          body: '[\'a \',_d_[\'a\'],\' b\'].join(\'\')',
          constant: false,
          setbody: false 
        }
      )
      expect( p(inteplation_attr_2)[0].attrs[0].value ).eql(
        { 
          type: 'expression',
          body: '_d_[\'a\']',
          constant: false,
          setbody: '_d_[\'a\']=_p_' 
        }
      )
    })

    it("attribute should accept Entity", function(){
      expect( p(entity_attr)[0].attrs[0].value ).eql("-hl*lo-")
    })

    it("attribute should throw error when encountered excepition", function(){
      expect(function(){
        p('<div name=&>\
          </div>')
      }).to.throwError();
    })

  })


  describe("tag should closed correspond with html5's specs", function(){
    it("read unclosed tag should throw error", function(){
      expect(function(){
        p("<div>")
      }).to.throwError();
    })
    it("read unclosed void tag should not throw error", function(){
      expect(p("<input>")).to.eql([
        { type: 'element',
           tag: 'input',
           attrs: [],
           children: undefined } 
      ])
    })

  })
  describe("some parse feature need work as expect", function(){
    it("should join connected text", function(){

    })
  })

  describe("must thrrow error when Syntax Error", function(){
    it("read unclosed tag_open should throw error", function(){
      expect(function(){
        p("<div")
      }).to.throwError();
    })

  });


});





describe('Parse JST', function(){

  describe("complex if statement should parse correctly", function(){
    var if_input = "{{#if test}}hello{{/if}}";
    var if_else_input = "{{#if test}}hello{{#else}}<div>dadad</div>{{/if}}";
    var if_elseif_input = "{{#if test}}hello{{#elseif test2}}<div>{{dadad}}</div>{{/if}}";
    var if_error = "{{#if test}}<div>hello{{#else}}<div>{{dadad}}</div>{{/if}}</div>";
    it("parse correctly under mode1", function(){

      expect(p(if_input)).to.eql([
        {
          "type": "if",
          "test": {
            "type": "expression",
            "body": "_d_['test']",
            "constant": false,
            "setbody": "_d_['test']=_p_"
          },
          "consequent": [

            {
              "type": "text",
              "text": "hello"
            }
          ],
          "alternate": []
        }
      ]) 
      expect(p(if_else_input)).to.eql([

        {
          "type": "if",
          "test": {
            "type": "expression",
            "body": "_d_['test']",
            "constant": false,
            "setbody": "_d_['test']=_p_"
          },
          "consequent": [
            {
              "type": "text",
              "text": "hello"
            }
          ],
          "alternate": [
            {
              "type": "element",
              "tag": "div",
              "attrs": [],
              "children": [
                {
                  "type": "text",
                  "text": "dadad"
                }
              ]
            }
          ]
        }
      ]) 
      expect(p(if_elseif_input)).to.eql([
        {
          "type": "if",
          "test": {
            "type": "expression",
            "body": "_d_['test']",
            "constant": false,
            "setbody": "_d_['test']=_p_"
          },
          "consequent": [
            {
              "type": "text",
              "text": "hello"
            }
          ],
          "alternate": [
            {
              "type": "if",
              "test": {
                "type": "expression",
                "body": "_d_['test2']",
                "constant": false,
                "setbody": "_d_['test2']=_p_"
              },
              "consequent": [
                {
                  "type": "element",
                  "tag": "div",
                  "attrs": [],
                  "children": [
                    {
                      "type": "expression",
                      "body": "_d_['dadad']",
                      "constant": false,
                      "setbody": "_d_['dadad']=_p_"
                    }
                  ]
                }
              ],
              "alternate": []
            }
          ]
        }
      ]);

      expect(function(){
        p(if_error);
      }).to.throwError();


    })
    


    it("should parse correctly under mode 2", function(){

      expect(p2(if_elseif_input)).to.eql([
        {
          "type": "if",
          "test": {
            "type": "expression",
            "body": "_d_['test']",
            "constant": false,
            "setbody": "_d_['test']=_p_"
          },
          "consequent": [
            {
              "type": "text",
              "text": "hello"
            }
          ],
          "alternate": [
            {
              "type": "if",
              "test": {
                "type": "expression",
                "body": "_d_['test2']",
                "constant": false,
                "setbody": "_d_['test2']=_p_"
              },
              "consequent": [
                {
                  "type": "text",
                  "text": "<div>"
                },
                {
                  "type": "expression",
                  "body": "_d_['dadad']",
                  "constant": false,
                  "setbody": "_d_['dadad']=_p_"
                },
                {
                  "type": "text",
                  "text": "</div>"
                }
              ],
              "alternate": []
            }
          ]
        }
      ])

    })
  })

  describe("list statement should parse correctly ", function(){
    it("complex list statement should parse correctly under mode 1", function(){
      var list1 = expect.template.set(function list1(){/*
      {{#list [1,2,3,4,5] as num}} 
        {{num}} : {{$index}}
      {{/list}}
      */})

      expect(p(list1)).to.eql([
        {
            "type": "list",
            "sequence": {
              "type": "expression",
              "body": "[1,2,3,4,5]",
              "constant": true,
              "setbody": false
            },
            "variable": "num",
            "body": [
              {
                "type": "text",
                "text": " \n        "
              },
              {
                "type": "expression",
                "body": "_d_['num']",
                "constant": false,
                "setbody": "_d_['num']=_p_"
              },
              {
                "type": "text",
                "text": " : "
              },
              {
                "type": "expression",
                "body": "_d_['$index']",
                "constant": false,
                "setbody": "_d_['$index']=_p_"
              },
              {
                "type": "text",
                "text": "\n      "
              }
            ]
          }
      ]);
    })
    it("complex list statement should parse correctly under mode 2", function(){
      expect(p2(list2)).to.eql(
        [
          {
            "type": "list",
            "sequence": {
              "type": "expression",
              "body": "[_d_['a'],2,3,4,5]",
              "constant": false,
              "setbody": false
            },
            "variable": "num",
            "body": [
              {
                "type": "text",
                "text": " \n  <p>"
              },
              {
                "type": "expression",
                "body": "_d_['num']",
                "constant": false,
                "setbody": "_d_['num']=_p_"
              },
              {
                "type": "text",
                "text": "</p>\n"
              }
            ]
          }
        ] 
      )

    })


  })




  describe("template statement should parsed as expect", function(){
    it("simple template statement", function(){
      expect(p("{{~ hello.a}}")).eql(
        [
          {
            "type": "template",
            "content": {
              "type": "expression",
              "body": "_d_['hello']['a']",
              "constant": false,
              "setbody": "_d_['hello']['a']=_p_"
            }
          }
        ]
      );
    })
  })


  describe("should throw error when encountered syntax error", function(){
    it("list unmatched tag should throw error", function(){
      expect(function(){
        p("{{#list hello as name}}{{/if}}")
      }).to.throwError();
    })
    it("if unmatched tag should throw error", function(){
      expect(function(){
        p("{{#if hello}}{{/list}}")
      }).to.throwError();
    })
  })

});








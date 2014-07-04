
var Parser = require_lib("parser/Parser.js");
var node = require_lib("parser/node.js");
var _ = require_lib("util.js");


var expr = function(input){
  return expect(parse(input));
}

var body = function(input){
  return expect(parse(input).body);
}

var parse = function(input){
  return new Parser(input, {mode: 2, state: 'JST'}).expression()
}

var run_expr = function(expr, context, value){
  expr = parse(expr)
  var touched = _.touchExpression(expr);
  if(value) return expect(touched.set(context, value));
  else return expect(touched.get(context));
}



describe("Expression", function(){
  describe('simple', function(){
    it('Primary should parsed as expect', function(){
      var test = "1 1.1 'abc' true false undefined null [1,2,3,4]";
      test.split(" ").forEach(function(item){
        body(item).to.equal(item);
      })

      body("1e3").to.equal("1000");
      body("-1e3").to.equal("(-1000)");
      body("{a:1,b:2,c:3, 'd': 1+1}").to.equal("{'a':1,'b':2,'c':3,'d':1+1}")
    })

  })

  describe('Filter ', function(){
    it("filter should parsed to string body", function(){
      body("name|lowercase").to.equal("(function(){var _f_=_d_['name'];_f_ = _c_._f('lowercase')(_f_);return _f_})()");
    })
    it("filter is chainable", function(){
      body("name|lowercase|uppercase").to.equal(
        "(function(){var _f_=_d_['name'];_f_ = _c_._f('lowercase')(_f_);_f_ = _c_._f('uppercase')(_f_);return _f_})()"
      )
    })

    it("filter can pass param", function(){

      body("name|lowercase: hello, 1, 2").to.equal(
        "(function(){var _f_=_d_['name'];_f_ = _c_._f('lowercase')(_f_, _d_['hello'],1,2);return _f_})()"
      )

      body("name|lowercase: hello, 1, 2|uppercase: name|trim").to.equal(
        "(function(){var _f_=_d_['name'];_f_ = _c_._f('lowercase')(_f_, _d_['hello'],1,2);_f_ = _c_._f('uppercase')(_f_, _d_['name']);_f_ = _c_._f('trim')(_f_);return _f_})()"
      )

    })
    
  })


  describe("constant Expression should parsed with constant==true", function(){
    it("constant expression should marked as constant", function(){
      expect(parse("1+1").constant).equal(true);
      expect(parse("1||1").constant).equal(true);
      expect(parse("[1,2,3,4][0]").constant).equal(true);
    })
  })

})


describe("compiled expression", function(){

  var context = {
    data: {
      a: 2,
      b: 3,
      c: {
        c1: 1,
        c2: 2
      },
      ab: function(a, b){
        return a + b;
      }
    },
    show: function(){
      var data = this.data;
      data.a++;
      return data.a;
    }
  }

  describe('Primative Type', function(){
    it("object type returns correctly", function(){
      run_expr("{a: 1, b: b+1}", context).to.eql({a:1, b: 4});
      run_expr("{a: 1, b: b+1,}", context).to.eql({a:1, b: 4});
    });

    it("array type returns correctly", function(){
      run_expr("[1,5+a, a+b]", context).to.eql([1,7,5]);

    });
    it("range type returns correctly", function(){
      run_expr("a..b", context).to.eql([2,3]);
    });


    it("primative type returns correctly", function(){
      run_expr("1", context).to.eql(1);
      run_expr("null", context).to.eql(null);
      run_expr("undefined", context).to.eql(undefined);
      run_expr("Math", context).to.eql(Math);
      run_expr("1.1", context).to.eql(1.1);
      run_expr("-1.1", context).to.eql(-1.1);
      run_expr("-1.1e3", context).to.eql(-1.1e3);
      run_expr("true", context).to.eql(true);
      run_expr("false", context).to.eql(false);
    })

  })

  describe('Operation', function(){
    it("add/sub returns correctly", function(){
      run_expr("1+3", context).to.eql(4);
      run_expr("b-a", context).to.eql(1);
    });

    it("mult/div returns correctly", function(){
      run_expr(" 3 * a ", context).to.eql(6);
      run_expr("b/a", context).to.eql(1.5);
    });
    it("logic operation returns correctly", function(){
      run_expr(" 3 || a ", context).to.eql(3);
      run_expr("b && a", context).to.eql(2);
      run_expr("!b", context).to.eql(false);
    });
    it("Relation operation returns correctly", function(){
      run_expr(" 3 === a ", context).to.eql(false);
      run_expr(" 3 == a ", context).to.eql(false);
      run_expr("b !== a", context).to.eql(true);
      run_expr("b != a", context).to.eql(true);
      run_expr("b >= a", context).to.eql(true);
      run_expr("b > a", context).to.eql(true);
      run_expr("b < a", context).to.eql(false);
      run_expr("b <= a", context).to.eql(false);

    });

    it("condition returns correctly", function(){
      run_expr("a? 2: 3", context).to.eql(2);
    })

    it("paren returns correctly", function(){
      run_expr("(2+3)*b", context).to.eql(15);
    })

    it("function call returns correctly", function(){
      run_expr("ab(a,2)", context).to.eql(4)
      run_expr("this.show()", context)
      expect(context.data.a).to.eql(3);
    })

    it("assignment should works correctly", function(){
      run_expr("a=1", context).to.eql(1)
      expect(context.data.a).to.eql(1);
    })

    it("member should works correctly", function(){
      expect(context.data.c.c1).to.eql(1);
      run_expr("c.c1=10", context).to.eql(10)
      expect(context.data.c.c1).to.eql(10);
    })

    it("setable expression should works correctly", function(){
      expect(context.data.c.c2).to.eql(2);
      run_expr("c.c2", context, 10);
      expect(context.data.c.c2).to.eql(10);
    })


  })

})









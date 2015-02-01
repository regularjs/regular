var Regular = require_lib("index.js");

void function(){

var Component = Regular.extend();

function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}

describe("Computed Property", function(){
  var container = document.createElement("div");
  it("only pass string will use Regular.expression to generate get(may have set)", function(){
    var Component = Regular.extend({
      computed: {
        len: "items.length",
        hello: function(){}
      },
      template: "xx"
    });


    var component = new Component({data: {items: [1,2]}});

    expect(component.$get("len")).to.equal(2);
    component.$update("len", 1);
    expect(component.$get("items").length).to.equal(1);
  })

  it("only pass a function should register a get function", function(){
    var Component = Regular.extend({
      computed: {
        len: function(data){
          return data.items.length
        }
      }
    })
    var component = new Component({data: {items: [1,2]}});
    expect(component.$get("len")).to.equal(2);
    component.$update("len", 1); 
    expect(component.$get("len")).to.equal(2);// not affect len computed
    expect(component.data.len).to.equal(1) //but affcet the data;
  })

  it("define get/set computed property should works as expect", function(){
    var Component = Regular.extend({
      template: "<div>{fullname}</div>",
      computed: {
        fullname: {
          get: function(data){
            return data.first + "-" + data.last;
          },
          set: function(value, data){
            var tmp = value.split("-");
            data.first = tmp[0];
            data.last = tmp[1];
          }
        }
      }
    })

    var component = new Component({
      data: {first: '1', last: '2'}
    }).$inject(container);



    expect( nes.one("div", container).innerHTML ).to.equal("1-2");

    component.$update("fullname", "3-4");
    expect( component.$get("first")).to.equal("3");
    expect( component.$get("last")).to.equal("4");

    destroy(component, container);
  })

  it("context should point to component", function(){

  })

  it("computed property in intialize will merge/override the setting on Component.extend", function(){
    var Component = Regular.extend({
      template: "<div>{fullname}</div><div>{hello}</div>",
      computed: {
        fullname: {
          get: function(data){
            return data.first + "-" + data.last;
          },
          set: function(value, data){
            var tmp = value.split("-");
            data.first = tmp[0];
            data.last = tmp[1];
          }
        }
      }
    })

    var component = new Component({
      data: {
        first: '1', last: '2'
      },
      computed: {
        fullname: {
          get: function(data){
            return data.first + "=" + data.last;
          },
          set: function(value, data){
            var tmp = value.split("=");
            data.first = tmp[0];
            data.last = tmp[1];
          }
        },
        hello: function(data){
          return "hello" + data.first + data.last
        }
      }
    }).$inject(container);


    var divs = nes.all("div", container);
    expect(divs[0].innerHTML ).to.equal("1=2");
    expect(divs[1].innerHTML ).to.equal("hello12");

    component.$update("fullname", "3=4");
    expect(divs[0].innerHTML ).to.equal("3=4");
    expect(divs[1].innerHTML ).to.equal("hello34");
    destroy(component, container);
  })
})
describe("Expression", function(){
  function run_expr(expr, context){
    return expect(context.$expression(expr).get(context));
  }
  describe("compiled expression", function(){
    var context = new Regular({
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
    })

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
        context.$update("c.c2", 10);
        expect(context.data.c.c2).to.eql(10);
      })
      it("+=, -= /= *= %= should work as expect", function(){
        var component = new Regular({data: {a: 1}});
        component.$get("a+=1");
        expect(component.data.a).to.equal(2);
        component.$get("a-=1")
        expect(component.data.a).to.equal(1);
        component.$get("a*=100")
        expect(component.data.a).to.equal(100);
        component.$get("a/=2")
        expect(component.data.a).to.equal(50);
        component.$get("a%=3")
        expect(component.data.a).to.equal(2);
      })
    })
  })
})

describe("Watcher-System", function(){



  it("the digest progress is works correctly on basic usage", function(){
    var component = new Regular();

    //lazy bind watcher will not trigger in intialize state 
    component.$watch("name", function(name){
      this.hello = name;
    });

    expect(component.hello).to.equal(undefined);

    component.$update("name", "leeluolee");
    expect(component.hello).to.equal("leeluolee");

    component.destroy();
  })



  it("$watch should accpect [Expression] param", function(){
    var component = new Regular();
    var nameExpr = Regular.parse("name");

    //lazy bind watcher will not trigger in intialize state 
    component.$watch("name", function(name){
      this.hello = name;
    });

    component.$update("name", "leeluolee");
    expect(component.hello).to.equal("leeluolee");
    component.destroy();
  })

  it("$watch should accpect [Array] param", function(){
    var component = new Regular();
    component.$watch(["name", "age"], function(name, age){
      expect(name + ":" + age).to.equal("leeluolee:10")
    });

    component.$update({
      name: "leeluolee",
      age: 10
    });

    component.destroy();
  })

  it("$update should also accpect [Function] param to act apply", function(){
    var component = new Regular();
    component.$watch(["name", "age"], function(name, age){
      expect(name + ":" + age).to.equal("leeluolee:100")
    });

    component.$update(function(data){
      data.name = "leeluolee";
      data.age = 100;
    });
    component.destroy();
  })


  it("$bind should connect two component", function(){
    var container = document.createElement("div");
    var component = new Component({
      template: "<div class='name'>{name}</div><div class='age'>{age}</div>",
      data: {
        name: "leeluolee",
        age: 10
      }
    }).$inject(container);
    var component2 = new Component({
      template: "<div class='user-name'>{user.name}</div><div class='user-age'>{user.age}</div>",
      data: {user: {}}
    }).$inject(container);

    expect( $('div', container).length ).to.equal(4);
    expect( $('div', container).length ).to.equal(4);

    ["name", "user-name", "age", "user-age"].forEach(function(item){
      expect($("."+item, container).length).to.equal(1)
    })


    component.$bind(component2, "name", "user.name")
    component.$bind(component2, "age", "user.age")

    
    expect(component2.data.user).to.eql({name: "leeluolee", age: 10 });

    component2.$update(function(data){
      data.user = {name: "regularjs", age: 100 };
    })
    expect(component.data.name).to.equal("regularjs");
    expect(component.data.age).to.equal(100);

    component2.destroy();
    component.destroy();
    expect(container.innerHTML).to.equal("");
    

  })

  it("bind once should works on interpolation", function(){
    var container = document.createElement("div");
    var component = new Component({
      template: "<div class='name'>{ @(name) }</div><div class='age'>{age}</div>",
      data: {
        name: "leeluolee",
        age: 10
      }
    }).$inject(container);

    component.$update("name", "luobo")
    component.$update("age", "100")
    expect(nes.one(".name", container).innerHTML).to.equal("leeluolee");
    expect(nes.one(".age", container).innerHTML).to.equal("100");

    destroy(component, container);
  })
  it("bind once should works on list", function(){
    var container = document.createElement("div");
    var component = new Component({
      template: "{#list @(todos) as todo}<p>{todo}</p>{/list}",
      data: {
        todos: ["name", "name2"]
      }
    }).$inject(container);

    expect(nes.all("p", container).length).to.equal(2);
    expect(nes.all("p", container)[0].innerHTML).to.equal("name");

    component.$update(function(data){
      data.todos.push("name3");
    })

    expect(nes.all("p", container).length).to.equal(2);

    destroy(component, container);
  })
  it("bind once should works on if", function(){
    var container = document.createElement("div");
    var component = new Component({
      template: "{#if @(test) }<p>haha</p>{#else}<a></a>{/if}",
      data: {test: true}
    }).$inject(container);

    expect(nes.all("p", container).length).to.equal(1);

    component.$update("test", false);

    expect(nes.all("p", container).length).to.equal(1);


    destroy(component, container);
  })




})


}();

void function(){
  var Regular = require_lib('index.js');
  var parse = require_lib("helper/parse");
  describe("component.watcher", function(){
    var watcher = new Regular({
      data: {
        str: 'hehe',
        obj: {},
        array: []
      }
    });

    it('it should watch once when have @(str) ', function(){
      var trigger = 0;
      var trigger2 =0;
      watcher.$watch('@(str)', function(){
        trigger++;
      })
      watcher.$watch('str', function(){
        trigger2++;
      })
      watcher.data.str = 'haha'
      watcher.$digest();
      watcher.data.str = 'heihei'
      watcher.$digest();
      expect(trigger).to.equal(1);
      expect(trigger2).to.equal(2);

    } )

    it("beacuse of cache passed same expr should return the same expression", function(){
      var expr = parse.expression("a+b");
      var expr2 = parse.expression("a+b");
      expect(expr === expr2).to.equal(true);
    })

    it("watch accept multi binding ", function(done){
      watcher.$watch(["str", "array.length"], function(str, len){
        expect(str).to.equal("haha")
        expect(len).to.equal(2)
        done();
      })

      watcher.data.str = "haha";
      watcher.data.array = [1,2];
      watcher.$digest();
    })

    it("watch object deep should checked the key", function(){
      var watcher = new Regular({
        data: {
          str: 'hehe',
          obj: {},
          array: []
        }
      })

      var trigger = 0;
      var trigger2 = 0;
      watcher.$watch("obj", function(){
        trigger++;
      })
      watcher.$watch("obj", function(){
        trigger2++;
      }, true)

      watcher.$digest();
      watcher.data.obj.name = 1;
      watcher.$digest();
      watcher.data.obj.name = 2;
      watcher.$digest();
      expect(trigger).to.equal(1);
      expect(trigger2).to.equal(3);
    })

  })

}()






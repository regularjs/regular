var Regular = require_lib("index.js");

void function(){

var Component = Regular.extend();

function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}


describe("Nested Component", function(){
  var NameSpace = Regular.extend();

  it("the attribute with plain String will pass to sub_component", function(){

    //lazy bind watcher will not trigger in intialize state 
    var container = document.createElement("div");
    var Component = NameSpace.extend({
      name: "test1",
      template: "<p>{{hello}}</p>"
    })
    var component = new NameSpace({
      template: "<test1 hello='leeluolee' />"
    }).$inject(container)

    expect( nes.one("p", container).innerHTML ).to.equal("leeluolee");
    component.destroy();
  })

  it("it should create two-way binding from parent to nested when pass Expression", function(){
    var container = document.createElement("div");
    var Component = NameSpace.extend({
      name: "test2",
      template: "<p on-click={{hello='haha'}}>{{hello}}</p>"
    })
    var component = new NameSpace({
      template: "<test2 hello={{name}} /><span class='name'>{{name}}</span>",
      data: {name: "leeluolee"}
    }).$inject(container)

    expect( nes.one("p", container).innerHTML ).to.equal("leeluolee");

    component.$update("name", "luobo")


    expect( nes.one("p", container).innerHTML ).to.equal("luobo");
    dispatchMockEvent(nes.one("p", container), "click")
    expect( nes.one("p", container).innerHTML ).to.equal("haha");
    expect( nes.one(".name", container).innerHTML ).to.equal("haha");
    destroy(component, container);
  })
  it("it should create one-way binding from parent to nested when Expression is not setable", function(){
    var container = document.createElement("div");
    var Component = NameSpace.extend({
      name: "test2",
      template: "<p on-click={{hello='haha'}}>{{hello}}</p>"
    })
    var component = new NameSpace({
      template: "<test2 hello={{name+'1'}} /><span class='name'>{{name}}</span>",
      data: {name: "leeluolee"}
    }).$inject(container)

    expect( nes.one("p", container).innerHTML ).to.equal("leeluolee1");
    expect( nes.one(".name", container).innerHTML ).to.equal("leeluolee");


    dispatchMockEvent(nes.one("p", container), "click")
    expect( nes.one("p", container).innerHTML ).to.equal("haha");
    expect( nes.one(".name", container).innerHTML ).to.equal("leeluolee");
    destroy(component, container);
  })

  it("context of transclude-html should point to outer component", function(){
    var container = document.createElement("div");
    var Component = NameSpace.extend({
      name: "test",
      template: "<p><a>haha</a><r-content></p>"
    })

    var i = 0;
    var component = new NameSpace({
      template: "<test on-hello={{this.hello}}><span on-click={{this.hello()}}>{{name}}</span></test>",
      data: {name: "leeluolee"},
      hello: function(){
        i++
      }
    }).$inject(container);

    dispatchMockEvent(nes.one("span", container), "click");

    expect(i).to.equal(1);

    expect(nes.one("p span", container).innerHTML).to.equal("leeluolee");

    destroy(component, container);

  })

  it("nested component should get the outer component's data before create the binding", function(){

    var container = document.createElement("div");
    var Component = NameSpace.extend({
      name: "test",
      template: "<p>{{user.name.first}}</p>"
    })

    var component = new NameSpace({
      template: "<test user={{user}}></test>",
      data: {user: {name: {first: "Zheng"}}}
    }).$inject(container);

    expect(nes.one("p", container).innerHTML).to.equal("Zheng");

    destroy(component, container);

  })

  describe("nested Component with Event", function(){

    it("on-* should evaluate the Expression when the listener is called", function(){
      var container = document.createElement("div");
      var Component = NameSpace.extend({
        name: "test",
        template: "<p on-click={{this.$emit('hello')}}></p>"
      })

      var i =0;
      var component = new NameSpace({
        template: "<test on-hello={{this.hello()}} />",
        hello: function(){
          i++
        }
      }).$inject(container);

      dispatchMockEvent(nes.one("p", container), "click");

      expect(i).to.equal(1);

      destroy(component, container);

    })
    it("on-*='String' should proxy the listener to outer component", function(){
      var container = document.createElement("div");
      var Component = NameSpace.extend({
        name: "test",
        template: "<p on-click={{this.$emit('hello', $event)}}></p>"
      })

      var i =0;
      var type=null;
      var component = new NameSpace({
        template: "<test on-hello='hello' />",
        init: function(){
          this.$on('hello', function(ev){
            type = ev.type;
            i++;
          })
        }
      }).$inject(container);

      dispatchMockEvent(nes.one("p", container), "click");

      expect(i).to.equal(1);
      expect(type).to.equal("click");

      destroy(component, container);

    }) 

    it("sub_component should get initail data from component during initailize", function(){
      var container = document.createElement("div");
      var Component = NameSpace.extend({
        name: "test",
        template: "<p on-click={{this.$emit('hello', $event)}}></p>"
      })

      var i =0;
      var type=null;
      var component = new NameSpace({
        template: "<test on-hello='hello' />",
        init: function(){
          this.$on('hello', function(ev){
            type = ev.type;
            i++;
          })
        }
      }).$inject(container);

      dispatchMockEvent(nes.one("p", container), "click");

      expect(i).to.equal(1);
      expect(type).to.equal("click");

      destroy(component, container);

    })

  })

})


}()

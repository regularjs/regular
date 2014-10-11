

void function(){
  var Regular = require_lib("index.js");
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
    });

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
    });
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

    describe("refs attribute", function(){
      var container = document.createElement("div");
      var Component = Regular.extend({
        template: "<div>haha</div>"
      });
      it("ref on element should work as expect", function(){
        var component = new NameSpace({
          template: "<div ref=haha>hello</div>",
          data: {
            hello: 1
          }
        }).$inject(container)

        expect(component.$refs["haha"] === nes.one('div', container)).to.equal(true);
        destroy(component, container);
      })
      it("ref on element with expression should work as expect", function(){
        var component = new NameSpace({
          template: "<p ref={{haha}}></p>",
          data: {
            haha: "haha"
          }
        }).$inject(container)

        expect(component.$refs["haha"] === nes.one('p', container)).to.equal(true);
        destroy(component, container);

      })

      it("ref on component should work as expect", function(){
        var Component1 = NameSpace.extend({
          name: "haha",
          template: "<input type='text' />"
        }) 
        var component = new NameSpace({
          template: "<haha ref=haha></haha>",
          data: {
            haha: "haha"
          }
        }).$inject(container)

        expect(component.$refs["haha"] instanceof Component1).to.equal(true);
        destroy(component, container);
      })

      it("ref on component with should work as expect", function(){
        var Component1 = NameSpace.extend({
          name: "haha",
          template: "<input type='text' />"
        }) 
        var component = new NameSpace({
          template: "<haha ref={{haha}}></haha>",
          data: {
            haha: "haha"
          }
        }).$inject(container)


        expect(component.$refs["haha"] instanceof Component1).to.equal(true);

        destroy(component, container);
      })

      it("ref should works with list", function(){
        var component = new NameSpace({
          template: "{{#list items as item}}<div ref={{haha + item_index}} id={{item_index}}>haha</div>{{/list}}",
          data: {
            haha: "haha",
            items: [1,2,3]
          }
        }).$inject(container)


        expect(component.$refs["haha0"].id).to.equal("0");
        expect(component.$refs["haha1"].id).to.equal("1");
        expect(component.$refs["haha2"].id).to.equal("2");

        component.$update(function(data){
          data.items.pop();
        })

        expect(component.$refs["haha2"]).to.equal(null);

        destroy(component, container);
      })
      it("ref should destroied as expect", function(){
        var component = new NameSpace({
          template: "{{#list items as item}}<div ref={{haha + item_index}} id={{item_index}}>haha</div>{{/list}}",
          data: {
            haha: "haha",
            items: [1,2,3]
          }
        }).$inject(container)

        component.$update(function(data){
          data.items.pop();
        })

        destroy(component, container);
        expect(component.$refs).to.equal(null);
      })
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


  })
})


}()

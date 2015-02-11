

void function(){
  var Regular = require_lib("index.js");
  var Component = Regular.extend();

  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }


  describe("Nested Component", function(){
    var NameSpace = Regular.extend();
    var containerAll = document.createElement("div");

    it("the attribute with plain String will pass to sub_component", function(){

      //lazy bind watcher will not trigger in intialize state 
      var container = document.createElement("div");
      var Component = NameSpace.extend({
        name: "test1",
        template: "<p>{hello}</p>"
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
        template: "<p on-click={hello='haha'}>{hello}</p>"
      })
      var component = new NameSpace({
        template: "<test2 hello={name} /><span class='name'>{name}</span>",
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
        template: "<p on-click={hello='haha'}>{hello}</p>"
      })
      var component = new NameSpace({
        template: "<test2 hello={name+'1'} /><span class='name'>{name}</span>",
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
        template: "<test on-hello={this.hello}><span on-click={this.hello()}>{name}</span></test>",
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
        template: "<p>{user.name.first}</p>"
      })

      var component = new NameSpace({
        template: "<test user={user}></test>",
        data: {user: {name: {first: "Zheng"} } }
      }).$inject(container);

      expect(nes.one("p", container).innerHTML).to.equal("Zheng");

      destroy(component, container);

    })


    describe("nested Component with Event", function(){

      it("on-* should evaluate the Expression when the listener is called", function(){
        var container = document.createElement("div");
        var Component = NameSpace.extend({
          name: "test",
          template: "<p on-click={this.$emit('hello')}></p>"
        })

        var i =0;
        var component = new NameSpace({
          template: "<test on-hello={this.hello()} />",
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
          template: "<p on-click={this.$emit('hello', $event)}></p>"
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
    // stop parent <-> component
    it("isolate = 3 should make the component isolate to/from parent", function(){
      var container = document.createElement("div");
      var Test = NameSpace.extend({
        name: 'test',
        template: "<p>{title}</p>"
      })


      var component = new NameSpace({
        template: "<span>{title}</span><test ref=a title={title} isolate></test><test ref=b title={title} isolate=3></test>",
        data: {title: 'leeluolee'}
      }).$inject(containerAll);

      var p1= containerAll.getElementsByTagName("p")[0]
      var p2= containerAll.getElementsByTagName("p")[1]
      var span= containerAll.getElementsByTagName("span")[0]
      expect(p1.innerHTML).to.equal("leeluolee");
      expect(p2.innerHTML).to.equal("leeluolee");
      expect(span.innerHTML).to.equal("leeluolee");

      component.$update("title", 'leeluolee2')
      expect(p1.innerHTML).to.equal("leeluolee");
      expect(p2.innerHTML).to.equal("leeluolee");
      expect(span.innerHTML).to.equal("leeluolee2");

      component.$refs.a.$update("title", "leeluolee3");
      expect(p1.innerHTML).to.equal("leeluolee3");
      expect(p2.innerHTML).to.equal("leeluolee");
      expect(span.innerHTML).to.equal("leeluolee2");

      component.$refs.b.$update("title", "leeluolee4");
      expect(p1.innerHTML).to.equal("leeluolee3");
      expect(p2.innerHTML).to.equal("leeluolee4");
      expect(span.innerHTML).to.equal("leeluolee2");

      destroy(component, containerAll);
      
    })
    // stop parent ->  component
    it("isolate = 2 should make the component isolate from parent", function(){
      var Test = NameSpace.extend({
        name: 'test',
        template: "<p>{title}</p>"
      })
      var component = new NameSpace({
        template: "<span>{title}</span><test ref=a title={title} isolate=2></test>",
        data: {title: 'leeluolee'}
      }).$inject(containerAll);
      var p1= containerAll.getElementsByTagName("p")[0]
      var span= containerAll.getElementsByTagName("span")[0]
      expect(p1.innerHTML).to.equal("leeluolee");
      expect(span.innerHTML).to.equal("leeluolee");

      component.$update("title", 'leeluolee2')

      expect(p1.innerHTML).to.equal("leeluolee");
      expect(span.innerHTML).to.equal("leeluolee2");

      component.$refs.a.$update("title", "leeluolee3");
      expect(p1.innerHTML).to.equal("leeluolee3");
      expect(span.innerHTML).to.equal("leeluolee3");
      
      destroy(component, containerAll);
    })
    // stop component -> parent
    it("isolate = 1 should make the component isolate to parent", function(){
      var Test = NameSpace.extend({
        name: 'test',
        template: "<p>{title}</p>"
      })
      var component = new NameSpace({
        template: "<span>{title}</span><test ref=a title={title} isolate=1></test>",
        data: {title: 'leeluolee'}
      }).$inject(containerAll);
      var p1= containerAll.getElementsByTagName("p")[0]
      var span= containerAll.getElementsByTagName("span")[0]

      expect(p1.innerHTML).to.equal("leeluolee");
      expect(span.innerHTML).to.equal("leeluolee");

      component.$update("title", 'leeluolee2')
      
      expect(p1.innerHTML).to.equal("leeluolee2");
      expect(span.innerHTML).to.equal("leeluolee2");

      component.$refs.a.$update("title", "leeluolee3");
      expect(p1.innerHTML).to.equal("leeluolee3");
      expect(span.innerHTML).to.equal("leeluolee2");
      destroy(component, containerAll);
    })
    it("isolate & 1 should make the component isolate to parent", function(){
    })
})


}()

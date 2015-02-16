

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
    var Test = NameSpace.extend({
      template: "<div><r-content /></div>"
    })

    NameSpace.component('test', Test);

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
        name: "nested1",
        template: "<p><a>haha</a><r-content></p>"
      })

      var i = 0;
      var component = new NameSpace({
        template: "<nested1 on-hello={this.hello}><span on-click={this.hello()}>{name}</span></nested1>",
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

    it("transclude-html with $body ", function(){
                  

      var test = new Test({
        $body: "<p ref=p>{title}</p>",
        data: {title: 'leeluolee'}
      })
      expect(test.$refs.p.innerHTML).to.equal('leeluolee');
      test.destroy();
    })


    it("$outer should point to visual outer component", function(){
      var TestChild = NameSpace.extend({
        template: "<p>{title}</p>"
      })
      NameSpace.component("test-child", TestChild);

      var  component = new NameSpace({
        template: 
          "<test ref=test>\
            <test-child title={title} ref=child></test-child>\
            <test-child title={title} ref=child2></test-child>\
          </test>",
        data: {title: 'regularjs'}
      })


      expect(component.$refs.child.$outer).to.equal(component.$refs.test);

      component.destroy();

    })

    it("nested intialize step should follow particular sequence", function(){
      var step = [];
      var Child = NameSpace.extend({
        template: "<p><r-content></p>",
        config: function(data){
          step.push( "config " + data.step);
        },
        init: function(){
          var data = this.data;
          step.push("init "+data.step);
        }
      })
      NameSpace.component("child1", Child);
      NameSpace.component("child2", Child);
      NameSpace.component("child3", Child);
      NameSpace.component("child4", Child);

      var  component = new NameSpace({
        template: 
          "<div ref=container ><child1 step=child1>\
            <child2 step=child21></child2>\
            <child2 step=child22>\
              <child3 step='child31'>\
                <child4 step='child41'>{title}</child4>\
                <child4 step='child42'>{title}</child4>\
              </child3>\
              <child3 step='child32'></child3>\
            </child2>\
          </child1></div>",
        data: {title: 'regularjs'}
      })

      expect(step).to.eql( 
        ["config child1", 
          "config child21", "init child21", 
          "config child22", 
            "config child31", 
              "config child41", "init child41", 
              "config child42", "init child42", 
            "init child31", 
            "config child32", "init child32", 
          "init child22", 
        "init child1"]
        )

      component.destroy();


    })


    it("nested component should get the outer component's data before create the binding", function(){

      var container = document.createElement("div");
      var Component = NameSpace.extend({
        name: "nest2",
        template: "<p>{user.name.first}</p>"
      })

      var component = new NameSpace({
        template: "<nest2 user={user}></nest2>",
        data: {user: {name: {first: "Zheng"} } }
      }).$inject(container);

      expect(nes.one("p", container).innerHTML).to.equal("Zheng");

      destroy(component, container);

    })


    describe("nested Component with Event", function(){

      it("on-* should evaluate the Expression when the listener is called", function(){
        var container = document.createElement("div");
        var Component = NameSpace.extend({
          name: "nested3",
          template: "<p on-click={this.$emit('hello')}></p>"
        })

        var i =0;
        var component = new NameSpace({
          template: "<nested3 on-hello={this.hello()} />",
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
          name: "nested4",
          template: "<p on-click={this.$emit('hello', $event)}></p>"
        })

        var i =0;
        var type=null;
        var component = new NameSpace({
          template: "<nested4 on-hello='hello' />",
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
        name: 'nested5',
        template: "<p>{title}</p>"
      })


      var component = new NameSpace({
        template: "<span>{title}</span><nested5 ref=a title={title} isolate></nested5><nested5 ref=b title={title} isolate=3></nested5>",
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
        name: 'nested6',
        template: "<p>{title}</p>"
      })
      var component = new NameSpace({
        template: "<span>{title}</span><nested6 ref=a title={title} isolate=2></nested6>",
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
        name: 'nested7',
        template: "<p>{title}</p>"
      })
      var component = new NameSpace({
        template: "<span>{title}</span><nested7 ref=a title={title} isolate=1></nested7>",
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
})


}()

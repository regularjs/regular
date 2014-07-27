// contains basic dom && event specs
var dom = require_lib('dom.js');
var Regular = require_lib("index.js");

void function(){
  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }


  describe("Dom", function(){

    describe("[Regular.dom] api", function(){
      var div = dom.create("div");
      
      it("class relative api", function(){
        dom.addClass(div, "name");
        expect(dom.hasClass(div, "name")).to.equal(true);
        dom.delClass(div, "name");
        expect(dom.hasClass(div, "name")).to.equal(false);
        div.className = "";
      })

      it("addClass should work as expect", function(){
        dom.addClass(div, "name");
        expect(div.className).to.equal("name");
      })

      it("delClass should work as expect", function(){
        div.className = "name";
        dom.delClass(div, "name");
        expect(div.className).to.equal("");

      })
    })

    it("trigger simple click event", function(){
      var container = document.createElement('div');
      var component = new Regular({
        template: "<div on-click={{name=1}}>test</div>",
        data: {test: 0}
      }).$inject(container);

      var $node = $('div', container);

      expect(component.data.name).to.equal(undefined);
      expect($node.length).to.equal(1);

      dispatchMockEvent($node[0], 'click');
      expect(component.data.name).to.equal(1);

      destroy(component, container);
    })

    it("custom Event handler's context should be component", function(){

        var container = document.createElement('div');
        var Component = Regular.extend();
        var context;
        Component.event('hello', function(elem, fire){
          context = this;
        })
        var component = new Component({
          template: "<div on-hello={{name=name+1}} class='hello' >haha</div>",
          data: { test: 0 , name: 'hahah'}
        }).$inject(container);

        expect(context).to.equal(component);

    })

    it("event should go proxy way when pass Non-Expreesion as attribute_value", function(){
      var container = document.createElement('div');
      var i = 0;
      var Component = Regular.extend({
        init: function(){
          this.$on("hello2", function(){
            i = 1;
          })
        },
        hello2: function(){
          i = 2; 
        }

      });

      var component = new Component({
        template: "<div on-click=hello2 class='hello' >haha</div>",
        data: { test: 0 , name: 'hahah'}
      }).$inject(container);

      dispatchMockEvent(nes.one('div', container), "click");

      expect(i).to.equal(1);


      destroy(component, container);


    });  

    it("when go proxy way the fire's context should point to outer component", function(){
      var container = document.createElement('div');
      var i = 0, j=0;
      var Component = Regular.extend({
        template: "{{#list 1..1 as item}}{{#list 1..1 as todo}}<div on-click='hello2'></div>{{/list}}{{/list}}",
        init: function(){
          this.$on("hello2", function(){
            i = 1;
          })
        }
      });
      var component = new Component;
      component.$inject(container);
      dispatchMockEvent(nes.one('div', container), "click");
      expect(i).to.equal(1);

      destroy(component, container)
    })

    it("you can binding one event with same eventType on one node", function(){
      var container = document.createElement('div');
      var i = 0, j = 0;
      var Component = Regular.extend({
        init: function(){
          this.$on("hello2", function(){
            i = 1;
          })
        },
        hello2: function(){
          j = 1; 
        }

      });

      var component = new Component({
        template: "<div on-click=hello2 on-click={{this.hello2()}} >haha</div>",
        data: { test: 0 , name: 'hahah'}
      }).$inject(container);

      dispatchMockEvent(nes.one('div', container), "click");

      expect(i).to.equal(1);
      expect(j).to.equal(1);

      destroy(component, container);


    })

  })

}()



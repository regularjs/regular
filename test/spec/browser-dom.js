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

    describe("Event via `on-*`", function(){
      it("trigger simple click event", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "<div on-click={name=1}>test</div>",
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
            template: "<div on-hello={name=name+1} class='hello' >haha</div>",
            data: { test: 0 , name: 'hahah'}
          }).$inject(container);

          expect(context).to.equal(component);

      })
      it("nested binder(>2) should be destroy after destroy", function(){

          var container = document.createElement('div');
          var Component = Regular.extend();
          var destroy_directive=1, destroy_upload=1;
          Component.event('upload', function(elem, fire){
            return function(){
              destroy_upload++;
            }
          }).directive("r-test", function(){
            return function(){
              destroy_directive++;
            }
            
          })
          var list = [];
          var template = 
          '<div class="m-imgview {clazz}">\
              <div class="img  animated" >\
                <div class="btns">\
                  <label class="local btn  btn-primary btn-sm" r-test=1 on-upload={this.handleUpload($event,img_index)}>本地上传</label>\
                </div>\
              </div>\
          </div>';

          var component = new Component({
            template: template,
            data: { test: 0 , name: 'hahah', imgs:['null']}
          }).$inject(container);

          component.destroy();
          expect(destroy_upload).to.equal(2)
          expect(destroy_directive).to.equal(2)


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
          template: "{#list 1..1 as item}{#list 1..1 as todo}<div on-click='hello2'></div>{/list}{/list}",
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
          template: "<div on-click=hello2 on-click={this.hello2()} >haha</div>",
          data: { test: 0 , name: 'hahah'}
        }).$inject(container);

        dispatchMockEvent(nes.one('div', container), "click");

        expect(i).to.equal(1);
        expect(j).to.equal(1);

        destroy(component, container);


      })

      it("$event.origin should point to the element that bingding the event", function(done){
        var container = document.createElement('div');
        document.body.appendChild(container);
        var component = new Regular({
          template: "<div on-click=hello2 on-click={this.hello2($event)} ref=div > <a ref=a href='javascript:;'>haha</a></div>",
          data: { test: 0 , name: 'hahah'},
          hello2: function($event){
            $event.preventDefault();
            expect($event.origin).to.equal(this.$refs.div);
            document.body.removeChild(container);
            done();
            this.destroy();
          }
        }).$inject(container);
        dispatchMockEvent(component.$refs.a, "click");
      })

    })

    describe("delegate Event via `delegate-*`", function(){
      var Component = Regular.extend();
      var container = document.createElement("div")
      before(function(){
        document.body.appendChild(container)
      })

      after(function(){
        document.body.removeChild(container);
      })

      it("delegate Event should work via", function(){
        var i,j;
        var component = new Component({
          template: "<div delegate-click=proxy delegate-click={this.hello2()} >haha</div>",
          data: { test: 0 , name: 'hahah'},
          hello2: function(){
            i=1;
          }

        }).$inject(container);

        component.$on("proxy", function(){
          j=1;
        })

        dispatchMockEvent(nes.one('div', container), "click");


        expect(i).to.equal(1);
        expect(j).to.equal(1);

        destroy(component, container);

      })

      it("delegate Event should destroy via {#if}", function(){
        var i = 0, j=0;
        var component = new Component({
          template: "<div {#if test} delegate-click=proxy {#else} delegate-click=proxy2 {/if} >haha</div>",
          data: { test: true , name: 'hahah'}
        }).$inject(container);

        component.$on("proxy", function(){i++})
        component.$on("proxy2", function(){j++})

        expect(j).to.equal(0);

        dispatchMockEvent(nes.one('div', container), "click");

        expect(i).to.equal(1);
        expect(j).to.equal(0);

        component.$update("test", false);

        dispatchMockEvent(nes.one('div', container), "click");

        expect(i).to.equal(1);
        expect(j).to.equal(1);

        component.$update("test", true);

        dispatchMockEvent(nes.one('div', container), "click");

        expect(i).to.equal(2);
        expect(j).to.equal(1);

        destroy(component, container);

      })

      it("delegate Event will merge to new container if use $inject", function(){
        var container2 = document.createElement("div");
        document.body.appendChild(container2);

        var component = new Component({
          template: "<div delegate-click={i = i+1}  >haha</div>",
          data: { i: 1 }
        }).$inject( container );

        component.$inject( container2 );


        dispatchMockEvent(nes.one( 'div', container2 ), "click" );

        expect( component.data.i ).to.equal(2);

        destroy( component, container2 );

        document.body.removeChild( container2 );

      })

      it("delegate Event only bind on the rootComponent", function(){
        var Nested = Regular.extend({
          name: "nest",
          template: "<div delegate-click=hello></div>"
        })
        var component = new Component({
          template: "<nest></nest>",
          data: { i: 1 }
        }).$inject( container );


        expect( component._delegates["click"].length ).to.equal(1);

        destroy( component, container );

        expect( component._delegates["click"] ).to.equal( null );

      })
    })


  })

}()



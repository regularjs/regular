
var Regular = require_lib("index.js");
void function(){

  var dom = Regular.dom;

  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }

  var  Component = Regular.extend();
  var svgns = "http://www.w3.org/2000/svg";


  var container = document.createElement("div");   
  describe("bugbush for paopao.163.com", function(){
    it("void array literal should works", function(){
      expect(function(){
        var component = new Component({
          template: "{#if []}{hello.name.first}{/if}",
          data: {hello: {name: { first: "haha"} } }
        })
      }).to.not.throwException();

    })
    it("number in element nearto { should not throwException", function(){

      expect(function(){
        var component = new Component({
          template: "<div {#if true}x = 1{/if}>1</div>",
          data: {}
        })
      }).to.not.throwException();
    })

    it("customer event should also trigger the digest", function(){
      Component.event("drag", function(element, fire){
        Regular.dom.on(element, "click", function(){
          fire({hello:1})
        })
      })

      var component = new Component({
        template: "{#list 1..1 as i}<div ref=first on-drag={name=2}>{name}</div>{/list}"
      }).$inject(container);

      dispatchMockEvent(component.$refs.first, 'click');
      expect(component.$refs.first.innerHTML).to.equal("2");
      destroy(component,container);
      
    })

  })

  describe("Bugfix", function(){
    it("bugfix #4", function(){

      var Demo = Component.extend({name: "demo", template: "<input r-model = 'demo.name' title={demo.name}>"})
      var DemoApp = Component.extend({template: "{#list demos as demo}<demo demo={demo}/>{demos.length}{/list}"});
      var component = new DemoApp({ 
        data: { demos: [{name:1}] }
      }).$inject(container);
      expect(nes.one("input", container).value).to.equal("1");
      destroy(component, container)
    })
    it("bugfix #6, svg namespace ", function(){
      //https://github.com/regularjs/regular/issues/6

      if(Regular.env.svg){ // if support svg
        var Bugfix6 = Component.extend({
          template: 
            '<div></div>\
             <svg><circle on-click={width+=2} on-click={circle+=2} cx="{width}" cy="{height}" r="{circle}" fill="#fefefe" stroke="#333" stroke-width="4" ></circle></svg>'
        })
        var component = new Bugfix6({ 
          data: { 
            circle: 6,
            width: 2,
            height: 4
          }
        }).$inject(container);

        expect(nes.one("svg", container).namespaceURI).to.equal("http://www.w3.org/2000/svg");

        var circle = nes.one("svg circle", container);

        expect( circle.namespaceURI ).to.equal("http://www.w3.org/2000/svg" );

        expect(circle.getAttribute("cx")).to.equal('2');
        expect(circle.getAttribute("cy")).to.equal('4');

        dispatchMockEvent(circle, 'click'); // dispatch mock event

        expect(circle.getAttribute("r")).to.equal('8');
        expect(circle.getAttribute("cx")).to.equal('4');

        destroy(component, container)
      }
    })

  it("should destroy clear when have non parentNode", function(){
    var list = "{#list 1..3 as num}{num}{/list}"
    var component = new Regular({
      template: list
    }).$inject(container);
    expect(container.innerHTML.slice(-3)).to.equal("123")
    destroy(component, container);
  })
    it("bugfix #12, item in list destroy all $context's event", function(){
      var list =
        "{#list todos as todo}" + 
          "<div class='a-{todo_index}'>{todo.content}</div>" + 
        "{/list}";

      var num =0;
      var component = new Regular({
        data: {todos: [{content: "hello"}, {content: "hello2"}]},
        template: list,
        events: {
          "haha": function(){
            num++
          }
        }
      }).$inject(container);

      component.$emit("haha", 111);

      component.data.todos[0] = {content: "haha"}
      expect(num).to.equal(1);

      component.$update();

      component.$emit("haha", 111);
      expect(num).to.equal(2);

      component.$emit("haha", 111);
      expect(num).to.equal(3);



      destroy(component, container);
    })    

    it("bugfix #13, subComponentUpdate force outerComponent $update when initialize", function(){
      // we need force __checkOnece enter digest phase
      var Modal = Regular.extend({
        template: '{#include this.content}'
      });

      var Input = Regular.extend({
        template: "<input type='email' class='form-control'>",
        init: function(){
          this.$update(); // @bug!! will forece outer Component to update
        }
      })

      // 直接调用
      var Modal2 = Modal.extend({
        content:  '<input2 type="text" />'
      }).component("input2", Input)


      var component = new Modal2().$inject(container);

      expect(nes.all('input' ,container).length).to.equal(1)



      destroy(component, container);
    })
    it("bugfix #11, 换行导致模板无法解析", function(){
      
var template = (function(){/*
<input type="text"  class="form-control"
                                 id="username" name="username" value="">
*/}).toString().match(/\/\*([\s\S]*)\*\//)[1];

      var Component = Regular.extend({
        template: template
      });


      var component = new Component().$inject(container);

      expect(nes.all('input' ,container).length).to.equal(1)



      destroy(component, container);
    })
    it("bugfix #14, html entity isn't converted", function(){


      // 'lt':60, 
      // 'gt':62, 
      // 'nbsp':160, 
      // 'iexcl':161, 
      // 'cent':162, 

      var template =  "<p>&cent;</p><p>{text}</p>"
      var Component = Regular.extend({
        template: template
      });


      var component = new Component().$inject(container);

      var ps = nes.all('p' ,container);


      expect(dom.text(ps[0])).to.equal(String.fromCharCode(162));

      component.$update('text', "&lt;");

      expect(dom.text(ps[1])).to.equal("&lt;");

      destroy(component, container);
    })

    describe("svg namespace", function(){
      // need include
      // 1. list
      // 2. if
      // 3. include
      // 4. new Component
      // 5. new Component 's body compile
      // 6. new Sectionj.
      it("bugfix #10, if svg namespace ", function(){
        //https://github.com/regularjs/regular/issues/10


        if(Regular.env.svg){ // if support svg

          var Bugfix10 = Component.extend({
            template: 
              '<div></div>\
               <svg viewBox="0 0 100 100">\
               <line y1="100" y2="100" stroke="#fff"/>\
               {#if test==1}\
                 <line y1="10" y2="90" stroke="#0f0"/>\
               {#elseif test==2}\
                 <line y1="20" y2="90" stroke="#f00"/>\
               {#else}\
                 <line y1="30" y2="90" stroke="#f00"/>\
               {/if}\
              </svg>'
          })
          var component = new Bugfix10({
            data: {test: 1}
          }).$inject(container);

          expect(nes.one("svg", container).namespaceURI).to.equal(svgns);

          var lines = nes.all("svg line", container);

          expect(lines.length).to.equal(2);

          expect(lines[0].namespaceURI).to.equal(svgns)
          expect(lines[1].namespaceURI).to.equal(svgns)
          expect(lines[1].getAttribute("y1")).to.equal("10");

          component.data.test = 2;
          component.$update();

          var lines = nes.all("svg line", container);

          expect(lines.length).to.equal(2);

          expect(lines[1].getAttribute("y1")).to.equal("20");
          expect(lines[1].namespaceURI).to.equal(svgns)


          component.data.test = 3;
          component.$update();

          var lines = nes.all("svg line", container);

          expect(lines.length).to.equal(2);

          expect(lines[1].getAttribute("y1")).to.equal("30");
          expect(lines[1].namespaceURI).to.equal(svgns)

          destroy(component, container)
        }
      })
      it("bugfix #10, list svg namespace should correct", function(){
        //https://github.com/regularjs/regular/issues/10


        if(Regular.env.svg){ // if support svg

          var Bugfix10 = Component.extend({
            template: 
              '<div></div>\
               <svg viewBox="0 0 100 100">\
               <line y1="100" y2="100" stroke="#fff"/>\
               {#list list as item}\
                 <line y1="{item_index}" y2="90" stroke="#0f0"/>\
               {/list}\
              </svg>'
          })
          var component = new Bugfix10({
            data: {
              list: [1]
            }
          }).$inject(container);

          expect(nes.one("svg", container).namespaceURI).to.equal(svgns);

          var lines = nes.all("svg line", container);

          expect(lines.length).to.equal(2);

          expect(lines[0].namespaceURI).to.equal(svgns)
          expect(lines[1].namespaceURI).to.equal(svgns)

          component.data.list = [1,2]
          component.$update();

          var lines = nes.all("svg line", container);

          expect(lines.length).to.equal(3);

          expect(lines[1].getAttribute("y1")).to.equal("0");
          expect(lines[2].getAttribute("y1")).to.equal("1");
          expect(lines[1].namespaceURI).to.equal(svgns)

          destroy(component, container)
        }
      })
      it("bugfix #10, include: svg namespace should correct", function(){
        //https://github.com/regularjs/regular/issues/10


        if(Regular.env.svg){ // if support svg

          var Bugfix10 = Component.extend({
            template: 
              '<div></div>\
               <svg viewBox="0 0 100 100">\
               <line y1="100" y2="100" stroke="#fff"/>\
               {#include template}\
              </svg>'
          })
          var component = new Bugfix10({
            data: {
              template: '<line y1="10" y2="100" stroke="#fff"/>'
            }
          }).$inject(container);

          expect(nes.one("svg", container).namespaceURI).to.equal(svgns);

          var lines = nes.all("svg line", container);

          expect(lines.length).to.equal(2);

          expect(lines[0].namespaceURI).to.equal(svgns)
          expect(lines[1].namespaceURI).to.equal(svgns)

          component.data.template = '<line y1="20" y2="100" stroke="#fff"/>';
          component.$update();

          var lines = nes.all("svg line", container);

          expect(lines.length).to.equal(2);

          expect(lines[1].getAttribute("y1")).to.equal("20");
          expect(lines[1].namespaceURI).to.equal(svgns)

          destroy(component, container)
        }
      })

    })
  })


}();
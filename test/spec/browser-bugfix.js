
var Regular = require_lib("index.js");
void function(){

  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }

  var  Component = Regular.extend();
  var svgns = "http://www.w3.org/2000/svg";


  var container = document.createElement("div");   
  describe("Bugfix", function(){
    it("bugfix #4", function(){

      var Demo = Component.extend({name: "demo", template: "<input r-model = 'demo.name' title={{demo.name}}>"})
      var DemoApp = Component.extend({template: "{{#list demos as demo}}<demo demo={{demo}}/>{{/list}}"});
      var component = new DemoApp({ 
        data: {demos: [{name:1}] }
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
             <svg><circle on-click={{width+=2}} on-click={{circle+=2}} cx="{{width}}" cy="{{height}}" r="{{circle}}" fill="#fefefe" stroke="#333" stroke-width="4" ></circle></svg>'
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
               {{#if test==1}}\
                 <line y1="10" y2="90" stroke="#0f0"/>\
               {{#elseif test==2}}\
                 <line y1="20" y2="90" stroke="#f00"/>\
               {{#else}}\
                 <line y1="30" y2="90" stroke="#f00"/>\
               {{/if}}\
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
               {{#list list as item}}\
                 <line y1="{{item_index}}" y2="90" stroke="#0f0"/>\
               {{/list}}\
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
               {{#include template}}\
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
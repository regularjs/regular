
var Regular = require_lib("index.js");
void function(){

  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }

  var  Component = Regular.extend();

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
  })


}();
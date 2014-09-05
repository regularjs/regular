
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
  })


}();
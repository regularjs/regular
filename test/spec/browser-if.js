var Regular = require_lib("index.js");
void function(){

  var container = document.createElement('div');
  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }

  describe("If", function(){
    describe("basic usage", function(){
      it("use if standalone should work correctly", function(){

        var container = document.createElement('div');
        var component = new Regular({
          template: "{{#if test}}<div>test</div>{{/if}}",
          data: {test: true}
        }).inject(container);

        expect($("div",container).length).to.equal(1);

        component.$update("test", false);
        expect($("div",container).length).to.equal(0);

        destroy(component, container)
      })

      it("regular should convert value to boolean", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "{{#if test}}<div>test</div>{{/if}}",
          data: {test: 0}
        }).inject(container);

        expect($("div",container).length).to.equal(0);
        component.$update("test", 1);

        expect($("div",container).length).to.equal(1);

        destroy(component, container)
      })


      it("use if else should work correctly", function(){

        var container = document.createElement('div');
        var component = new Regular({
          template: "{{#if test}}<div>test</div>{{#else}}<div>altname</div>{{/if}}"
        }).inject(container);

        expect($("div",container).length).to.equal(1);
        expect($("div",container).html()).to.equal("altname");
        component.$update("test", 1);
        expect($("div",container).length).to.equal(1);
        expect($("div",container).html()).to.equal("test");

        destroy(component, container)

      })

      it("use if elseif should work", function(){

        var container = document.createElement('div');
        var component = new Regular({
          template: "{{#if test > 5}}<div>test</div>{{#elseif test<2}}<div>altname</div>{{/if}}",
          data: {test: 1}
        }).inject(container);

        expect($("div",container).length).to.equal(1);
        expect($("div",container).html()).to.equal("altname");
        component.$update("test", 6);
        expect($("div",container).length).to.equal(1);
        expect($("div",container).html()).to.equal("test");
        component.$update("test", 4);
        expect($("div",container).length).to.equal(0);

        destroy(component, container)
      })

      it("use if elseif else should work correctly", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "{{#if test > 5}}<div>test</div>{{#elseif test<2}}<div>altname</div>{{#else}}<div>altname2</div>{{/if}}",
          data: {test: 1}
        }).inject(container);

        expect($("div",container).length).to.equal(1);
        expect($("div",container).html()).to.equal("altname");
        component.$update("test", 6);
        expect($("div",container).length).to.equal(1);
        expect($("div",container).html()).to.equal("test");
        component.$update("test", 4);
        expect($("div",container).length).to.equal(1);
        expect($("div",container).html()).to.equal("altname2");

        destroy(component, container)

      })

      it("use if elseif should equal with if else if", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "{{#if test > 5}}<div>test</div>{{#else}}{{#if test<2}}<div>altname</div>{{#else}}<div>altname2</div>{{/if}}{{/if}}",
          data: {test: 1}
        }).inject(container);

        expect($("div",container).length).to.equal(1);
        expect($("div",container).html()).to.equal("altname");
        component.$update("test", 6);
        expect($("div",container).length).to.equal(1);
        expect($("div",container).html()).to.equal("test");
    

        destroy(component, container)

      })

    })

    describe("If combine with attribute", function(){
      
    })
  })


    
    
}();

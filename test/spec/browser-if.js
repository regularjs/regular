var container = document.createElement('div');
var component = new Regular({
  template: "<div {{#if username}}class='name' {{/if}} >haha</div>",
  data: { test: 1 }
}).inject(container);

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

      it("if destroy should remove bind watchers", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "{{#if test > 5}}<div>{{test}} {{hello}}</div>{{#else}}<div>{{hello}}</div>{{/if}}",
          data: { test: 1 }
        }).inject(container);

        expect(component._watchers.length).to.equal(2)

        component.$update('test', 6);

        expect(component._watchers.length).to.equal(3)
        component.$update('test', 0);

        expect(component._watchers.length).to.equal(2)
        destroy(component, container);
      })

      it("nested if destroy should remove bind watchers", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "{{#if test > 5}}{{#if test < 8}}<div>{{test}} {{hello}}</div>{{/if}}{{/if}}",
          data: { test: 6 }
        }).inject(container);

        expect(component._watchers.length).to.equal(4);

        component.$update("test", 10);
        expect(component._watchers.length).to.equal(2);
        component.$update("test", 6);
        expect(component._watchers.length).to.equal(4);
        component.$update("test", 10);
        expect(component._watchers.length).to.equal(2);

        destroy(component, container)
      })

    })

    describe("If combine with attribute", function(){
      it("other rule expect if should throw error when pass in tag", function(){
        expect(function(){
          new Parser("<div {{#list xx as x}}ng-repeat{{/list}}>").parse();
        }).to.throwError();
      })
      it("if should toggle the basic attribute", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "<div {{#if username}}class='name' class='noname'{{/if}} >haha</div>",
          data: { test: 1 }
        }).inject(container);
      })

      it("if combine with unassigned attribute should work correctly", function(){
        
      })

      it("if combine with assigned attribute should work correctly", function(){

      })

      it("if combine with inteplation attribute should work correctly", function(){

      })

      it("if combine with event should work correctly", function(){

      })

      it("if combine with directive should work correctly", function(){

      })

      it("when switch if state, the watcher should distroy automately", function(){

      })

      it("if else combine with attribute should work as expect", function(){

      })

    })
  })


    
    
}();


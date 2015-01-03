

void function(){

  var dom = require_lib("dom.js");

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
          template: "{#if test}<div>test</div>{/if}",
          data: {test: true}
        }).$inject(container);


        expect($("div",container).length).to.equal(1);

        component.$update("test", false);
        expect($("div",container).length).to.equal(0);

        destroy(component, container)
      })

      it("regular should convert value to boolean", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "{#if test}<div>test</div>{/if}",
          data: {test: 0}
        }).$inject(container);

        expect($("div",container).length).to.equal(0);
        component.$update("test", 1);

        expect($("div",container).length).to.equal(1);

        destroy(component, container)
      })


      it("use if else should work correctly", function(){

        var container = document.createElement('div');
        var component = new Regular({
          template: "{#if test}<div>test</div>{#else}<div>altname</div>{/if}"
        }).$inject(container);

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
          template: "{#if test > 5}<div>test</div>{#elseif test<2}<div>altname</div>{/if}",
          data: {test: 1}
        }).$inject(container);


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
          template: "{#if test > 5}<div>test</div>{#elseif test<2}<div>altname</div>{#else}<div>altname2</div>{/if}",
          data: {test: 1}
        }).$inject(container);

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
          template: "{#if test > 5}<div>test</div>{#else}{#if test<2}<div>altname</div>{#else}<div>altname2</div>{/if}{/if}",
          data: {test: 1}
        }).$inject(container);

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
          template: "{#if test > 5}<div>{test} {hello}</div>{#else}<div>{hello}</div>{/if}",
          data: { test: 1 }
        }).$inject(container);

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
          template: "{#if test > 5}{#if test < 8}<div>{test} {hello}</div>{/if}{/if}",
          data: { test: 6 }
        }).$inject(container);

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
          new Parser("<div {#list xx as x}ng-repeat{/list}>").parse();
        }).to.throwError();
      })
      it("if should toggle the basic attribute", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "<div {#if test}class='name' title='noname'{/if} data-haha=name >haha</div>",
          data: { test: 0 }
        }).$inject(container);

        var $node = $("div[data-haha]",container)
        expect($node.length).to.equal(1);
        expect($node[0].className).to.equal("");
        expect($node.attr("title")).to.equal(undefined);
        component.$update("test", 10);
        expect($node[0].className).to.equal("name");
        expect($node.attr("title")).to.equal("noname");
        component.$update("test", 0);
        expect($node[0].className).to.equal("");
        expect($node.attr("title")).to.equal(undefined);
        expect($node.attr("data-haha")).to.equal("name");
        destroy(component, container);
      })

      it("if combine with unassigned attribute should work correctly", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "<div {#if test}ng-repeat{/if} class='hello' >haha</div>",
          data: { test: 0 }
        }).$inject(container);

        var $node = $("div.hello",container)
        expect($node.length).to.equal(1);
        expect($node.attr("ng-repeat")).to.equal(undefined);
        component.$update("test", 10);
        expect($node.attr("ng-repeat")).to.equal("");
        component.$update("test", 0);
        expect($node.attr("ng-repeat")).to.equal(undefined);
        destroy(component, container);
      })


      it("if combine with inteplation attribute should work correctly", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "<div {#if test}ng-repeat={name}{/if} class='hello' >haha</div>",
          data: { test: 0 , name: 'hahah'}
        }).$inject(container);

        var $node = $("div.hello",container)
        expect($node.length).to.equal(1);
        expect($node.attr("ng-repeat")).to.equal(undefined);
        expect(component._watchers.length).to.equal(1);
        component.$update("test", 10);
        expect($node.attr("ng-repeat")).to.equal("hahah");
        expect(component._watchers.length).to.equal(2);
        component.$update("test", 0);
        expect($node.attr("ng-repeat")).to.equal(undefined);
        expect(component._watchers.length).to.equal(1);
        destroy(component, container);
      })

      it("if combine with event should work correctly", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "<div {#if test}ng-repeat={name}{/if} class='hello' >haha</div>",
          data: { test: 0 , name: 'hahah'}
        }).$inject(container);
      })
      it("if combine with custom event should work correctly", function(){
        var container = document.createElement('div');
        var Component = Regular.extend();
        var i=0;
        Component.event('hello', function(elem, fire){
          i = 1
          dom.on(elem, 'click', fire)
          return function(){
            i = 0;
            dom.off(elem, 'click', fire)
          }
        })
        var component = new Component({
          template: "<div {#if test}on-hello={name=name+1}{/if} class='hello' >haha</div>",
          data: { test: 0 , name: 'hahah'}
        }).$inject(container);
        var node = nes.one("div", container);
        expect(i).to.equal(0);
        component.$update("test", 10);

        expect(i).to.equal(1);
        expect(component.data.name).to.equal("hahah");

        dispatchMockEvent(node, 'click');
        expect(component.data.name).to.equal("hahah1");

        expect(component._watchers.length).to.equal(1)

        component.$update("test", 0);
        expect(i).to.equal(0);

        destroy(component, container);
      })

      it("if combine with event , the watchers should be automately removed", function(){
        var container = document.createElement('div');
        var Component = Regular.extend();
        Component.event('hello', function(elem, fire){
          this.$watch("hello", function(){})
        })

        var component = new Component({
          template: "<div {#if test}on-hello={name=name+1}{/if} class='hello' >haha</div>",
          data: { test: 0 , name: 'hahah'}
        }).$inject(container);

        expect(component._watchers.length).to.equal(1)
        component.$update("test", 10);
        expect(component._watchers.length).to.equal(2)
        component.$update("test", 0);
        expect(component._watchers.length).to.equal(1)
      })

      it("if combine with directive should work correctly", function(){
        var container = document.createElement('div');
        var Component = Regular.extend();
        var i = 0;
        Component.directive('t-hello', function(elem, fire){
          this.$watch('name', function(){
            i++;
          })
        })
        var component = new Component({
          template: "<div {#if test} t-hello='haha'{/if} class='hello' >haha</div>",
          data: { test: 0 , name: 'hahah'}
        }).$inject(container);

        expect(i).to.equal(0);
        component.$update("test", 10);
        expect(i).to.equal(1);
        component.$update("name", 10);
        expect(i).to.equal(2);
        component.$update("test", 10);
        component.$update("name", 10);
        expect(i).to.equal(2);
        destroy(component, container)
      })

      it("when switch if state, the watcher should distroy automately", function(){
        var container = document.createElement('div');
        var Component = Regular.extend();
        Component.directive('t-hello', function(elem, fire){
          this.$watch("hello", function(){})
        })
        var component = new Component({
          template: "<div {#if test} t-hello='haha'{/if} class='hello' >haha</div>",
          data: { test: 0 , name: 'hahah'}
        }).$inject(container);
        expect(component._watchers.length).to.equal(1)
        component.$update("test", 10);
        expect(component._watchers.length).to.equal(2)
        component.$update("test", 0);
        expect(component._watchers.length).to.equal(1)

        destroy(component, container)

      })

      it("if else combine with attribute should work as expect", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "<div {#if test} title='haha' {#else} title2='haha2' {/if} class='hello' >haha</div>",
          data: { test: 1 , name: 'hahah'}
        }).$inject(container);
        var $node = $("div.hello",container)
        expect($node.attr("title")).to.equal("haha");
        expect($node.attr("title2")).to.equal(undefined);
        component.$update("test", 0)
        expect($node.attr("title")).to.equal(undefined);
        expect($node.attr("title2")).to.equal("haha2");

        destroy(component, container);
      })
      it("if elseif combine with attribute should work as expect", function(){
        var container = document.createElement('div');
        var component = new Regular({
          template: "<div {#if test} title='haha' {#elseif name} title2='haha2' {/if} class='hello' >haha</div>",
          data: { test: 0 , name: 'hahah'}
        }).$inject(container);

        var $node = $("div.hello",container)
        expect($node.attr("title")).to.equal(undefined);
        expect($node.attr("title2")).to.equal("haha2");
        
        component.$update("test", true)
        expect($node.attr("title2")).to.equal(undefined);
        expect($node.attr("title")).to.equal("haha");


        destroy(component, container);
      })
      // it("if if combine with attribute should work as expect", function(){
      //   var container = document.createElement('div');

      //   var component = new Regular({
      //     template: "<div {#if test} title='haha' {#if name} title2='haha2' {/if} {/if} class='hello' >haha</div>",
      //     data: { test: 1 , name: ''}
      //   }).$inject(container);
      //   var $node = $("div.hello",container)
      //   expect($node.attr("title")).to.equal("haha");
      //   expect($node.attr("title2")).to.equal(undefined);
      //   component.$update("name", true)
      //   expect($node.attr("title2")).to.equal("haha2");

      //   destroy(component, container);

      // })
      it("if elseif else combine with attribute should work as expect", function(){
        var container = document.createElement('div');

        var component = new Regular({
          template: "<div {#if test} title='haha' {#elseif name} title2='haha2' {#else} title3='haha3' {/if} class='hello' >haha</div>",
          data: { test: 1 , name: ''}
        }).$inject(container);
        var $node = $("div.hello",container)

        expect($node.attr("title")).to.equal("haha");
        expect($node.attr("title2")).to.equal(undefined);
        expect($node.attr("title3")).to.equal(undefined);

        component.$update("test", false)
        component.$update("name", true)
        expect($node.attr("title")).to.equal(undefined);
        expect($node.attr("title2")).to.equal("haha2");
        expect($node.attr("title3")).to.equal(undefined);

        component.$update("test", false)
        component.$update("name", false)
        expect($node.attr("title3")).to.equal("haha3");
        expect($node.attr("title")).to.equal(undefined);
        expect($node.attr("title2")).to.equal(undefined);

        destroy(component, container);

      })

    })
  })


    
    
}();


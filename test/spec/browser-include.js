var Regular = require_lib("index.js");
void function(){

  var container = document.createElement('div');
  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }

  describe("Dynamic include", function(){
    it("#include should compile value at runtime correctly", function(){
      var container = document.createElement('div');
      var component = new Regular({
        template: "<div>{#include content}</div>",
        data: {content: "<div>{name}</div>", name: "hello"}
      }).$inject(container);

      var $node = $("div", container);
      expect($("div", container).length).to.equal(2);
      expect($node[1].innerHTML).to.equal("hello");

      destroy(component, container)

    })

    it("#include should recompile template when changed", function(){
      var container = document.createElement('div');
      var component = new Regular({
        template: "<div>{#include content}</div>",
        data: {content: "<div>{name}</div>", name: "hello"}
      }).$inject(container);

      var $node = $("div", container);
      expect($("div", container).length).to.equal(2);

      component.$update("content", "<span>{name + '2'}</span>");

      expect($("div", container).length).to.equal(1);
      expect($("span", container).html()).to.equal("hello2");

      destroy(component, container)

    })

    it("if body has been a ast, there should be not watch binding", function(){
      var container = document.createElement('div');
      var component = new Regular({
        template: "<div>{#include content}</div>",
        data: {content: Regular.parse("<div>{name}</div>"), name: "hello"}
      }).$inject(container);

      var $node = $("div", container);
      expect($("div", container).length).to.equal(2);

      component.$update("content", "<span>{name + '2'}</span>");

      expect($("div", container).length).to.equal(1);
      expect($("span", container).html()).to.equal("hello2");

      destroy(component, container)

    })
    it("nest should be as a special propertie $body", function(){
      var Component = Regular.extend({
        name: "test-body",
        template: "{#list list as item}<div>{#include this.$body}</div>{/list}"
      });
      var container = document.createElement('div');
      var component = new Component({
        template: "<test-body list={list}><span>{item_index}:{item}</span></test-body>",
        data: {list: ["hello", "name"]}
      }).$inject(container);

      var nodes = nes.all("span", container);
      expect(nodes.length).to.equal(2);
      expect(nodes[1].innerHTML).to.equal("1:name");
      
      destroy(component, container)

    })
  })

}()


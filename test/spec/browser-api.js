void function(){
  var Regular = require_lib("index.js")
  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }
  describe("instance API", function(){
    var  container, container2;
    before(function(){
      container = document.createElement("div");
      container2 = document.createElement("div");
    })
    after(function(){
      container = null;
      container2 = null;
    })
    it("component.$inject should use twice", function(){
      var component = new Regular({
        template:"{{hello}}<div>hello</div><p>name</p>"
      }).$inject(container);
      expect(container.innerHTML).to.equal("<div>hello</div><p>name</p>");

      component.$inject(container2);

      expect(container.innerHTML).to.equal("");
      expect(nes("div", container2).length).to.equal(1);

      destroy(component, container2)

    })

    it("component.$inject works on list when use twice", function(){
      var component = new Regular({
        template:"{{#list items as item}}<div>hello</div>{{/list}}",
        data: {items: [1]}
      }).$inject(container);

      component.$inject(container2)

      component.data.items.push(2);
      component.$update()

      expect(nes.all("div", container2).length).to.equal(2);
      expect(nes.all("div", container).length).to.equal(0);
      destroy(component, container2)
    })

    it("component.$inject works on if when use twice", function(){
      var component = new Regular({
        template:"{{#if test}}<div>hello</div><p>name</p>{{/if}}",
        data: {test: true}
      }).$inject(container);

      expect(nes.all("div", container).length).to.equal(1);

      component.$inject(container2)

      expect(container.innerHTML).to.equal("");
      expect(nes.all("div", container2).length).to.equal(1);
      destroy(component, container2)
    })
    it("component.$inject works on if when use twice", function(){
      var component = new Regular({
        template:"{{#if test}}<div>hello</div><p>name</p>{{/if}}",
        data: {test: true}
      }).$inject(container);

      expect(nes.all("div", container).length).to.equal(1);

      component.$inject(container2)

      expect(container.innerHTML).to.equal("");
      expect(nes.all("div", container2).length).to.equal(1);
      destroy(component, container2)
    })

    it("component.$inject works on include when use twice", function(){
      var component = new Regular({
        template:"{{#include template}}",
        data: {template: "<div></div>"}
      }).$inject(container);

      component.$inject(container2)
      
      expect(nes.all("div", container).length).to.equal(0);

      expect(nes.all("div", container2).length).to.equal(1);
      destroy(component, container2)
    })
  })

}()

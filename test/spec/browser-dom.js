var dom = require_lib('dom.js');
var Regular = require_lib("index.js");

void function(){
  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }


  describe("Dom", function(){

    describe("[Regular.dom] api", function(){
      it("class relative api", function(){
        var div = dom.create("div");
        dom.addClass(div, "name");
        expect(dom.hasClass(div, "name")).to.equal(true);
        dom.delClass(div, "name");
        expect(dom.hasClass(div, "name")).to.equal(false);
      })
    })

    it("trigger simple click event", function(){
      var container = document.createElement('div');
      var component = new Regular({
        template: "<div on-click={{name=1}}>test</div>",
        data: {test: 0}
      }).inject(container);

      var $node = $('div', container);

      expect(component.data.name).to.equal(undefined);
      expect($node.length).to.equal(1);

      dispatchMockEvent($node[0], 'click');
      expect(component.data.name).to.equal(1);

      destroy(component, container);



    })
  })

}()



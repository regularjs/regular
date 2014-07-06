var dom = require_lib('dom.js');
var Regular = require_lib("index.js");

void function(){
  describe("Dom", function(){
    describe('Attribute', function(){
      it("some special attribute should set correctly", function(){

      })
    })

    describe("[Regular.dom] api", function(){
      it("class relative api", function(){
        var div = dom.create("div");
        dom.addClass(div, "name");
        expect(dom.hasClass(div, "name")).to.equal(true);
        dom.delClass(div, "name");
        expect(dom.hasClass(div, "name")).to.equal(false);
      })
    })
  });

}()



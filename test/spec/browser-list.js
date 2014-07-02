var Regular = require_lib("index.js");
void function(){
  
  describe("List", function(){
    describe('basic', function(){
    })

    describe('list with directive', function(){
      it('the context passed in list must the $context', function(){
        var list = "{{#list 1..3 as num}} <div t-test={{name}}></div> {{/list}}"
        var component;
        var BaseComponent = Regular.extend({
          template: list

        })

        component = new BaseComponent();
      })
    })
  })


}()
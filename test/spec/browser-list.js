var Regular = require_lib("index.js");
void function(){
  
  describe("List", function(){
    describe('basic', function(){
      it('the basic list based on range should work', function(){
        var container = document.createElement('div');
        var list = "<div t-test={{num}}>{{#list 1..3 as num}}<div>{{num}}</div> {{/list}}</div>"
        var component;
        var BaseComponent = Regular.extend({
          template: list
        }).directive('t-test', function(elem, value){
          this.$on('init', function(){
            expect(elem.innerHTML).not.to.equal('')
          })
          
        })

        component = new BaseComponent().inject(container);
        expect($('div',container).length).to.equal(4);
      })
    })

    describe('list with directive', function(){
    })
  })


}()
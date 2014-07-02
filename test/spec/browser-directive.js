
var Regular = require_lib("index.js");
void function(){

function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}

  
describe("Directive", function(){
  describe('Process', function(){
    var container = document.createElement('div')
    Regular.directive('r-html', function(elem, value){
      this.$watch(value, function(nvalue){
        elem.innerHTML = nvalue;
      })
    })
    it('registed directive should works on template', function(){
      var component = new Regular({
        template: "<div class='m-class' r-html='content'></div>",
        data: {
          content:'hello'
        }
      }).inject(container)

      expect($('.m-class', container).html()).to.equal(component.data.content)

      component.$update('content', 30000)

      expect($('.m-class', container).html()).to.equal('30000')
      component.destroy();
      expect(container.innerHTML).to.equal('');
    })

    it('unregister attribute should just act attribute-inteplation', function(){
      var component = new Regular({
        template: "<div class='m-class' t-invalid={{content}}></div>",
        data: {
          content:'hello'
        }
      }).inject(container)


      expect($('.m-class', container).attr('t-invalid')).to.equal(component.data.content)
      component.$update('content', 'changed')
      expect($('.m-class', container).attr('t-invalid')).to.equal('changed')
      component.destroy();
      expect(container.innerHTML).to.equal('');

    })

    it('the expression passed in should touched already ', function(){
      var tmpName = "t-" + Regular.util.uid();
      Regular.directive(tmpName, function(elem, value){
        expect(value.type).to.equal('expression')        
        expect(value.get).to.be.a('function')
        expect(value.set).to.be.a('function')
      })
      var component = new Regular({
        template: "<div class='m-class' "+tmpName+"={{content}}></div>",
        data: {
          content:'hello'
        }
      }).inject(container)
    })

  })

  describe('r-model buildin directive', function(){
    var container = document.createElement('div');
    it("input:email with 'model' directive should works as expect", function(){
      var template = '<input type="email" value="87399126@163.com" r-model={{email}}>';
      var component = new Regular({
        template: template
      }).inject(container)

      expect($('[type=email]', container)[0].tagName.toLowerCase()).to.equal('input')
      expect(component.data.email).to.equal('87399126@163.com')

      component.$update('email','hello');

      expect(component.data.email).to.equal('hello')
      expect($('[type=email]', container).val()).to.equal('hello')

      component.destroy();
      expect(container.innerHTML).to.equal('')

    })

    it("input:password and text with 'r-model' should works", function(){
      var template = 
        '<input type="password" value="123456" r-model={{password}}>'+
        '<input type="text" r-model={{text}}>'
      var component = new Regular({
        template: template
      }).inject(container)

      expect($('input', container).length).to.equal(2)
      expect($('input:nth-child(10n+1)', container).val()).to.equal("123456");
      expect($('input:nth-child(10n+2)', container).val()).to.equal("");

      component.$update({
        text: '1234',
        password: 3456
      })
      expect($('input:nth-child(10n+1)', container).val()).to.equal("3456");
      expect($('input:nth-child(10n+2)', container).val()).to.equal("1234");
      // destroy
      component.destroy();
      expect(container.innerHTML).to.equal("");
    })
    it('input with non type should works as expect', function(){
      var template = "<input r-model={{nontype}}>";
      var component = new Regular({
        template: template
      }).inject(container);

      expect($('input', container).length).to.equal(1)
      expect($('input', container).val()).to.equal('')

      component.$update('nontype', 'hello');
      expect($('input', container).val()).to.equal('hello')

      component.destroy()
    })

    it('input:checkbox"s initial state should be correct', function(){
      var template = 
        "<input type='checkbox' r-model={{nontype}}  id='name'>"+
        "<input type='checkbox' r-model={{nontype2}} checked=checked>";
      var component = new Regular({
        template: template
      }).inject(container);




      expect($('input', container).length).to.equal(2)
      expect($('input:first-child', container)[0].checked).to.equal(false)
      expect($('input:last-child', container)[0].checked).to.equal(true)
    })
    it('input:checkbox should works correctly', function(){
      var template = "<input type='checkbox' r-model={{nontype}}>";
    })

  })


  describe('other buildin directive', function(){
    it('r-hide should force element to "display:none" when the expression is evaluated to true', function(){
      
    })
  })


});


}();




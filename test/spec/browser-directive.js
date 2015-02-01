

var Regular = require_lib("index.js");
void function(){

function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}

  
describe("Directive", function(){
  describe('Process', function(){
    var container = document.createElement('div')
    Regular.directive('t-html', function(elem, value){
      this.$watch(value, function(nvalue){
        elem.innerHTML = nvalue;
      })
    })
    
    it('registed directive should works on template', function(){
      var component = new Regular({
        template: "<div class='m-class' t-html='content'></div>",
        data: {
          content:'hello'
        }
      }).$inject(container)


      expect($('.m-class', container).html()).to.equal(component.data.content)

      component.$update('content', 30000)

      expect($('.m-class', container).html()).to.equal('30000')
      component.destroy();
      expect(container.innerHTML).to.equal('');
    })

    it('unregister attribute should just act attribute-inteplation', function(){
      var component = new Regular({
        template: "<div class='m-class' t-invalid={content}></div>",
        data: {
          content:'hello'
        }
      }).$inject(container)


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
        template: "<div class='m-class' "+tmpName+"={content}></div>",
        data: {
          content:'hello'
        }
      }).$inject(container)
    })

    it('the whole attributes should be get in directive handler', function(done){
      var tmpName = "t-" + Regular.util.uid();
      Regular.directive(tmpName, function(elem, value, name, attrs){
        expect(value.type).to.equal('expression')        
        expect(value.get).to.be.a('function');
        expect(value.set).to.be.a('function');
        expect(attrs.length).to.equal(3);
        done()
      })
      var component = new Regular({
        template: "<div class='m-class' "+tmpName+"={content} t-randomAttr={1}></div>",
        data: {
          content:'hello'
        }
      })

    })
    it('the whole attributes should be get in event handler', function(done){
      var tmpName = "on-upload2";
      Regular.event("upload2", function(elem, fire, attrs){
        expect(attrs.length).to.equal(3);
        done()
      })
      var component = new Regular({
        template: "<div class='m-class' on-upload2={content} t-randomAttr={1}></div>",
        data: {
          content:'hello'
        }
      })

    })


  })



});

describe('r-model directive', function(){


  var container = document.createElement('form');

  describe('text binding', function(){
    it("input:email with 'model' directive should works as expect", function(){
      var template = '<input type="email" value="87399126@163.com" r-model={email}><div>{email}</div>';
      var component = new Regular({
        template: template
      }).$inject(container)


      expect(nes.all('input', container).length).to.equal(1);
      // expect($('div', container).html()).to.equal('87399126@163.com')

      component.$update('email','hello');



      expect(component.data.email).to.equal('hello')
      expect(nes.one('input', container).value).to.equal('hello')

      destroy(component, container)

    })

    it("input:password and text with 'r-model' should works", function(){
      var template = 
        '<input type="password" value="123456" r-model={password}>'+
        '<input type="text" r-model={text}>'
      var component = new Regular({
        template: template
      }).$inject(container)

      var inputs = nes.all('input', container);

      expect(inputs.length).to.equal(2)
      expect(inputs[0].value).to.equal("123456");
      expect(inputs[1].value).to.equal("");

      component.$update({
        text: '1234',
        password: 3456
      })
      expect(inputs[0].value).to.equal("3456");
      expect(inputs[1].value).to.equal("1234");
      destroy(component, container)
    })
    it('input with non type should works as expect', function(){
      var template = "<input r-model={nontype}>";
      var component = new Regular({
        template: template
      }).$inject(container);

      expect($('input', container).length).to.equal(1)
      expect($('input', container).val()).to.equal('')

      component.$update('nontype', 'hello');
      expect($('input', container).val()).to.equal('hello')

      component.destroy()
    })

    it('textarea binding should also works', function(){

        var template = 
          '<textarea r-model={textarea}></textarea>'+
          '<textarea r-model={textarea}></textarea>'
        var component = new Regular({
          template: template,
          data: {textarea: '100'}
        }).$inject(container);

        expect($('textarea', container).length).to.equal(2);
        expect($('textarea', container).val()).to.equal("100");
        destroy(component, container);
    })



  })

  describe('checkbox binding', function(){
    it('input:checkbox"s initial state should be correct', function(){
      var template = 
        "<input checked  type='checkbox' r-model={nontype} >"+
        "<input type='checkbox' r-model={nontype3}>"+
        "<input type='checkbox' r-model={nontype2} checked=checked>";
      var component = new Regular({
        template: template
      }).$inject(container);




      expect($('input', container).length).to.equal(3)
      expect($('input:first-child', container)[0].checked).to.equal(true)
      expect($('input:last-child', container)[0].checked).to.equal(true)
      expect($('input:nth-child(10n+2)', container)[0].checked).to.equal(false)

      expect(component.data.nontype).to.equal(true);
      expect(component.data.nontype2).to.equal(true);
      expect(component.data.nontype3).to.equal(false);

      destroy(component, container);

    })
    it('input:checkbox should works correctly', function(){
      var template = "<input type='checkbox' r-model={checked}>";
      var component = new Regular({
        template: template
      }).$inject(container);

      expect($('input', container).length).to.equal(1)
      expect(component.data.checked).to.equal(false);

      component.$update('checked', true)

      expect($('input', container)[0].checked).to.equal(true)

      destroy(component, container);
    });
  })

  describe('select binding', function(){
    it('the initial state of select binding should correct', function(){
      var template1 = 
        "<select  r-model={selected1}>\
          <option value='1' >Ningbo</option>\
          <option value='2'>Hangzhou</option>\
          <option value='3' selected>Beijing</option>\
        </select>";
      var template2 = 
        "<select  r-model={selected2}>\
          <option value='1'>Ningbo</option>\
          <option value='2'  selected=selected>Hangzhou</option>\
          <option value='3'>Beijing</option>\
        </select>";
      var template3 = 
        "<select  r-model={selected3}>\
          <option value='1'>Ningbo</option>\
          <option value='2'>Hangzhou</option>\
          <option value='3'>Beijing</option>\
        </select>";

      var component = new Regular({

        template: template1 + template2 + template3

      }).$inject(container);

      expect($('select', container).length).to.equal(3)

      expect($('select:first-child', container).val()).to.equal("3")
      expect($('select:nth-child(10n+2)', container).val()).to.equal("2")
      expect($('select:nth-child(10n+3)', container).val()).to.equal("1")

      expect(component.data.selected1).to.equal('3');
      expect(component.data.selected2).to.equal('2');
      expect(component.data.selected3).to.equal('1');

      destroy(component, container)
    })

    it("select should works as expect", function(){
      var template1 = 
        "<select  r-model={selected1}>\
          <option value='1' >Ningbo</option>\
          <option value='2'>Hangzhou</option>\
          <option value='3' selected>Beijing</option>\
        </select>";
      var component = new Regular({

        template: template1

      }).$inject(container);


      expect($('select', container).val()).to.equal("3");
      expect(component.data.selected1).to.equal("3");

      component.$update('selected1', "2");
      expect($('select', container).val()).to.equal("2");

      //destroy
      destroy(component, container);
    })

    it('select combine with list should works as expected', function(){
      var template = 
        "<select  r-model={selected}>\
          {#list values as value}\
            <option value={value.value}>{value.name}</option>\
          {/list}\
        </select>";
      var component = new Regular({

        template: template,
        data: {
          values: [
            { value:"10", name:"Ningbo" },
            { value:"20", name:"Hangzhou" },
            { value:"30", name:"Beijing" }

          ],
          selected: "10"
        }

      }).$inject(container);


      // expect($('select option', container).length).to.equal(3)
        expect($('select', container).val()).to.equal("10");
        component.$update("selected", "20");
        expect($('select', container).val()).to.equal("20");

        destroy(component, container);

    })

    it("r-model:select in list should works as expect", function(){
      var container = document.createElement('div')
      var Component = Regular.extend({});
      var component = new Regular({
        data: {test: true, hello: {} } ,
        template: "{#list 1..2 as hah}<select r-model='hello.name'>{#list [1,2,3,4] as item}<option value={item} selected={item_index==2}>haha</option>{/list}</select>{/list}"
      }).$inject(container)


      expect(nes.one("select", container).value).to.equal('3');
      expect(component.data.hello.name).to.equal('3');

      destroy(component, container);

    })
  })


  describe('radio binding', function(){
    var container = document.createElement("div");

    it('input:checkbox"s initial state should be correct', function(){
      var template = 
        "<input  value='radio1' type='radio' r-model={radio}>" + 
        "<input value='radio2' type='radio' r-model={radio} checked >"
      var component = new Regular({
        template: template
      }).$inject(container);

      expect(nes.all('input', container).length).to.equal(2);
      expect(component.data.radio).to.equal('radio2');

      destroy(component, container);
    })
    it('input:checkbox should work as expected', function(){
      var template = 
        "<input type='radio' r-model={radio} value='radio1'>" + 
        "<input type='radio' r-model={radio} value='radio2'>"
      var component = new Regular({
        template: template
      }).$inject(container);

      expect($('input', container).length).to.equal(2);
      expect(component.data.radio).to.equal(undefined);

      component.$update('radio', 'radio2')

      expect($('input', container)[1].checked).to.equal(true);

      destroy(component, container);

    })

    it("r-model in if should works as expect", function(){
      var container = document.createElement('div')
      var Component = Regular.extend({});
      var component = new Regular({
        data: {test: true} ,
        template: "{#if !test}<input r-model={item} value='1' />{/if}"
      }).$inject(container)

      component.$update("test", false);

      expect(nes.one("input", container).value).to.equal('1');
      expect(component.data.item).to.equal('1');

      destroy(component, container);

    })
    it("r-model in list should works as expect", function(){
      var container = document.createElement('div')
      var Component = Regular.extend({});
      var component = new Regular({
        data: {test: true, hello: {} } ,
        template: "{#list [1,2,3,4] as item}<input r-model={hello.name} value='1' />{/list}"
      }).$inject(container)

      expect(nes.one("input", container).value).to.equal('1');
      expect(component.data.hello.name).to.equal('1');

      destroy(component, container);

    });

  })

})



describe('other buildin directive', function(){
  var container = document.createElement('div');


  it('r-hide should force element to "display:none" when the expression is evaluated to true', function(){
    var template = "<div r-hide={!!user}>Please Login</div>" 

    var component = new Regular({
      template: template,
      data: {user: 'hello'}
    }).$inject(container);

    

    expect($('div', container).css('display')).to.equal('none');

    component.$update('user','');

    expect($('div', container).css('display')).not.to.equal('none');

    destroy(component, container);

  })

  it('r-class should add all property as the class whose propertyValue is evaluated to true', function(){
    var template = "<div r-class={ {'z-show': num < 6, 'z-active': num > 3} }>Please Login</div>" 

    var component = new Regular({
      template: template,
      data: {num: 4}
    }).$inject(container);

    expect($('div', container).hasClass('z-show')).to.equal(true);
    expect($('div', container).hasClass('z-active')).to.equal(true);

    component.$update('num', 2);
    expect($('div', container).hasClass('z-show')).to.equal(true);
    expect($('div', container).hasClass('z-active')).to.equal(false);

    component.$update('num', 8);
    expect($('div', container).hasClass('z-show')).to.equal(false);
    expect($('div', container).hasClass('z-active')).to.equal(true);

    destroy(component, container);

  })

  it("r-class can combine with raw class attribute", function(){
    var template = "<div class='rawClass' r-class={ {'z-show': num < 6, 'z-active': num > 3} }>Please Login</div>" 
    var component = new Regular({
      template: template,
      data: {num: 4}
    }).$inject(container);

    expect($('div', container).hasClass('rawClass')).to.equal(true);
    expect($('div', container).hasClass('z-active')).to.equal(true);
    expect($('div', container).hasClass('z-show')).to.equal(true);

    component.$update('num', 2);
    expect($('div', container).hasClass('rawClass')).to.equal(true);
    expect($('div', container).hasClass('z-show')).to.equal(true);
    expect($('div', container).hasClass('z-active')).to.equal(false);

    destroy(component, container)


  })
  it("r-class can not combine with class inteplation", function(){
    var template = "<div class='{topClass}' r-class={ {'z-show': num < 6, 'z-active': num > 3} }>Please Login</div>" 
    var component = new Regular({
      template: template,
      data: {num: 4}
    }).$inject(container);

    expect($('div', container).hasClass('z-active')).to.equal(true);
    expect($('div', container).hasClass('z-show')).to.equal(true);

    component.$update('topClass', 'hello')

    expect($('div', container).hasClass('z-active')).to.equal(false);
    expect($('div', container).hasClass('z-show')).to.equal(false);
    // override the r-class
    expect($('div', container).hasClass('hello')).to.equal(true);

    destroy(component, container);

  })
  it("r-style should add all property specify in the passed arguments(type Object)", function(){
    var template = "<div class='{topClass}' r-class={ {'z-show': num < 6, 'z-active': num > 3} }>Please Login</div>" 
    var component = new Regular({
      template: template,
      data: {num: 2}
    }).$inject(container);

    // TODO
    destroy(component, container)

  })

  it("r-html should create unescaped inteplation verus {} ", function(){
    var template = "<div r-html='name'>Please Login</div>" 
    var component = new Regular({
      template: template,
      data: {}
    }).$inject(container);

    expect(nes.one('div', container).innerHTML).to.equal("");

    component.$update("name", "<p>a</p>")

    expect(nes.all('div p', container).length).to.equal(1);
    destroy(component, container)

  })


})

describe("refs attribute", function(){
  var container = document.createElement("div");
  var Component = Regular.extend({
    template: "<div>haha</div>"
  });
  it("ref on element should work as expect", function(){
    var component = new Component({
      template: "<div ref=haha>hello</div>",
      data: {
        hello: 1
      }
    }).$inject(container)

    expect(component.$refs["haha"] === nes.one('div', container)).to.equal(true);
    destroy(component, container);
  })
  it("ref on element with expression should work as expect", function(){
    var component = new Component({
      template: "<p ref={haha}></p>",
      data: {
        haha: "haha"
      }
    }).$inject(container)

    expect(component.$refs["haha"] === nes.one('p', container)).to.equal(true);
    destroy(component, container);

  })

  it("ref on component should work as expect", function(){
    var Component1 = Component.extend({
      name: "haha",
      template: "<input type='text' />"
    }) 
    var component = new Component({
      template: "<haha ref=haha></haha>",
      data: {
        haha: "haha"
      }
    }).$inject(container)

    expect(component.$refs["haha"] instanceof Component1).to.equal(true);
    destroy(component, container);
  })

  it("ref on component with should work as expect", function(){
    var Component1 = Component.extend({
      name: "haha",
      template: "<input type='text' />"
    }) 
    var component = new Component({
      template: "<haha ref={haha}></haha>",
      data: {
        haha: "haha"
      }
    }).$inject(container)


    expect(component.$refs["haha"] instanceof Component1).to.equal(true);

    destroy(component, container);
  })

  it("ref should works with list", function(){
    var component = new Component({
      template: "{#list items as item}<div ref={haha + item_index} id={item_index}>haha</div>{/list}",
      data: {
        haha: "haha",
        items: [1,2,3]
      }
    }).$inject(container)

    expect(component.$refs["haha0"].id).to.equal("0");
    expect(component.$refs["haha1"].id).to.equal("1");
    expect(component.$refs["haha2"].id).to.equal("2");

    component.$update(function(data){
      data.items.pop();
    })

    expect(component.$refs["haha2"]).to.equal(null);

    destroy(component, container);
  })
  it("ref should destroied as expect", function(){
    var component = new Component({
      template: "{#list items as item}<div ref={haha + item_index} id={item_index}>haha</div>{/list}",
      data: {
        haha: "haha",
        items: [1,2,3]
      }
    }).$inject(container)

    component.$update(function(data){
      data.items.pop();
    })

    destroy(component, container);
    expect(component.$refs).to.equal(null);
  })
})



describe('the atrributeValue with the string type is valid in most buildin directive', function(){
  // var container = document.createElement('div');
  // var template = "da"
  // var component = new Regular({
  //   template: template,
  //   data: {num: 2}
  // }).$inject(container);


  // destroy(component, container);
})


}();




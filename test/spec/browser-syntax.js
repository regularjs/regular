var expect = require('expect.js');
var Regular = require("../../lib/index.js");

function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}

describe("config", function(){
  var container = document.createElement("div");

  after(function() {
    Regular.config({
      END: '}',
      BEGIN: '{'
    })
  });

  it("END and BEGIN can accpet '[' and ']'", function(){


    Regular.config({
      END: ']',
      BEGIN: '['
    })

    var component = new Regular({
      template: "<p>[{a:1}['a']][a]</p>",
      data: {a:1}
    }).$inject( container );

    expect(nes.one("p",container).innerHTML).to.equal('11');
    destroy(component, container)
  })
  it("END and BEGIN can accpet '{' and '}'", function(){


    Regular.config({
      END: '}',
      BEGIN: '{'
    })
    var component = new Regular({
      template: '<div><ul><li><a href=\"#/knowledge/add\">åˆ›å»º</a></li></ul><table><tbody>{#list list as x}<tr><td><input type=\"checkbox\" value=\"{x.id}\"></td><td>{x.name}</td><td>{x.creator}</td><td>{x.create_time}</td></tr>{/list}</tbody></table></div>',
      data: {list: [{name: 1, creator: 2, create_time: 100, id:100 },{name: 2, creator: 2, create_time: 200, id:100},{name: 3, creator: 2, create_time: 300, id:100}]}
    }).$inject(container);


    expect(nes.all("tr",container).length,container).to.equal(3);
    destroy(component, container)
  })

  it("custom END and BEGIN should also affect string-interplation", function(){


    Regular.config({
      END: '}',
      BEGIN: '{'
    })
    var component = new Regular({
      template: '<div title="{title}1"  on-click={title="2"} on-click={content=2} on-click={ this.nest({param: {title: title}}) }>{content}</div>',
      data: {title: "1", content: "1"},
      nest: function(option){
        this.data.param = option.param;
      }
    }).$inject(container);

    var div = nes.one("div",container);
    expect(div.title).to.equal("11");
    expect(div.innerHTML).to.equal("1");
    dispatchMockEvent(div, 'click');

    expect(div.title).to.equal("21");
    expect(div.innerHTML).to.equal("2");

    destroy(component, container)
  })
  it("END and BEGIN can accpet '[[' and ']]'", function(){

    Regular.config({
      END: ']]',
      BEGIN: '[['
    })

    var component = new Regular({
      template: "<p>[[ {a:1}['a'] ]]</p>",
      data: {a:1}
    }).$inject( container );

    expect(nes.one("p",container).innerHTML).to.equal('1');
    destroy(component, container)
  })
  it("END and BEGIN can accpet '{{{' and '}}}'", function(){

    Regular.config({
      END: '}}}',
      BEGIN: '{{{'
    })

    var component = new Regular({
      template: "<p>{{{ {a:1}['a'] }}}</p>"
    }).$inject( container );

    expect(nes.one("p",container).innerHTML).to.equal('1');
    destroy(component, container)
  })
})

describe("Interplation", function(){
  var container = document.createElement("div");


  it("deep undefined shouldn't throw a xx of undefined error", function(){

    var component = new Regular({
      template: "{#if hello.name.title}{hello.name.title}1{/if}{#list hello.is.undefined as item}{item.name}{/list}{#include hello}"
    }).$inject(container);

    destroy(component, container)
  })

  it("nest undefined with multi inteplation should work correct", function(){
    var component = new Regular({
      template: "<div class='test {hello.title.name} {name} 2' ref=test></div>",
      data: {name: 2}
    })

    expect(component.$refs.test.className).to.equal("test  2 2");
    destroy(component, container)
  })


  it("if function call is undefined, should throw error  ", function(){
    var component = new Regular({
      template: "<div on-click={this.login()} ref=test></div>",
      data: {name: 2}
    })

    expect(function(){
      component.$get("hello.login()");
    }).to.throwError()

    expect(function(){
      component.$get("hello.login");
    }).to.not.throwError()

    expect(function(){
      component.$get("this.login()");
    }).to.throwError()

    expect(function(){
      component.$get("this.login.hello");
    }).to.not.throwError()


    destroy(component, container)
  })

  it("Invalid tag should throw Error" , function(){
    var Component = Regular.extend();

    expect(function(){
      Regular.parse("<script>var</script>")
    }).to.throwError();

    expect(function(){
      Regular.parse("<style>body</style>")
    }).to.throwError();

  })

  it("Invalid Lefthand Expression should throw Error" , function(){
    var component = new Regular({
      data: {name: 2}
    })

    expect(function(){
      component.$get("name + 1 = 3")
    }).to.throwError();

  })

  it("#44: <div>></div> should not throw error", function(){

    expect(function(){ 
      new Regular({template: '<div>></div>'}) 
    }) .to.not.throwError();
    expect(function(){ 
      new Regular({template: '<div>><</div>'}) 
    }) .to.not.throwError();

  })

})

describe('String inteplation', function(){

  it("auto covert 'String inteplation' to Expression", function(){

    var component = new Regular({
      template: "<div ref=div title='haha {name} haha' name='{items.join(\",\")}'></div>",
      data: {
        name: "hehe",
        items: [1,2,3]
      }
    })

    expect(component.$refs.div.getAttribute('title')).to.equal('haha hehe haha');
    expect(component.$refs.div.getAttribute('name')).to.equal('1,2,3');

  })
  it("Directive with String inteplation", function(done){

    var Component = Regular.extend({ 
      template: "<div r-test='haa {name} haha' ></div>"
    });
    Component.directive({
      'r-test': {
        link: function(elem, value){
          expect(value.type).equal('expression')
          done()
        }
      }
    })

    new Component;
  })
  it("Directive without PreCompile Interplation", function(done){

    var Component = Regular.extend({ 
      template: "<div r-test='haa {name} haha' ></div>"
    });

    Component.directive({
      'r-test': {
        nps: true,
        link: function(elem, value){
          expect(typeof value).equal('string')
          done()
        }

      }
    })

    new Component();

  })
})






var expect = require('expect.js');
var Regular = require("../../src/index.js");

var container = document.createElement('div');
function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}

describe("Dynamic include", function(){
  var Component = Regular.extend();
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
      template: "<test-body list={list}><span>{list.length}:{list[0]}</span></test-body>",
      data: {list: ["hello", "name"]}
    }).$inject(container);

    var nodes = nes.all("span", container);
    expect(nodes.length).to.equal(2);
    expect(nodes[0].innerHTML).to.equal("2:hello");
    
    destroy(component, container)

  })
  it("include can pass anything that compiled to Group", function(){
    var Component = Regular.extend({});
    var container = Regular.dom.create('div');
    var Nested = Component.extend({
      name: 'nested',
      template: '<div><div class="head">{#inc hd}</div><div class="body">{#inc this.$body}</div><div class="foot">{#inc ft}</div></div>',
      config: function(data){
        data.head = 'InnerHEAD'
        data.foot = 'InnerFoot'
      }
    })
    var component = new Component({
      template: '<nested hd.cmpl="<p>{head}</p>>" ft={"<p>{foot}</p>"}><strong>{head + foot}</strong></nested>',
      data: {head: 'OuterHead', foot: 'OuterFoot'}
    }).$inject(container);



    var head = nes.one('.head p', container);
    var foot = nes.one('.foot p', container);
    var body = nes.one('.body strong', container);

    expect(head.innerHTML).to.equal('OuterHead');
    expect(foot.innerHTML).to.equal('InnerFoot');
    expect(body.innerHTML).to.equal('OuterHeadOuterFoot');

    component.$update('head', 'OuterUpdate');
    expect(head.innerHTML).to.equal('OuterUpdate');


    destroy(component, container)
  })

 it("group switch twice works as expect", function(){
    var container = Regular.dom.create('div');
    var Nested = Component.extend({
      name: 'nested',
      template: '<div>{head}</div>',
      config: function(data){
        data.head = 'InnerHEAD'
        data.foot = 'InnerFoot'
      }
    })
    var component = new Component({
      template: '<div class="body">{#inc body || this.$refs.nested.$body}</div><nested ref=nested ><strong>InnerBody</strong></nested>',
      data: {head: 'OuterHead'}
    }).$inject(container);

    var body = nes.one('.body strong', container);

    expect(body.innerHTML).to.equal('InnerBody')
    component.$update('body', '<strong>OuterBody</strong>')
    var body = nes.one('.body strong', container);
    component.$update('body', null)
    var body = nes.one('.body strong', container);
    expect(body.innerHTML).to.equal('InnerBody')
  
    destroy(component, container)
 })
 it("extra should pass to Component", function(){
    var container = Regular.dom.create('div');
    var Nested = Component.extend({
      name: 'nested',
      template: '<div>{head}</div>',
      config: function(data){
        data.head = 'InnerHEAD'
        data.foot = 'InnerFoot'
      }
    })

    var component = new Component({
      template: '<div class="body">{#inc this.$refs.nested.$body}</div>{#list [1] as item}<nested ref=nested ><strong>{item}</strong></nested>{/list}'
    }).$inject(container);

    var body = nes.one('.body strong', container);

    expect(body.innerHTML).to.equal('1')
    destroy(component, container)
  
 })
 it("data.body is inner outer $body, if combine with {#inc body || this.$body} should not throw error during digest", function(){
    var container = Regular.dom.create('div');
    var Modal = Regular.extend({
      name: 'modal',
      // if body is exsits , this.$body will be destroied
      template: '<div>{#inc body || this.$body}</div>'
    })

    Modal.body = Regular.extend({
      name: 'modal.body',

      init: function(){
        // this.$outer point to modal
        this.$outer.data['body'] = this.$body;
      }
    })

    var component = new Regular({
      template: '<div class="body"><modal><modal.body><p>{name}</p></modal.body></modal></div>{#list [1] as item}<nested ref=nested ><strong>{item}</strong></nested>{/list}',
      data: {name: 'hzzhenghaibo'}
    }).$inject(container);

    var body = nes.one('.body p', container);

    expect(body.innerHTML).to.equal('hzzhenghaibo')
    destroy(component, container)
  
 })
 // @REMOVE supoort for {#inc component}
 // it("include can pass anything that compiled to Component", function(){
 //    var Component = Regular.extend({});
 //    var container = Regular.dom.create('div');
 //    var Nested = Component.extend({
 //      name: 'nested',
 //      template: '<div class="nested">Nested</div>',
 //      config: function(data){
 //        data.head = 'InnerHEAD'
 //        data.foot = 'InnerFoot'
 //      }
 //    })

 //    var nested = new Nested()
 //    var component = new Component({
 //      template: '<div>{#inc component}</div>',
 //      data: {component: nested }
 //    }).$inject(container);



 //    var nested = nes.one('.nested', container);

 //    expect(nested.innerHTML).to.equal('Nested');

 //    destroy(component, container)
 //  })
})



var expect = require('expect.js');
var Regular = require("../../src/index.js");
var combine = require("../../src/helper/combine.js");
function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}
describe("combine api", function(){

  var  container;
  before(function(){
    container = document.createElement("div");
  })
  after(function(){
    container = null;
  })
  it("combine.inject can be used in group", function( done){
    var component = new Regular({
      data: {name: 'hello'}
    });
    var group = component.$compile("<div>{name}</div>")
    component.$update();
    group.inject(container)
    expect(container.innerHTML.toLowerCase()).to.equal('<div>hello</div>')
    group.destroy(true);
    expect(container.innerHTML).to.equal('')
    done()
  })
  it("combine.inject can be pass false to remove group or component", function(){
    var component = new Regular({
      data: {name: 'hello'}
    });
    var group = component.$compile("<div>{name}</div>")
    component.$update();
    group.inject(container)
    expect(container.innerHTML.toLowerCase()).to.equal('<div>hello</div>')
    group.inject(false)
    expect(container.innerHTML).to.equal('');
    group.destroy(true);
  })
})
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
  it("component.$inject can use twice", function(){
    var component = new Regular({
      template:"{hello}<div>hello</div><p>name</p>"
    }).$inject(container);
    expect(nes.all("p,div",container).length).to.equal(2);

    component.$inject(container2);

    expect(container.innerHTML).to.equal("");
    expect(nes("div", container2).length).to.equal(1);

    destroy(component, container2)
  })

  it("component.$inject works on list when use twice", function(){
    var component = new Regular({
      template:"{#list items as item}<div>hello</div>{/list}",
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
      template:"{#if test}<div>hello</div><p>name</p>{/if}",
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

      template:"{#include template}",

      data: { template: "<div></div>" }

    }).$inject(container);

    component.$inject(container2)
    
    expect(nes.all("div", container).length).to.equal(0);

    expect(nes.all("div", container2).length).to.equal(1);
    destroy(component, container2)
  })

  it("component.$inject will repoint the `parentNode` ", function(){
    var node = document.createElement("div");
    container.appendChild(node);
    var component = new Regular({
      template:"<div>hello</div><p>name</p>"
    }).$inject(node, "after");

    expect(node.nextSibling.innerHTML).to.equal("hello")
    expect(component.parentNode).to.equal(container)

    component.$inject(node, "before");


    expect(node.previousSibling.innerHTML).to.equal("name")
    expect(component.parentNode).to.equal(container)

    component.$inject(node, "bottom");

    expect(node.lastChild.innerHTML).to.equal("name")
    expect(component.parentNode).to.equal(node)

    component.$inject(node, "top");

    expect(node.firstChild.innerHTML).to.equal("hello")
    expect(component.parentNode).to.equal(node)

    component.destroy();

    expect(nes.all("div", container).length).to.equal(1);
    expect(nes.one("div", container)).to.equal(node);
    container.innerHTML = "";

  })
  it("component.$inject(false) remove component from document", function(){

    var component = new Regular({
      template:"<div>hello</div><p>name</p>"
    }).$inject(container);

    expect(container.childNodes.length).to.equal(2);
    expect(container.childNodes[0].innerHTML).to.equal('hello');

    component.$inject(false);
    expect(container.innerHTML).to.equal('');
    destroy(component, container);
  })
  it("directly inject component to false, won't throw Error", function(){

    var component = new Regular({
      template:"<div>hello</div><p>name</p>"
    }).$inject(false);

  })

})

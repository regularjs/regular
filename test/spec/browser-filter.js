
var Regular = require_lib("index.js");
void function(){

var Component = Regular.extend();

Component.filter('lowercase', function(value){
  return value.toLowerCase();
})

function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}

describe("Filter", function(){
  it("fitler should works correctly", function(){
    var container = document.createElement('div')
    var component = new Component({
      template: "<div>{{test|lowercase}}</div>",
      data: {test: "ABcD"}
    }).inject(container);


    expect($("div",container).html()).to.equal('abcd');

  })
  
})

}()

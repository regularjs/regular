var Regular = require_lib("index.js");

void function(){

var Component = Regular.extend();

function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}


describe("Nested Component", function(){

  it("nested component should accepet the ", function(){
    var component = new Regular();

    //lazy bind watcher will not trigger in intialize state 
    component.$watch("name", function(name){
      this.hello = name;
    });

    expect(component.hello).to.equal(undefined);

    component.$update("name", "leeluolee");
    expect(component.hello).to.equal("leeluolee");

    component.destroy();
  })

})


}()

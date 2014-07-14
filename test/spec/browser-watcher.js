var Regular = require_lib("index.js");

void function(){

var Component = Regular.extend();

function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}


describe("Watcher-System", function(){

  it("the digest progress is works correctly on basic usage", function(){
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



  it("$watch should accpect [Expression] param", function(){
    var component = new Regular();
    var nameExpr = Regular.parse("name");

    //lazy bind watcher will not trigger in intialize state 
    component.$watch("name", function(name){
      this.hello = name;
    });

    component.$update("name", "leeluolee");
    expect(component.hello).to.equal("leeluolee");
    component.destroy();
  })

  it("$watch should accpect [Array] param", function(){
    var component = new Regular();
    component.$watch(["name", "age"], function(name, age){
      expect(name + ":" + age).to.equal("leeluolee:10")
    });

    component.$update({
      name: "leeluolee",
      age: 10
    });

    component.destroy();
  })

  it("$update should also accpect [Function] param to act apply", function(){
    var component = new Regular();
    component.$watch(["name", "age"], function(name, age){
      expect(name + ":" + age).to.equal("leeluolee:100")
    });

    component.$update(function(data){
      data.name = "leeluolee";
      data.age = 100;
    });
    component.destroy();
  })


  it("$bind should connect two component", function(){
    var container = document.createElement("div");
    var component = new Component({
      template: "<div class='name'>{{name}}</div><div class='age'>{{age}}</div>",
      data: {
        name: "leeluolee",
        age: 10
      }
    }).inject(container);
    var component2 = new Component({
      template: "<div class='user-name'>{{user.name}}</div><div class='user-age'>{{user.age}}</div>",
      data: {user: {}}
    }).inject(container);

    expect( $('div', container).length ).to.equal(4);
    expect( $('div', container).length ).to.equal(4);

    ["name", "user-name", "age", "user-age"].forEach(function(item){
      expect($("."+item, container).length).to.equal(1)
    })


    component.$bind(component2, "name", "user.name")
    component.$bind(component2, "age", "user.age")

    
    expect(component2.data.user).to.eql({name: "leeluolee", age: 10 });

    component2.$update(function(data){
      data.user = {name: "regularjs", age: 100 };
    })
    expect(component.data.name).to.equal("regularjs");
    expect(component.data.age).to.equal(100);

    component2.destroy();
    component.destroy();
    expect(container.innerHTML).to.equal("");
    

  })


})


}()

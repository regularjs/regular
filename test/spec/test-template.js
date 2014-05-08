var _ = require_lib("util.js");

describe("", function(){
  it("", function(){
    var Parent = klass({
      init: function(){
        console.log('haha');
      }
    });
    var Child = klass({
      init: function(){
        this.parent();
        console.log('child');
      }
    })

  });
})

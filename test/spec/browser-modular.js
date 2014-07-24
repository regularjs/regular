void function(){
  var Regular = require_lib('index.js');

  function reset(){
    Regular._events = {}
    Regular._filters = {}
  }

  describe("test Regular's modular mechanism", function(){



    describe('fitler, directive, event isolation ', function(){
      var Root = Regular;
      var Parent = Regular.extend();
      var Children = Parent.extend();
      function foo(){}
      it('filter should ioslated to Parent', function(){
        Parent.filter('foo', foo);
        expect(Children.filter('foo')).to.equal(foo)
        expect(Root.filter('foo')).to.equal(undefined)
      });
      it('directive should ioslated to Parent', function(){
        Parent.directive('foo', foo);
        expect(Children.directive('foo').link).to.equal(foo)
        expect(Root.directive('foo')).to.equal(undefined)

      });

      it('event should ioslated to Parent', function(){
        Parent.event('foo', foo);
        expect(Children.event('foo')).to.equal(foo)
        expect(Root.event('foo')).to.equal(undefined)
      });

    })


    describe('Component.use', function(){
      reset();
      function foo1(){};
      function foo2(){};
      function foo3(){};
      var Root = Regular;
      var Parent = Regular.extend();
      var Children = Parent.extend();
      function SomePlugin (Component){
        Component.implement({foo1: foo1 })
          .filter('foo2',foo2)
          .event('foo3',foo3)
      }



      it('use should works on Regular', function(){
        function root(){}
        Root.use(function(Component){
          Component.event('root',root)
        })
        expect(Children.event('root')).to.equal(root)
        expect(Parent.event('root')).to.equal(root)
      });

      it('use should works on SubClass', function(){
        reset();
        var parent = new Parent();
        Parent.use(SomePlugin)
        expect(parent.foo1).to.equal(foo1);
        expect(Children.filter('foo2')).to.equal(foo2)
        expect(Root.filter('foo2')).to.equal(undefined)
      });

      it('Regular.plugin can register global plugin', function(){
        reset();
        var Component = Regular.extend();
        function hello(){}
        Regular.plugin('some', function(Component){
          Component.implement({'some':hello})
        });
        Component.use('some');

        var component = new Component;

        expect(component.some).to.equal(hello);
      })
    })

  });


describe("Some buildin plugin", function(){
  var Component = Regular.extend({
    template: "<div>{{this.name}}</div>"
  }).use("timeout");

  it("timeout's $timeout should update when time is out", function(done){
    var container = document.createElement("div");
    var component = new Component().inject(container); 
    component.$timeout(function(){
      this.name = "leeluolee";
      setTimeout(function(){
        expect(component.name).to.equal("leeluolee")
        expect($("div", container).html()).to.equal("leeluolee");
        component.destroy();
        expect(container.innerHTML).to.equal("");
        done();
      },0)

    },0)
  })

  it("timeout's $interval should update after callback is act", function(done){
    var container = document.createElement("div");
    var component = new Component().inject(container); 
    var run = 0;
    var tid = component.$interval(function(){
      this.name = "leeluolee";
      run++;
      setTimeout(function(){
        clearInterval(tid);
        expect(run).to.equal(1);
        expect(component.name).to.equal("leeluolee")
        expect($("div", container).html()).to.equal("leeluolee");
        component.destroy();
        expect(container.innerHTML).to.equal("");
        done();
      },0)

    },100)

  })

})

}();




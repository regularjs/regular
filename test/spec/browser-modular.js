void function(){
  var Regular = require_lib('index.js');

  function reset(){
    Regular._events = {}
    Regular._filters = {}
  }

  describe("The featrue of Regular's modular must works as expected", function(){
    describe('fitler, directive, event"s extend mechanism should isolated ', function(){
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


    describe('Component.use should works as expected', function(){
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
          .directive('foo3',foo3)
      }



      it('use should works on Regular', function(){
        Root.use(SomePlugin)
        expect(Children.directive('foo3').link).to.equal(foo3)
        expect(Parent.directive('foo3').link).to.equal(foo3)
      });

      it('use should works on SubClass', function(){
        reset();
        Parent.use(SomePlugin)
        expect(Children.filter('foo2')).to.equal(foo2)
        expect(Root.filter('foo2')).to.equal(undefined)
      });

      it('Regular.module can register global plugin')


    })
  });
}()



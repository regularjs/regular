var expect = require('expect.js');

var Regular = require("../../lib/index.js");
var BaseComponent = Regular.extend();


describe("Modifier", function(){
  
  describe("Modifier Basic", function(){

    function createStore(){
      return {
        name: 'leeluolee'
      }
    }

    var Component = BaseComponent.extend({
      template: '{#inc this.$body}',
      config: function(){
        this.store = createStore();
      },
      modifyBodyComponent: function( component ){
        component.s = this.store;
      }
    });


    BaseComponent.component({
      injector: Component,
      component1: BaseComponent
    })
    it("modifier should work", function( ){


        var component = new BaseComponent({
          template: '<injector><component1 ref=c1  /><component1 ref=c2 /></injector>' 
        })


        expect(component.$refs.c1.s.name).to.equal('leeluolee');
        expect(component.$refs.c1.s).to.equal(component.$refs.c2.s);

    })
    it("nested modifier should work", function( ){

        var NestedComponent = Regular.extend({
          name: 'modifier-nested',
          template: '<hello ref=hello></hello>'
        })

        NestedComponent.component('hello', Regular.extend({
        }))


        var component = new BaseComponent({
          template: '<injector><modifier-nested ref=c1  /><component1 ref=c2 /></injector>' 
        })

        expect(component.$refs.c1.$refs.hello.s.name).to.equal('leeluolee');

    })
    it("nested modifier should work", function( ){

        var NestedComponent = Regular.extend({
          name: 'modifier-nested2',
          template: '<hello ref=hello><name/></hello>'
        })

        var instance;
        NestedComponent.component('hello', Regular.extend({ 
          template: '{#inc this.$body}'
        }))
        NestedComponent.component('name', Regular.extend({ 
          init: function(){
            instance = this;
            expect(this.s.name).to.equal('leeluolee')
          }
        }))



        var component = new BaseComponent({
          template: '<injector><modifier-nested2 ref=c1  /><component1 ref=c2 /></injector>' 
        })

        expect(instance).to.not.equal(undefined);

    })
    it("modifier in #list", function(){
        BaseComponent.component('list1', Regular.extend({
          template: '<h2>{index}:{this.s.name}</h2>'
        }))
        var component = new BaseComponent({
          data: {
            list:[1,2,3]
          },
          template: '<div ref=c>{#list list as item}<injector><list1  index={item_index} /></injector><h3>{item_index}:{this.s.name}</h3>{/list}</div>' 
        })
        var heads2 = nes.all( 'h2', component.$refs.c);
        var heads3 = nes.all( 'h3', component.$refs.c);
        expect( heads2.length ).to.equal(3);
        expect( heads3.length ).to.equal(3);
        expect(heads2[0].innerHTML).to.equal('0:leeluolee');
        expect(heads3[0].innerHTML).to.equal('0:');
        expect(heads2[1].innerHTML).to.equal('1:leeluolee');

    })
    it("modifier in #if", function(){
        BaseComponent.component('if', Regular.extend({
          template: '<h2>{this.s.name}</h2>'
        }))
        var component = new BaseComponent({
          data: {
            show: false
          },
          template: '<div ref=c><injector>{#if show}<if ref=if />{/if}</injector></div>' 
        })
        var h2 = nes.one( 'h2', component.$refs.c);
        expect(!h2).to.equal(true);
        component.$update('show', true)
        h2 = nes.one( 'h2', component.$refs.c);
        expect(h2.innerHTML).to.equal('leeluolee')

    })
    it("nested modifier should work", function( ){

        var Component2 = BaseComponent.extend({
          template: '<div ref=container >{#inc this.$body}</div>',
          modifyBodyComponent: function( component, nextModify ){
            nextModify( component );
            expect(component.s.name).to.equal('leeluolee');
            component.say = function(){ return 'say'}
          }
        });
        BaseComponent.component({
          injector2: Component2
        })

        var component = new BaseComponent({
          template: '<injector><injector2 ref=c1  ><component1 ref=c2 /></injector2></injector>' 
        })

        expect(component.$refs.c1.s.name).to.equal('leeluolee');
        expect(component.$refs.c2.s.name).to.equal('leeluolee');
        expect(component.$refs.c2.say()).to.equal('say');




    })
  }) 
})


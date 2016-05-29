var expect = require('expect.js');
var SSR = require('../../src/render/server');
var Regular = require('../../src/index');




var clean = function(str){

}



describe("Server Side Rendering", function(){

  it("Server side with computed", function(){
    var Component = Regular.extend({
      computed: {
        computed: function(){
          return 'hello' 
        }
      },
      template: "<div>{computed}</div>"
    })

    expect(SSR.render(Component, {
      data: {
        computed: 'hehe'
      }
    })).to.equal('<div>hello</div>')
  })

  it('directive with nps should work on SSR', function(){
    var Namespace = Regular.extend({

    })
    Namespace.directive({
      'r-ssr': {
        nps: true
      }
    })
  })


  it('if statement in tag', function(){

    var Comp = Regular.extend({
      template: '<div {#if test} div=1 {/if}></div>'
    })


    expect(SSR.render(Comp, {
      data: {
        test:true
      }
    })).to.eql('<div div="1"></div>')
  })


  it('r-html should work as expect', function(){
    var Comp = Regular.extend({
      template: '<div title="haha" r-html={html}></div>'
    })
    expect(SSR.render(Comp, {
      data: {
        html: "<p>html</p>"
      }
    })).to.equal('<div title="haha"><p>html</p></div>')
  })

})
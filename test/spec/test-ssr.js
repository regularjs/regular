var expect = require('expect.js');
var SSR = require('../../lib/render/server');
var Regular = require('../../lib/index');




var clean = function(str){

}



describe("Server Side Rendering", function(){

  it("template with null won't throw error", function(){

    var Component = Regular.extend({ })
    expect(SSR.render(Component, {
      data: {
        computed: 'hehe'
      }
    })).to.equal('')

  })

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
      template: '<div r-ssr="1{gmail@163}2"></div>'
    })
    Namespace.directive({
      'r-ssr': {
        nps: true,
        ssr: function(value, tag){
          return "title=\""+ Regular.util.escape(value) + "\"";
        }
      }
    })
    expect(SSR.render(Namespace, {
      data: {
        test:true
      }
    })).to.eql('<div title="1{gmail@163}2"></div>')
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

  it("string inteplation should work at server", function(){
    var Comp = Regular.extend({
      template: '<div title="haha {hehe}" ></div>'
    })
    expect(SSR.render(Comp, {
      data: {
        hehe: "heihei"

      }
    })).to.equal('<div title="haha heihei"></div>')
  })

})
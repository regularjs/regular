var expect = require('expect.js');
var SSR = require('../../lib/server');
var Regular = require('../../lib/index');




var clean = function(str){

}



describe("Server Side Rendering", function(){

  var Namespace = Regular.extend();

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

  it('"{expr}inteplation"  in compoennt', function(){

    var Comp = Regular.extend({
      template: '<ssr-expr name="{id}1" />'
    })
    Regular.extend({
      name: 'ssr-expr',
      template: '<div>{name}</div>'
    })


    expect(SSR.render(Comp, {
      data: {
        id: 1
      }
    })).to.eql('<div>11</div>')

    delete Regular._components['ssr-expr'];

  })

  it('"{expr}inteplation"  in attribute', function(){

    var Comp = Regular.extend({
      template: '<div name="{id}1"></div>'
    })


    expect(SSR.render(Comp, {
      data: {
        id: 1
      }
    })).to.eql('<div name="11"></div>')

    delete Regular._components['ssr-expr'];

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
  it('r-hide with ssr', function(){
    var Comp = Regular.extend({
      template: '<div  r-hide={html}></div>'
    })
    expect(SSR.render(Comp, {
      data: {
        html: "<p>html</p>"
      }
    })).to.equal('<div style="display:none"></div>')
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

  it('safeStringify should work as expected' , function(){
    var safeString = SSR.safeStringify({
      html: '<script></script><!--gdasdada'
    })
    expect(safeString).to.equal('{"html":"<script><\\/script><\\!--gdasdada"}');
  })


  it('modifyBodyComponent should wont accept ssr', function(){

    var Comp = Namespace.extend({
      template: "{#inc this.$body}",
      modifyBodyComponent: function(component){
        
        component.data.name = 'zhenghaibo'

      }
    })
    var Nested = Namespace.extend({
      template: "<div>{name}</div>"
    })

    Namespace.component({
      provider: Comp,
      nested: Nested
    })

    expect( SSR.render(Namespace.extend({
      template: '<provider><nested name={name}/></provider>'
    }), {data: {name: 'leeluolee'}}) ).to.equal('<div>leeluolee</div>')

  })
  it('Boolean attribute should wont accept ssr', function(){

    var Comp = Namespace.extend({
      template: "<input checked={checked} />"
    })
    var text = SSR.render(Comp, {
      data: {
        checked: false
      }
    });

    expect(text).to.equal('<input></input>')


  })

})
var expect = require('expect.js');

var Regular = require("../../src/index.js");
var dom = Regular.dom;

function destroy(component, container){
  component.destroy();
  expect(container.innerHTML).to.equal('');
}

var  Component = Regular.extend();
var svgns = "http://www.w3.org/2000/svg";


var container = document.createElement("div");   
  describe("svg namespace", function(){
    // need include
    // 1. list
    // 2. if
    // 3. include
    // 4. new Component
    // 5. new Component 's body compile
    // 6. new Sectionj.
    it("bugfix #10, if svg namespace ", function(){
      //https://github.com/regularjs/regular/issues/10

      if(Regular.env.svg){ // if support svg

        var Bugfix10 = Component.extend({
          template: 
            '<div></div>\
             <svg viewBox="0 0 100 100">\
             <line y1="100" y2="100" stroke="#fff"/>\
             {#if test==1}\
               <line y1="10" y2="90" stroke="#0f0"/>\
             {#elseif test==2}\
               <line y1="20" y2="90" stroke="#f00"/>\
             {#else}\
               <line y1="30" y2="90" stroke="#f00"/>\
             {/if}\
            </svg>'
        })
        var component = new Bugfix10({
          data: {test: 1}
        }).$inject(container);

        expect(nes.one("svg", container).namespaceURI).to.equal(svgns);

        var lines = nes.all("svg line", container);

        expect(lines.length).to.equal(2);

        expect(lines[0].namespaceURI).to.equal(svgns)
        expect(lines[1].namespaceURI).to.equal(svgns)
        expect(lines[1].getAttribute("y1")).to.equal("10");

        component.data.test = 2;
        component.$update();

        var lines = nes.all("svg line", container);

        expect(lines.length).to.equal(2);

        expect(lines[1].getAttribute("y1")).to.equal("20");
        expect(lines[1].namespaceURI).to.equal(svgns)


        component.data.test = 3;
        component.$update();

        var lines = nes.all("svg line", container);

        expect(lines.length).to.equal(2);

        expect(lines[1].getAttribute("y1")).to.equal("30");
        expect(lines[1].namespaceURI).to.equal(svgns)

        destroy(component, container)
      }
    })
    it("bugfix #10, list svg namespace should correct", function(){
      //https://github.com/regularjs/regular/issues/10


      if(Regular.env.svg){ // if support svg

        var Bugfix10 = Component.extend({
          template: 
            '<div></div>\
             <svg viewBox="0 0 100 100">\
             <line y1="100" y2="100" stroke="#fff"/>\
             {#list list as item}\
               <line y1="{item_index}" y2="90" stroke="#0f0"/>\
             {/list}\
            </svg>'
        })
        var component = new Bugfix10({
          data: {
            list: [1]
          }
        }).$inject(container);

        expect(nes.one("svg", container).namespaceURI).to.equal(svgns);

        var lines = nes.all("svg line", container);

        expect(lines.length).to.equal(2);

        expect(lines[0].namespaceURI).to.equal(svgns)
        expect(lines[1].namespaceURI).to.equal(svgns)

        component.data.list = [1,2]
        component.$update();

        var lines = nes.all("svg line", container);

        expect(lines.length).to.equal(3);

        expect(lines[1].getAttribute("y1")).to.equal("0");
        expect(lines[2].getAttribute("y1")).to.equal("1");
        expect(lines[1].namespaceURI).to.equal(svgns)

        destroy(component, container)
      }
    })
    it("bugfix #10, include: svg namespace should correct", function(){
      //https://github.com/regularjs/regular/issues/10


      if(Regular.env.svg){ // if support svg

        var Bugfix10 = Component.extend({
          template: 
            '<div></div>\
             <svg viewBox="0 0 100 100">\
             <line y1="100" y2="100" stroke="#fff"/>\
             {#include template}\
            </svg>'
        })
        var component = new Bugfix10({
          data: {
            template: '<line y1="10" y2="100" stroke="#fff"/>'
          }
        }).$inject(container);

        expect(nes.one("svg", container).namespaceURI).to.equal(svgns);

        var lines = nes.all("svg line", container);

        expect(lines.length).to.equal(2);

        expect(lines[0].namespaceURI).to.equal(svgns)
        expect(lines[1].namespaceURI).to.equal(svgns)

        component.data.template = '<line y1="20" y2="100" stroke="#fff"/>';
        component.$update();

        var lines = nes.all("svg line", container);

        expect(lines.length).to.equal(2);

        expect(lines[1].getAttribute("y1")).to.equal("20");
        expect(lines[1].namespaceURI).to.equal(svgns)

        destroy(component, container)
      }
    })

  })
describe("bugbush for paopao.163.com", function(){
  it("void array literal should works", function(){
    expect(function(){
      var component = new Component({
        template: "{#if []}{hello.name.first}{/if}",
        data: {hello: {name: { first: "haha"} } }
      })
    }).to.not.throwException();

  })
  it("number in element nearto { should not throwException", function(){

    expect(function(){
      var component = new Component({
        template: "<div {#if true}x = 1{/if}>1</div>",
        data: {}
      })
    }).to.not.throwException();
  })

  it("customer event should also trigger the digest", function(){
    Component.event("drag", function(element, fire){
      Regular.dom.on(element, "click", function(){
        fire({hello:1})
      })
    })

    var component = new Component({
      template: "{#list 1..1 as i}<div ref=first on-drag={name=2}>{name}</div>{/list}"
    }).$inject(container);

    dispatchMockEvent(component.$refs.first, 'click');
    expect(component.$refs.first.innerHTML).to.equal("2");
    destroy(component,container);
    
  })

})

describe("Bugfix", function(){
  it("bugfix #4", function(){

    var Demo = Component.extend({name: "demo", template: "<input r-model = 'demo.name' title={demo.name}>"})
    var DemoApp = Component.extend({template: "{#list demos as demo}<demo demo={demo}/>{demos.length}{/list}"});
    var component = new DemoApp({ 
      data: { demos: [{name:1}] }
    }).$inject(container);
    expect(nes.one("input", container).value).to.equal("1");
    destroy(component, container)
  })
  it("bugfix #6, svg namespace ", function(){
    //https://github.com/regularjs/regular/issues/6

    if(Regular.env.svg){ // if support svg
      var Bugfix6 = Component.extend({
        template: 
          '<div></div>\
           <svg><circle on-click={width+=2} on-click={circle+=2} cx="{width}" cy="{height}" r="{circle}" fill="#fefefe" stroke="#333" stroke-width="4" ></circle></svg>'
      })
      var component = new Bugfix6({ 
        data: { 
          circle: 6,
          width: 2,
          height: 4
        }
      }).$inject(container);

      expect(nes.one("svg", container).namespaceURI).to.equal("http://www.w3.org/2000/svg");

      var circle = nes.one("svg circle", container);

      expect( circle.namespaceURI ).to.equal("http://www.w3.org/2000/svg" );

      expect(circle.getAttribute("cx")).to.equal('2');
      expect(circle.getAttribute("cy")).to.equal('4');

      dispatchMockEvent(circle, 'click'); // dispatch mock event

      expect(circle.getAttribute("r")).to.equal('8');
      expect(circle.getAttribute("cx")).to.equal('4');

      destroy(component, container)
    }
  })

it("should destroy clear when have non parentNode", function(){
  var list = "{#list 1..3 as num}{num}{/list}"
  var component = new Regular({
    template: list
  }).$inject(container);
  expect(container.innerHTML.slice(-3)).to.equal("123")
  destroy(component, container);
})
  it("bugfix #12, item in list destroy all $context's event", function(){
    var list =
      "{#list todos as todo}" + 
        "<div class='a-{todo_index}'>{todo.content}</div>" + 
      "{/list}";

    var num =0;
    var component = new Regular({
      data: {todos: [{content: "hello"}, {content: "hello2"}]},
      template: list,
      events: {
        "haha": function(){
          num++
        }
      }
    }).$inject(container);

    component.$emit("haha", 111);

    component.data.todos[0] = {content: "haha"}
    expect(num).to.equal(1);

    component.$update();

    component.$emit("haha", 111);
    expect(num).to.equal(2);

    component.$emit("haha", 111);
    expect(num).to.equal(3);



    destroy(component, container);
  })    

  it("bugfix #13, subComponentUpdate force outerComponent $update when initialize", function(){
    // we need force __checkOnece enter digest phase
    var Modal = Regular.extend({
      template: '{#include this.content}'
    });

    var Input = Regular.extend({
      template: "<input type='email' class='form-control'>",
      init: function(){
        this.$update(); // @bug!! will forece outer Component to update
      }
    })

    // 直接调用
    var Modal2 = Modal.extend({
      content:  '<input2 type="text" />'
    }).component("input2", Input)


    var component = new Modal2().$inject(container);

    expect(nes.all('input' ,container).length).to.equal(1)



    destroy(component, container);
  })
  it("bugfix #11, 换行导致模板无法解析", function(){
var template = '<input type="text"  class="form-control" \
  id="username" name="username" value="">';

    var Component = Regular.extend({
      template: template
    });

    var component = new Component().$inject(container);

    expect(nes.all('input' ,container).length).to.equal(1)

    destroy(component, container);
  })
  it("bugfix #14, html entity isn't converted", function(){


    // 'lt':60, 
    // 'gt':62, 
    // 'nbsp':160, 
    // 'iexcl':161, 
    // 'cent':162, 

    var template =  "<p>&cent;</p><p>{text}</p>"
    var Component = Regular.extend({
      template: template
    });


    var component = new Component().$inject(container);

    var ps = nes.all('p' ,container);


    expect(dom.text(ps[0])).to.equal(String.fromCharCode(162));

    component.$update('text', "&lt;");

    expect(dom.text(ps[1])).to.equal("&lt;");

    destroy(component, container);
  })


  it('bugfix #39', function(){
    // https://github.com/regularjs/regular/issues/39

    var template = 
            '<div>\n\
              <!-- 注释 -->\n\
              1. <input type="text">\n\
              2. <input type="text">\n\
              3. <input type="text">\n\
            </div>';

    expect(function(){
      Regular.parse(template);
    }).to.not.throwException()

  })

  it('bugfix #43', function(){

    // 必须加入 if 来触发single check
    var container = dom.create('div');
    var Outer = Regular.extend({
      template: '<a ref=a on-click={this.add()}></a>{#list list as i} {#if i} <inner-43 name={i.name} ></inner-43> {#else} <inner-43 name={i.name} ></inner-43> {/if} {/list}',
      config:function(data){
        data.list = data.list || [];
      },
      add: function(){
        this.data.list.push({name: 1});
      }
    })

    var Inner = Regular.extend({
      name: 'inner-43',
      template: "<div>{name}</div>",
      config: function(){
        this.$update();
      }
    })

    var outer = new Outer({
      data: {
        list: [{name:1}]
      }
    }).$inject(container);

    dispatchMockEvent(outer.$refs.a, 'click')


    // @TODO: 

  })
  it('bugfix : #list null->undefined', function(){

    // 必须加入 if 来触发single check
    var Outer = Regular.extend({
      template: '<div ref=div>{#list list as item}<div>{item}</div>{/list}</div>',
      config:function(data){
        data.list = null;
      }
    })


    var outer = new Outer({}).$inject(container);

    outer.$update('list', null);
    outer.$update('list', undefined);

    expect(nes.all('div', outer.$refs.div).length).to.equal(0)

    outer.destroy();

  })
  it('bugfix : #list [1]->null', function(){

    // 必须加入 if 来触发single check
    var Outer = Regular.extend({
      template: '<div ref=div>{#list list as item}<div>{item}</div>{/list}</div>',
      config:function(data){
        data.list = null;
      }
    })


    var outer = new Outer({}).$inject(container);

    outer.$update('list', [1]);
    expect(nes.all('div', outer.$refs.div).length).to.equal(1)
    outer.$update('list', undefined);

    expect(nes.all('div', outer.$refs.div).length).to.equal(0)

    outer.destroy();

  })


})

describe("Milestones v0.4.*", function(){
  it("#53 nested component with delegate-event and [postion:after or before ] bug", function( done ){
    var after = document.createElement('div');
    after.setAttribute('id',1)
    container.appendChild(after);
    var dom =Regular.dom;
    var i =0;
    var Nested = Regular.extend({
      name: 'transclude',
      template: "{#inc this.$body}"
    })
    var Nested2 = Regular.extend({
      name: "nest2",
      template: "<div><a id='a' de-click={this.hello()} ></a></div>",
      hello: function(){
        i++
      }
    })
    var component = new Component({
      template: "{#list this.list as i } <transclude> <nest2 isolate ></nest2> </transclude> {/list}",
      list: ['1']
    }).$inject( after, 'before' );

    document.body.appendChild(container);
      

    dispatchMockEvent(dom.element(component).firstChild, 'click');
    dom.remove(after);
    expect(i).to.equal(1);
    destroy( component, container );
    document.body.removeChild(container);
    done()



  })

  it("r-hide={true} should not throwException", function(){

    expect(function(){
      var component = new Regular({
        template: "<div r-hide={true} ></div>"
      })
    }).to.not.throwException();
  })

it('bugfix #50', function(){
  // https://github.com/regularjs/regular/issues/50
  var template =  "<p>&#x02A9D;</p><p>&#10909;</p><p>{text}</p>"
  var Component = Regular.extend({
    template: template
  });


  var component = new Component().$inject(container);

  var ps = nes.all('p' ,container);


  expect(dom.text(ps[0])).to.equal(String.fromCharCode(10909));
  expect(dom.text(ps[1])).to.equal(String.fromCharCode(10909));

  destroy(component, container)


})


  it('bugfix #67', function(){
    // https://github.com/regularjs/regular/issues/50
    var template =  "{#include a}";

    expect(function(){
      var component = new Regular({
        data: {
          a: 1,
          b: true,
          c: undefined,
          d: null,
          e: '123'
        },
        template: "{#inc a}{#inc b}{#inc c}{#inc d}{#inc e}"
      })
    }).to.not.throwException();

    

    var ps = nes.all('p' ,container);

  })

  it('bugfix #68, isolate with transclude content', function(){

      var XSelect = Regular.extend({
        name: 'xselect',
        template: '<div>{#inc this.$body }</div>'
      })


      var component = new Regular({
        data: { name: 'leeluolee' },
        template: '<xselect isolate ><div ref=a>{name}</div></xselect>'
      })

      expect(component.$refs.a.innerHTML).to.equal('leeluolee');
      component.destroy();

  })


  it("bugfix #72, support pass null and undefined literal in template", function(){
    var Checked = Regular.extend({
      name: 'checked',
      template: "{checked}"
    }) 

    expect(function(){
      new Regular({
        template: "<checked toggled='' checked={null} /> <checked checked={undefined}/ >"
      })
    }).to.not.throwException();

  })

  it("bugfix #74, r-class should support svg", function(){


    if(!Regular.env.svg) return;

    var SVG = Regular.extend({
      name: 'checked',
      template:'<svg> <line ref=line id="base" r-class={{"toggle": toggle, "active": active}}/> </svg>'
    }) 
    var line = new SVG({
      data: {
        toggle: true
      }
    })

    expect(line.$refs.line.getAttribute('class')).to.equal('toggle')

    line.data.toggle = false;
    line.data.active = true;
    line.$update()

    expect(line.$refs.line.getAttribute('class')).to.equal('active')

  })

  it('feature #82', function(){
    var i = 0;
    var mixins =  {
      events: {
        $afterConfig: function(){
          i++;
          expect(i).to.equal(3)
        },
        $config: function(){
          i++;
          expect(i).to.equal(1)
        },
        $init: function(){
          i++;
          expect(i).to.equal(4)

        },
        $afterInit: function(){
          i++;
          expect(i).to.equal(6)
        }
      }
    }

    var Component = Regular.extend({
      config: function(){
          i++;
          expect(i).to.equal(2)
      },
      init: function(){
          i++;
          expect(i).to.equal(5)
      }
    }).implement(mixins)

    new Component();

    expect(i).to.equal(6);
  })

  it('bug #78', function(){
    var Nest = Regular.extend({
      name: 'bug-78',
      config: function(data){
        data.hello = 100
      },
      template: '{hello}'
    })
    var comp = new Regular({
      data: { hello: 200 },
      template: '<bug-78 ref=nest hello={hello}>{hello}</bug-78>'
    })

    expect(comp.data.hello).to.equal(100);
    expect(comp.$refs.nest.data.hello).to.equal(100);

  })

  // it("bug #96", function(){
  //   var Nest = Regular.extend({
  //     name: 'bug-96'
  //   })
  //   var component = new Regular({
  //     template: '<div class="list-row-sub">{#list params  as item}\
  //             <bug-96 field="defaultValue" source={item} ></bug-96>\
  //      {/list}</div>',
  //      data: {
  //       params: [{}]
  //      }
  //   })

  //   expect(component.data.item).to.equal(undefined);
  // })
  it("bug #93", function(){

    var Nest = Regular.extend({
      name: 'bug-96'
    })
    var component = new Regular({
      template: '<div>{"{\'event\': \'delete-progroup\', \'id\': "+name+"}"}</div>',
      data: {
        name: '1' 
      }
    })

  })

  it("bug #112", function(){
    var Nest = Regular.extend({
      name: 'bug-112'
    })
    var component = new Regular({
      template: '<div ref=cnt>{#if zipMode}<span on-click={this.changeZipMode()} class="u-icn u-icn-{zipMode.mode}"></span> {/if}</div>',
      data: {
        zipMode: {
          mode: 'hello'
        }
      }
    })

    expect( nes.one('span',component.$refs.cnt).className).to.equal('u-icn u-icn-hello');
    component.$update('zipMode', null)
    expect( nes.all('span',component.$refs.cnt).length ).to.equal(0);

  })


  it("bug #122", function(){
    var Sub = Regular.extend({
      name: 'Sub',
      template: '<div>disabled is {disabled}</div>'
    });

    var obj = {};
    var Top = Regular.extend({
      template: '<Sub ref=sub disabled={myName|isJerry} complex = {(myName|other).a}></Sub>',
      config: function(){
        this.data = {
          myName: 'Tom'
        };
      }
    }).filter({
      'isJerry': function(_name){
        return _name == 'Jerry';
      },
      'other': function(){
        return obj
      }
    });

    var component;
    expect(function(){
      component = new Top();
    }).to.not.throwException();

    expect(component.$refs.sub.data.disabled ).to.equal(false)
    component.$refs.sub.$update('disabled', true)
    expect(component.data.myName).to.equal('Tom')

    component.$refs.sub.$update('complex', 'hello')
    expect(obj.a).to.equal('hello')


    
  })

  // it("bug #122: paren Expression shouldn't change the set property it wrapped", function(){
  //   var Sub = Regular.extend({
  //     name: 'Sub',
  //     template: '<div>disabled is {disabled}</div>'
  //   });

  //   var Top = Regular.extend({
  //     template: '<Sub ref=sub disabled={num|towWay} actived={(num2|oneWay)} ></Sub>',
  //     config: function(data){
  //       data.num = 1;
  //       data.num2 = 2;
  //     }
  //   }).filter({
  //     towWay: {
  //       get: function( val ){
  //         return '' + val;
  //       },
  //       set: function( val ){
  //         return parseInt(val, 10);
  //       }
  //     },
  //     oneWay: function(val){
  //       return '' + val;
  //     }
  //   });

  //   var compo = new Top();
  //   expect(compo.data.num).to.equal(1);
  //   expect(compo.data.num2).to.equal(2);
  //   expect(compo.$refs.sub.data.disabled).to.equal('1');
  //   expect(compo.$refs.sub.data.actived).to.equal('2');

  //   compo.$refs.sub.$update('disabled', '3');
  //   expect(compo.data.num).to.equal(3);

  //   compo.$refs.sub.$update('actived', '3');
  //   expect(compo.data.num2).to.equal(2);

  // })
  // it('bug :directive return value that not function will throw error', function(){
  //   throw Error()
  // })
})





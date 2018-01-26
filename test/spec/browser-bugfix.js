var expect = require('expect.js');

var Regular = require("../../lib/index.js");
var dom = Regular.dom;
var SSR = require("../../lib/render/server.js");

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
  it('bugfix #166',function () {
      expect(function(){
          var component = Regular.extend({
              watch:function () {

              }
          })
      }).to.not.throwException();
  })
  it('bugfix #170',function () {
        expect(function(){
            var Nest = Regular.extend({
                name:"test",
                template:"<p>h3中的内容:{test}</p><h3 ref=test>regular测试demo</h3>",
                computed:{
                    test:function () {
                        //console.log(this.$refs);
                        if(this.$refs.test){
                            return this.$refs.test.innerHTML;
                        }
                        return "";
                    }
                },
                startAjaxRequire:function () {
                    setTimeout(function() {
                        //模拟ajax的回调，并调用更新
                        //这种操作感觉还是比较常见
                        this.$update();
                    }.bind(this),200);
                }
            });
            var test=new Nest();
            test.startAjaxRequire();
            //在ajax回调前组件被销毁
            test.destroy();
        }).to.not.throwException();
    })

})


describe("Milestones v0.6.*", function(){
  describe("{~ body parse}", function(){
    var Component = Regular.extend({});
    it("{~ <div>{name}</div> }", function( ){
      var A = Regular.extend({
        template: '{#inc title}',
        config:function(data){
          data.name='A'
        }
      })

      Component.component('A', A);

      var b = new Component({
        data: {
          name: 'B'
        },
        template: '<A ref=a title={~ <div>{name}</div>} ></A>'
      })

      var div = Regular.dom.element(b)
      expect(div.innerHTML).to.equal('B');

    })
    it("{~ <div class='name'>{name}</div><A title={~<div class='age'>{age}</div>}></A> }", function( ){
      var A = Regular.extend({
        template: '{#inc title}',
        config:function(data){
          data.name='A'
          data.age=12
        }
      })

      Component.component('A', A);

      var b = new Component({
        data: {
          name: 'B',
          age: 11
        },
        template: '<div ref=container><A ref=a title={~ <div class="name">{name}</div><A title={~<div class="age">{age}</div>}></A> } ></A></div>'
      })

      expect(nes.one('.name', b.$refs.container).innerHTML).to.equal('B')
      expect(nes.one('.age', b.$refs.container).innerHTML).to.equal('11')


    })
  })
  describe("SSR", function(){

    if(!Object.create) return;

    it('nested component startWith str', function(){
      var container = document.createElement('div');
      var Price = Regular.extend({
        name: 'price',
        template: "¥<i class='num'>{price}</i>"
      })
      var Component = Regular.extend({
        template: "<p class='price'> <price  price={price} /></p>"
      });


      container.innerHTML = SSR.render(Component, {
        data: {
          price: 1
        }
      });

      var component = new Component({
        mountNode: container,
        data: {
          price: 1
        }
      })

      expect(nes.one('.num', container).innerHTML).to.equal('1');

      component.$update('price', 2)

      expect(nes.one('.num', container).innerHTML).to.equal('2');
    })
    it(' content in tag with r-html and ssr', function(){

      var container = document.createElement('div');
      var Component = Regular.extend({
        template: "<p class='price' r-html={content}>lalala</p>"
      });

      container.innerHTML = SSR.render(Component, {
        data: {
          content: 'abcd'
        }
      });

      var component = new Component({
        mountNode: container,
        data: {
          content: 'abcd'
        }
      })
      expect(nes.one('p', container).innerHTML).to.equal('abcd')


    })
    it('#if blank with ssr', function(){

      var container = document.createElement('div');
      var Component = Regular.extend({
        template: "{#if test}<p class='price'>lalala</p>{/if}<p class='price'>{#if test}<span>hahaha</span>{/if}</p>"
      });

      container.innerHTML = SSR.render(Component, {
        data: {
          test: false
        }
      });

      var component = new Component({
        mountNode: container,
        data: {
          test: false
        }
      })

      expect( nes.all('p', container).length ).to.equal(1)

      component.$update('test', true);
      expect( nes.all('p', container).length ).to.equal(2)
      expect( nes.one('p span', container).innerHTML ).to.equal('hahaha');

    })
    it('#list blank with ssr ', function(){

      var container = document.createElement('div');
      var Component = Regular.extend({
        template: "{#list list as item}<p class='price'>{item}</p>{/list}"
      });

      container.innerHTML = SSR.render(Component, {
        data: {
          list: []
        }
      });

      var component = new Component({
        mountNode: container,
        data: {
          list: []
        }
      })

      expect( nes.all('p', container).length ).to.equal(0)

      component.$update('list', [1,2,3,4]);

      expect( nes.all('p', container).length ).to.equal(4)
      expect( nes.all('p', container)[3].innerHTML ).to.equal('4')

    })
//    it('r-sytle r-class with ssr', function(){//

//      var container = document.createElement('div');
//      var Component = Regular.extend({
//        template: "<p r-style={{'left': '10px'}} >lalala</p>"
//      });//

//      container.innerHTML = SSR.render(Component, {
//        data: {
//          test: false
//        }
//      });//

//      var component = new Component({
//        mountNode: container,
//        data: {
//          list: []
//        }
//      })//
//

//      expect()//
//

//    })
    it(' blank test str', function(){
      var container = document.createElement('div');
      var tpl = "<h2>\n <span class='num'>{price}</span></h2>";
      var tpl2 = '<div>\n\
        {#list resources as res}\
          <price2 price = {res.price} />\
        {/list}\n\
        </div>';
      var Price = Regular.extend({
        name: 'price2',
        template: tpl
      })
      var Component = Regular.extend({
        template: tpl2
      });


      container.innerHTML = SSR.render(Component.extend({template: tpl2}), {
        data: {
          resources: [{ price: 1}, {price: 2}]
        }
      });

      // 由于前后端同时touch发生了冲突
      Regular.extend({
        name: 'price2',
        template: tpl
      })

      var component = new Component({
        mountNode: container,
        data: {
          resources: [{ price: 1}, {price: 2}]
        }
      })

      expect(nes.one('.num', container).innerHTML).to.equal('1');

      component.data.resources[0].price = 2;
      component.$update();


      expect(nes.one('.num', container).innerHTML).to.equal('2');
    })

  })




 it("bugfix-161: r-component  update ref ", function(){

    var NameSpace = Regular.extend();
    var container = document.createElement("div");
    var Component1 = NameSpace.extend({
      name: "c1",
      template: "<p ref=p>c1</p>"
    })
    var Component2 = NameSpace.extend({
      name: "c2",
      template: "<p ref=p>c2</p>"
    })

    var component = new NameSpace({

      data: {
        modules: [1,2],
        compName: 'c1'
      },

      template: 
        '{#list modules as module}\
            <r-component is={compName} ref="module-{module_index}"/>\
        {/list}'
    }).$inject(container);

    expect(component.$refs['module-0'].$refs.p.innerHTML).to.equal('c1');
    expect(component.$refs['module-1'].$refs.p.innerHTML).to.equal('c1');

    component.$update('compName', 'c2')
    
    expect(component.$refs['module-0'].$refs.p.innerHTML).to.equal('c2');
    expect(component.$refs['module-1'].$refs.p.innerHTML).to.equal('c2');
  })

  it("bug #175 r-class for raw object should not throwException", function(){
    expect(function(){
      new Regular({
        template: "<div r-class={{ 'foo': true }}></div>"
      })
    }).to.not.throwException();
  })

  it("bug #175 r-class for raw object, combined with raw class attribute", function(){
    var container = document.createElement('div');
    
    var template = "<div ref=test class='rawClass' r-class={ {'z-show': true, 'z-active': false} }>Please Login</div>" 
    var component = new Regular({
      template: template
    }).$inject(container);

    expect(component.$refs.test.className).to.equal('rawClass z-show');
    component.$update();
    expect(component.$refs.test.className).to.equal('rawClass z-show');

    component.destroy();
  })

  it("bug #175 r-class for raw object, combined with class attribute interpolation", function(){
    var container = document.createElement('div');
    
    var template = "<div ref=test class={ foo } r-class={ {'z-show': true, 'z-active': false} }>Please Login</div>" 
    var component = new Regular({
      template: template
    }).$inject(container);

    expect(component.$refs.test.className).to.equal('z-show');
    component.$update( 'foo', 'hello' );
    expect(component.$refs.test.className).to.equal('hello');

    component.destroy();
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

    // expect(function(){
      new Regular({
        template: "<checked toggled='' checked={null} /> <checked checked={undefined}/ >"
      })
    // }).to.not.throwException();

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

  it('bugfix #123', function(){
    // _watchersForStable should be removed
    Regular.extend({
      template: 'djaklsdjaldjaldjsalkdjl',
      name: 'test-a1',
      info: function(){
        return '1'
      }
    })
    var watcher = new Regular({
      template: '<div r-html={this.$refs.a.info()}></div><test-a1 ref=a></test-a1>'
    });
    watcher.destroy();
    watcher.$update();
  })
  it('bugfix #145', function(){
    // _watchersForStable should be removed
    Regular.extend({
      name: 'bug-145'
    })
    var component;
    expect(function(){
      component = new Regular({
        data: {
          name: 'leeluolee'
        },
        template: '<bug-145 ref=child fn={this.fn1.bind(this)} />',
        fn1: function(){
          return this.data.name;
        }
      });
    }).to.not.throwException();

    expect(component.$refs.child.data.fn()).to.equal('leeluolee')

    delete Regular._components['bug-145'];
    component.destroy();
  })

  // only test in advanced browser
  if(Object.create){

    it("bug #157: \r\n bug", function(){
      var Server = require("../../lib/server.js");

      var container = document.createElement('div');
      var Component = Regular.extend({
        name: 'bug-157',
        data: {name: 'hello'},
        template: '<div>\r\n 大<span>{name}</span>大\r\n \n</div>'
      })

      var str = Server.render(Component)
      container.innerHTML = str;

      new Component({
        mountNode: container
      })

      expect(nes.one('span', container).innerHTML).to.equal('hello');


    })
  }


  it("bug #156 once bug", function(){

    var component = new Regular;
    var test = {a: 0, b:0};
    component.$once("test",function () { test.a++ });
    component.$once("test",function () { test.b++ });
    component.$once("1test",function () { test.a++ });
    component.$once("1test",function () { test.b++ });
    component.$emit("test");
    component.$emit("test");
    expect(test.a).to.equal(1)
    expect(test.b).to.equal(1)
    component.$emit("1test");
    component.$emit("1test");
    expect(test.a).to.equal(2)
    expect(test.b).to.equal(2)

  })




  it("bug #156 side effect", function(){

    var component = new Regular;
    var test = {a: 0, b:0};
    component.$on("test",function () { test.a++ });
    component.$on("$test",function () { test.a++ });
    component.$on("$init",function () { test.b++ });
    component.$on("init",function () { test.b++ });
    component.$emit("init");
    component.$emit("$init");

    component.$emit("$test");
    expect(test.a).to.equal(1)
    expect(test.b).to.equal(4)

    component.$emit("test");
    expect(test.a).to.equal(2)
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




  })


  describe("M 0.6", function(){

    var List = Regular.extend({
      template: '<div ref=cnt>{#list list as item by item.a}<span>{item.a}</span>{/list}</div>'
    });
    it('bug #90: simple', function(){
    var list = new List({
      data: {
      list: [{a: 0}, {a: 1} , {a: 2}, {a: 3}, {a: 4}, {a: 5}]
      }
    });
    var dataList = list.data.list;

    var spans = nes.all( 'span', list.$refs.cnt );
    expect( spans.length ).to.equal(6);
    spans.forEach(function(div , index){
      expect(div.innerHTML).to.equal('' + index)
    })

    var newList = []

    for(var len = spans.length; len--;){
      newList.push(dataList[len])
    }

    list.data.list = newList;
    list.$update();

    var newSpans = nes.all( 'span', list.$refs.cnt );

    newSpans.forEach(function(d, index){
      expect(d).to.equal(spans[newSpans.length - 1 - index])
    })

  })

  it('bug #90: 1 => 3 =>0 = 3 ', function(){
    var list = new List({
      data: {
        list: [{a: 2}]
      }
    });

    var ospans = nes.all( 'span', list.$refs.cnt );

    list.$update('list', [
      { a:1 }, { a:2 }, { a:3 }
    ])

    var nspans = nes.all( 'span', list.$refs.cnt );

    expect(ospans.length).to.equal(1)
    expect(nspans.length).to.equal(3)
    expect(nspans[1]).to.equal(ospans[0])


    list.$update('list', [ ])

    var tspans = nes.all( 'span', list.$refs.cnt );

    expect(tspans.length).to.equal(0);

    list.$update('list', [
      { a:1 }, { a:2 }, { a:3 }
    ])

    tspans = nes.all( 'span', list.$refs.cnt );
    expect(tspans.length).to.equal(3);

  })


  it('bug #90: multiply key', function(){
    var List = Regular.extend({
      template: '<div ref=cnt>{#list list as item by item.a}<span>{item.a}</span>{/list}</div>'
    });
    var list = new List({
      data: {
        list: [{a: 2}, {a: 1} , {a: 2}]
      }
    });

    var ospans = nes.all( 'span', list.$refs.cnt );

    list.$update('list', [
      {a:1}, {a:2}, {a:1}
    ])

    var nspans = nes.all( 'span', list.$refs.cnt );

    expect(nspans[1]).to.equal(ospans[0])
    expect(nspans[2]).to.equal(ospans[1])


  })


})






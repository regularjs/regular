/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(8);
	__webpack_require__(9);
	__webpack_require__(10);
	__webpack_require__(11);
	__webpack_require__(12);
	__webpack_require__(13);
	__webpack_require__(14);
	__webpack_require__(15);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	var Regular = __webpack_require__(16);
	
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	
	describe("config", function(){
	  var container = document.createElement("div");
	
	  after(function() {
	    Regular.config({
	      END: '}',
	      BEGIN: '{'
	    })
	  });
	
	  it("END and BEGIN can accpet '[' and ']'", function(){
	
	
	    Regular.config({
	      END: ']',
	      BEGIN: '['
	    })
	
	    var component = new Regular({
	      template: "<p>[{a:1}['a']][a]</p>",
	      data: {a:1}
	    }).$inject( container );
	
	    expect(nes.one("p",container).innerHTML).to.equal('11');
	    destroy(component, container)
	  })
	  it("END and BEGIN can accpet '{' and '}'", function(){
	
	
	    Regular.config({
	      END: '}',
	      BEGIN: '{'
	    })
	    var component = new Regular({
	      template: '<div><ul><li><a href=\"#/knowledge/add\">åˆ›å»º</a></li></ul><table><tbody>{#list list as x}<tr><td><input type=\"checkbox\" value=\"{x.id}\"></td><td>{x.name}</td><td>{x.creator}</td><td>{x.create_time}</td></tr>{/list}</tbody></table></div>',
	      data: {list: [{name: 1, creator: 2, create_time: 100, id:100 },{name: 2, creator: 2, create_time: 200, id:100},{name: 3, creator: 2, create_time: 300, id:100}]}
	    }).$inject(container);
	
	
	    expect(nes.all("tr",container).length,container).to.equal(3);
	    destroy(component, container)
	  })
	
	  it("custom END and BEGIN should also affect string-interplation", function(){
	
	
	    Regular.config({
	      END: '}',
	      BEGIN: '{'
	    })
	    var component = new Regular({
	      template: '<div title="{title}1"  on-click={title="2"} on-click={content=2} on-click={ this.nest({param: {title: title}}) }>{content}</div>',
	      data: {title: "1", content: "1"},
	      nest: function(option){
	        this.data.param = option.param;
	      }
	    }).$inject(container);
	
	    var div = nes.one("div",container);
	    expect(div.title).to.equal("11");
	    expect(div.innerHTML).to.equal("1");
	    dispatchMockEvent(div, 'click');
	
	    expect(div.title).to.equal("21");
	    expect(div.innerHTML).to.equal("2");
	
	    destroy(component, container)
	  })
	  it("END and BEGIN can accpet '[[' and ']]'", function(){
	
	    Regular.config({
	      END: ']]',
	      BEGIN: '[['
	    })
	
	    var component = new Regular({
	      template: "<p>[[ {a:1}['a'] ]]</p>",
	      data: {a:1}
	    }).$inject( container );
	
	    expect(nes.one("p",container).innerHTML).to.equal('1');
	    destroy(component, container)
	  })
	  it("END and BEGIN can accpet '{{{' and '}}}'", function(){
	
	    Regular.config({
	      END: '}}}',
	      BEGIN: '{{{'
	    })
	
	    var component = new Regular({
	      template: "<p>{{{ {a:1}['a'] }}}</p>"
	    }).$inject( container );
	
	    expect(nes.one("p",container).innerHTML).to.equal('1');
	    destroy(component, container)
	  })
	})
	
	describe("Interplation", function(){
	  var container = document.createElement("div");
	
	
	  it("deep undefined shouldn't throw a xx of undefined error", function(){
	
	    var component = new Regular({
	      template: "{#if hello.name.title}{hello.name.title}1{/if}{#list hello.is.undefined as item}{item.name}{/list}{#include hello}"
	    }).$inject(container);
	
	    destroy(component, container)
	  })
	
	  it("nest undefined with multi inteplation should work correct", function(){
	    var component = new Regular({
	      template: "<div class='test {hello.title.name} {name} 2' ref=test></div>",
	      data: {name: 2}
	    })
	
	    expect(component.$refs.test.className).to.equal("test  2 2");
	    destroy(component, container)
	  })
	
	
	  it("if function call is undefined, should throw error  ", function(){
	    var component = new Regular({
	      template: "<div on-click={this.login()} ref=test></div>",
	      data: {name: 2}
	    })
	
	    expect(function(){
	      component.$get("hello.login()");
	    }).to.throwError()
	
	    expect(function(){
	      component.$get("hello.login");
	    }).to.not.throwError()
	
	    expect(function(){
	      component.$get("this.login()");
	    }).to.throwError()
	
	    expect(function(){
	      component.$get("this.login.hello");
	    }).to.not.throwError()
	
	
	    destroy(component, container)
	  })
	
	  it("Invalid tag should throw Error" , function(){
	    var Component = Regular.extend();
	
	    expect(function(){
	      Regular.parse("<script>var</script>")
	    }).to.throwError();
	
	    expect(function(){
	      Regular.parse("<style>body</style>")
	    }).to.throwError();
	
	  })
	
	  it("Invalid Lefthand Expression should throw Error" , function(){
	    var component = new Regular({
	      data: {name: 2}
	    })
	
	    expect(function(){
	      component.$get("name + 1 = 3")
	    }).to.throwError();
	
	  })
	
	  it("#44: <div>></div> should not throw error", function(){
	
	    expect(function(){ 
	      new Regular({template: '<div>></div>'}) 
	    }) .to.not.throwError();
	    expect(function(){ 
	      new Regular({template: '<div>><</div>'}) 
	    }) .to.not.throwError();
	
	  })
	
	})
	
	describe('String inteplation', function(){
	
	  it("auto covert 'String inteplation' to Expression", function(){
	
	    var component = new Regular({
	      template: "<div ref=div title='haha {name} haha' name='{items.join(\",\")}'></div>",
	      data: {
	        name: "hehe",
	        items: [1,2,3]
	      }
	    })
	
	    expect(component.$refs.div.getAttribute('title')).to.equal('haha hehe haha');
	    expect(component.$refs.div.getAttribute('name')).to.equal('1,2,3');
	
	  })
	  it("Directive with String inteplation", function(done){
	
	    var Component = Regular.extend({ 
	      template: "<div r-test='haa {name} haha' ></div>"
	    });
	    Component.directive({
	      'r-test': {
	        link: function(elem, value){
	          expect(value.type).equal('expression')
	          done()
	        }
	      }
	    })
	
	    new Component;
	  })
	  it("Directive without PreCompile Interplation", function(done){
	
	    var Component = Regular.extend({ 
	      template: "<div r-test='haa {name} haha' ></div>"
	    });
	
	    Component.directive({
	      'r-test': {
	        nps: true,
	        link: function(elem, value){
	          expect(typeof value).equal('string')
	          done()
	        }
	
	      }
	    })
	
	    new Component();
	
	  })
	})
	
	
	
	
	


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	
	var Regular = __webpack_require__(16);
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
	})
	
	
	
	


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Regular = __webpack_require__(16);
	var animate = __webpack_require__(19);
	var dom = __webpack_require__(17);
	
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	
	
	// // insert a test css
	// var sheet = (function() {
	//   // Create the <style> tag
	//   var style = document.createElement("style");
	
	//   style.appendChild(document.createTextNode(""));
	//   document.head.appendChild(style);
	
	//   return style.sheet;
	// })();
	
	describe("Animation", function(){
	  var Component = Regular.extend();
	  describe("helper.animate ", function(){
	    var container = document.createElement("div");
	    var processAnimate = Regular.directive("r-animation");
	    before(function(){
	      document.body.appendChild( container );
	    });
	    after(function(){
	      document.body.removeChild( container );
	    });
	
	    it("animate.inject is async when on:enter is specified", function(done){
	      var div1 =document.createElement("div");
	      var div2 =document.createElement("div");
	      var component = new Component;
	      processAnimate.link.call(component, div1, "on: enter; class: anim");
	
	      // to judge async or sync
	      var a = 1;
	      animate.inject(div1, div2, 'bottom', function(){
	        a = 2;
	        expect(div2.getElementsByTagName("div")[0]).to.equal(div1);
	        dom.nextReflow(function(){done()})
	      })
	      expect(a).to.equal(1)
	
	    })
	    it("animate.inject is async without on:enter", function(done){
	
	      var div1 =document.createElement("div");
	      var div2 =document.createElement("div");
	      var component = new Component;
	      processAnimate.link.call(component, div1, "on: click; class: anim");
	
	      var a = 1;
	      animate.inject(div1, div2, 'bottom', function(){
	        a = 2;
	        expect(div2.getElementsByTagName("div")[0]).to.equal(div1);
	        dom.nextReflow(function(){done()})
	      })
	      expect(a).to.equal(2)
	
	    })
	    it("animate.inject accept [Array]", function(done){
	
	      var div1 =document.createElement("div");
	      var div2 =document.createElement("div");
	      var component = new Component;
	      processAnimate.link.call(component, div1, "on: click; class: anim");
	      var a = 1;
	      animate.inject([div1, div2], container, 'bottom', function(){
	        a = 2;
	        expect(container.getElementsByTagName("div")[1]).to.equal(div2);
	        container.innerHTML = "";
	        dom.nextReflow(function(){done()})
	      })
	      expect(a).to.equal(2)
	    })
	
	    it("animate.remove accept Array", function(done){
	      var div1 =document.createElement("div");
	      var div2 =document.createElement("div");
	      animate.inject([div1, div2], container)
	
	      var divs = container.getElementsByTagName("div");
	      expect(divs.length).to.equal(2);
	      animate.remove([div1, div2], function(){
	        var divs = container.getElementsByTagName("div");
	        expect(divs.length).to.equal(0);
	        dom.nextReflow(function(){done()})
	      })
	    })
	    it("animate.remove is sync without on:leave ", function(done){
	      var div1 =document.createElement("div");
	      var div2 =document.createElement("div");
	      var component = new Component;
	      processAnimate.link.call(component, div1, "on: enter; class: anim");
	      dom.inject(div1, div2);
	      expect(div2.firstChild).to.equal(div1);
	      var a = 1;
	      animate.remove(div1, function(){
	        a = 2;
	        expect(div2.firstChild).to.be.an.undefined;
	        dom.nextReflow(function(){done()})
	      })
	      expect(a).to.equal(2);
	      
	    })
	    it("animate.remove is async without on:leave ", function(done){
	      var div1 =document.createElement("div");
	      var div2 =document.createElement("div");
	      var component = new Component;
	      processAnimate.link.call(component, div1, "on: leave; class: anim");
	      dom.inject([div1, div2], container);
	      expect(container.childNodes.length).to.equal(2);
	      var a = 1;
	      animate.remove([div1, div2], function(){
	        a = 2;
	        expect(container.childNodes.length).to.equal(0);
	        dom.nextReflow(function(){done()})
	      })
	      expect(a).to.equal(1);
	      
	    })
	
	    it("#issue 61: parse value before start animation", function(done){
	      var div1 =document.createElement("div");
	      var i = 0;
	      Component.animation({
	        "custom": function( step ){
	          i++;
	          expect(step.param).to.equal("animated")
	        },
	        "custom2": function( step ){
	          i++;
	          expect(step.param).to.equal("static")
	          expect(i).to.equal(2);
	          done();
	        }
	      })
	
	
	      var component = new Component({
	        data: {
	          className: "animated"
	        },
	        template: "<div r-anim='on: enter; custom: {className}; custom2: static'></div>"
	      });
	      var i =0;
	
	    })
	
	    it("animate.inject&animate.remove with callback", function(done){
	      var div1 =document.createElement("div");
	      var div2 =document.createElement("div");
	      var enter = false;
	      div1.onenter= function(cb){
	        enter = true
	        cb()
	      }
	      animate.inject(div1, div2, 'bottom', function(){
	        expect(div2.getElementsByTagName("div")[0]).to.equal(div1);
	        div1.enter = true;
	        div1.onenter = null;
	        div1.onleave = function(cb){
	          expect(div2.getElementsByTagName("div").length).to.equal(1);
	          cb();
	        }
	        animate.remove(div1, function(){
	          expect(div2.getElementsByTagName("div").length).to.equal(0);
	          done()
	        })
	      })
	
	    })
	
	    it("animate.startClass with no animation and transition", function(done){
	      var div1 = document.createElement("div");
	      animate.startClassAnimate(div1, 'bouceOut', function(){
	        expect(dom.hasClass(div1, 'bouceOut')).to.equal(false);
	        done()
	      })
	      // will add nextFlow
	      expect(dom.hasClass(div1, 'bouceOut')).to.equal(false)
	    })
	    it("animate.startClass with no transition mode 2", function(done){
	      var div1 = document.createElement("div");
	      animate.startClassAnimate(div1, 'bouceOut', function(){
	        expect(dom.hasClass(div1, 'bouceOut-active')).to.equal(false);
	        expect(dom.hasClass(div1, 'bouceOut')).to.equal(false);
	        done()
	      }, 2)
	      // will add nextFlow
	      expect(dom.hasClass(div1, 'bouceOut')).to.equal(true)
	      expect(dom.hasClass(div1, 'bouceOut-active')).to.equal(false)
	    })
	    it("animate.startClass with no transition in mode 3", function(done){
	      var div1 = document.createElement("div");
	      animate.startClassAnimate(div1, 'bouceOut', function(){
	        expect(dom.hasClass(div1, 'bouceOut')).to.equal(true);
	        done()
	      }, 3)
	      // will add nextFlow
	      expect(dom.hasClass(div1, 'bouceOut')).to.equal(false)
	    })
	    it("animate.startClass with no transition in mode 4", function(done){
	      var div = document.createElement("div");
	      div.className = "bouceOut in"
	      animate.startClassAnimate(div, 'bouceOut', function(){
	        expect(div.className).to.equal('in');
	        done()
	      }, 4)
	      // will add nextFlow
	      expect(dom.hasClass(div, 'bouceOut')).to.equal(true)
	    })
	    it("animate.startStyle with no transition", function(done){
	      var div1 = document.createElement("div");
	      animate.startStyleAnimate(div1,{width: '10px',height:"10px"}, function(){
	        expect(div1.style.width).to.equal("10px")
	        expect(div1.style.height).to.equal("10px")
	        done()
	      })
	      // will add nextFlow
	      expect(div1.style.width).to.not.equal("10px")
	      expect(div1.style.height).to.not.equal("10px")
	    })
	
	  })
	
	  describe("Animator", function(){
	
	    var container = document.createElement("div");
	    before(function(){
	      document.body.appendChild( container );
	    });
	    after(function(){
	      document.body.removeChild( container );
	    });
	
	    it("animator: wait", function(done){
	      var wait = Regular.animation("wait");
	      var complete = false;
	      wait({param: 100})(function(){
	        complete= true;
	        done();
	      })
	
	      expect(complete).to.equal(false);
	    })
	    it("animator: class", function(done){
	      var element = document.createElement("div");
	      var klass = Regular.animation("class");
	      klass({
	        element: element,
	        param: "bouceout animated"})(function(){
	        expect(element.className).to.equal("");
	        done();
	      })
	
	      dom.nextReflow(function(){
	        expect(element.className).to.equal("bouceout animated");
	      })
	    })
	    it("animator: class,2", function(done){
	      var element = document.createElement("div");
	      var klass = Regular.animation("class");
	
	      klass({
	        element: element,
	        param: "bouceout animated,2"})(function(){
	        expect(element.className).to.equal("");
	        done();
	      })
	
	      expect(element.className).to.equal("bouceout animated");
	
	      dom.nextReflow(function(){
	        expect(dom.hasClass(element, "bouceout-active")).to.equal(true);
	        expect(dom.hasClass(element, "animated-active")).to.equal(true);
	        expect(dom.hasClass(element, "bouceout")).to.equal(true);
	        expect(dom.hasClass(element, "animated")).to.equal(true);
	      })
	
	    })
	    it("animator: class, 3", function(done){
	      var element = document.createElement("div");
	      var klass = Regular.animation("class");
	
	      klass({
	        element: element,
	        param: "bouceOut animated,3"})(function(){
	        expect(element.className).to.equal("bouceOut animated");
	        done();
	      })
	      expect(element.className).to.equal("");
	      dom.nextReflow(function(){
	        expect(element.className).to.equal("bouceOut animated");
	      })
	    })
	    it("animator: class, 4", function(done){
	      var element = document.createElement("div");
	      var klass = Regular.animation("class");
	
	      element.className = "bouceOut animated hello";
	
	      klass({
	        element: element,
	        param: "bouceOut animated,4"})(function(){
	        expect(element.className).to.equal("hello");
	        done();
	      })
	      expect(element.className).to.equal("bouceOut animated hello");
	    })
	    it("animator: style", function(done){
	      var element = document.createElement("div");
	      var style = Regular.animation("style");
	      style({
	        element: element,
	        param: "left 10px, right 20px"
	      })(function(){
	        expect(element.style.left).to.equal("10px");
	        expect(element.style.right).to.equal("20px");
	        done();
	      })
	      expect(element.style.left).to.equal("");
	      expect(element.style.right).to.equal("");
	    })
	    it("animator: call", function(done){
	      var element = document.createElement("div");
	      var call = Regular.animation("call");
	      var component = new Component({});
	      call.call(component, {
	        element: element,
	        param: "name=1"
	      })(function(){
	        expect(component.data.name).to.equal(1);
	        done();
	      })
	    })
	    it("animator: emit", function(done){
	      var emit = Regular.animation("emit");
	
	      var toasted = false;
	      var component = new Component({
	        data: {hello: "leeluolee"},
	        events: {
	          toast: function(param){
	            toasted = param
	          }
	        }
	      })
	      emit.call(component,{
	        param: "toast, hello"
	      })(function(){
	        expect(toasted).to.equal("leeluolee");
	        done();
	      })
	    })
	
	  })
	
	  describe("processAnimate", function(){
	    var processAnimate = Regular.directive("r-animation");
	
	    it("'on' should addListener on component but not element", function(done){
	      var element = document.createElement("div");
	      var component = new Component({
	        toastOver: function(){
	          expect(dom.hasClass(element, 'animated')).to.equal(false);
	          done()
	          this.destroy();
	        }
	      });
	      processAnimate.link.call(component, element, "on: toast; class: animated; call: this.toastOver()");
	      component.$emit("toast");
	      expect(dom.hasClass(element, 'animated')).to.equal(false);
	      dom.nextReflow(function(){
	        expect(dom.hasClass(element, 'animated')).to.equal(true);
	      })
	      component.destroy
	    })
	
	    it("'on: click' add addListener on dom but not component", function(done){
	      var element = document.createElement("div");
	      var component = new Component({
	        toastOver: function($event){
	          expect(dom.hasClass(element, 'animated')).to.equal(false);
	          done()
	          this.destroy();
	          document.body.removeChild(element);
	        }
	      });
	      document.body.appendChild(element);
	      processAnimate.link.call(component, element, "on: click; class: animated; call: this.toastOver($event)");
	      dispatchMockEvent(element, 'click');
	      expect(dom.hasClass(element, 'animated')).to.equal(false);
	      dom.nextReflow(function(){
	        // expect(dom.hasClass(element, 'animated')).to.equal(true);
	      })
	    })
	    it("'when' should add a watcher", function(done){
	      var element = document.createElement("div");
	      var component = new Component({
	        toastOver: function(){
	          expect(dom.hasClass(element, 'animated')).to.equal(false);
	          done()
	        }
	      });
	      processAnimate.link.call(component, element, "when: toast==true; class: animated; call: this.toastOver()");
	      component.data.toast = true;
	      component.$update();
	      expect(dom.hasClass(element, 'animated')).to.equal(false);
	      dom.nextReflow(function(){
	        expect(dom.hasClass(element, 'animated')).to.equal(true);
	      })
	    })
	    it("undefined aniamtion should not throw error", function(done){
	      var element = document.createElement("div");
	      var component = new Component();
	      var animator = function(){ }
	      Component.animation('hello', animator)
	      expect(Component.animation('hello')).to.equal(animator)
	      expect(function(){
	        processAnimate.link.call(component, element, "on: enter; notfound:;");
	      }).throwError()
	        done();
	    })
	  })
	
	})

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	// contains basic dom && event specs
	var dom = __webpack_require__(17);
	var Regular = __webpack_require__(16);
	
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	
	
	describe("Dom", function(){
	
	  describe("[Regular.dom] api", function(){
	    var div = dom.create("div");
	    
	    it("class relative api", function(){
	      dom.addClass(div, "name");
	      expect(dom.hasClass(div, "name")).to.equal(true);
	      dom.delClass(div, "name");
	      expect(dom.hasClass(div, "name")).to.equal(false);
	      div.className = "";
	    })
	
	    it("addClass should work as expect", function(){
	      dom.addClass(div, "name");
	      expect(div.className).to.equal("name");
	    })
	
	    it("delClass should work as expect", function(){
	      div.className = "name";
	      dom.delClass(div, "name");
	      expect(div.className).to.equal("");
	
	    })
	  })
	
	
	  describe("Event via `on-*`", function(){
	    it("trigger simple click event", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "<div on-click={name=1}>test</div>",
	        data: {test: 0}
	      }).$inject(container);
	
	      var $node = $('div', container);
	
	      expect(component.data.name).to.equal(undefined);
	      expect($node.length).to.equal(1);
	
	      dispatchMockEvent($node[0], 'click');
	      expect(component.data.name).to.equal(1);
	
	      destroy(component, container);
	    })
	
	    it("custom Event handler's context should be component", function(){
	
	        var container = document.createElement('div');
	        var Component = Regular.extend();
	        var context;
	        Component.event('hello', function(elem, fire){
	          context = this;
	        })
	        var component = new Component({
	          template: "<div on-hello={name=name+1} class='hello' >haha</div>",
	          data: { test: 0 , name: 'hahah'}
	        }).$inject(container);
	
	        expect(context).to.equal(component);
	
	    })
	    it("nested binder(>2) should be destroy after destroy", function(){
	
	        var container = document.createElement('div');
	        var Component = Regular.extend();
	        var destroy_directive=1, destroy_upload=1;
	        Component.event('upload', function(elem, fire){
	          return function(){
	            destroy_upload++;
	          }
	        }).directive("r-test", function(){
	          return function(){
	            destroy_directive++;
	          }
	          
	        })
	        var list = [];
	        var template = 
	        '<div class="m-imgview {clazz}">\
	            <div class="img  animated" >\
	              <div class="btns">\
	                <label class="local btn  btn-primary btn-sm" r-test=1 on-upload={this.handleUpload($event,img_index)}>本地上传</label>\
	              </div>\
	            </div>\
	        </div>';
	
	        var component = new Component({
	          template: template,
	          data: { test: 0 , name: 'hahah', imgs:['null']}
	        }).$inject(container);
	
	        component.destroy();
	        expect(destroy_upload).to.equal(2)
	        expect(destroy_directive).to.equal(2)
	
	
	    })
	
	    it("event should go proxy way when pass Non-Expreesion as attribute_value", function(){
	      var container = document.createElement('div');
	      var i = 0;
	      var Component = Regular.extend({
	        init: function(){
	          this.$on("hello2", function(){
	            i = 1;
	          })
	        },
	        hello2: function(){
	          i = 2; 
	        }
	
	      });
	
	      var component = new Component({
	        template: "<div on-click=hello2 class='hello' >haha</div>",
	        data: { test: 0 , name: 'hahah'}
	      }).$inject(container);
	
	      dispatchMockEvent(nes.one('div', container), "click");
	
	      expect(i).to.equal(1);
	
	
	      destroy(component, container);
	
	
	    });  
	
	    it("when go proxy way the fire's context should point to outer component", function(){
	      var container = document.createElement('div');
	      var i = 0, j=0;
	      var Component = Regular.extend({
	        template: "{#list 1..1 as item}{#list 1..1 as todo}<div on-click='hello2'></div>{/list}{/list}",
	        init: function(){
	          this.$on("hello2", function(){
	            i = 1;
	          })
	        }
	      });
	      var component = new Component;
	      component.$inject(container);
	      dispatchMockEvent(nes.one('div', container), "click");
	      expect(i).to.equal(1);
	
	      destroy(component, container)
	    })
	
	    it("you can binding one event with same eventType on one node", function(){
	      var container = document.createElement('div');
	      var i = 0, j = 0;
	      var Component = Regular.extend({
	        init: function(){
	          this.$on("hello2", function(){
	            i = 1;
	          })
	        },
	        hello2: function(){
	          j = 1; 
	        }
	
	      });
	
	      var component = new Component({
	        template: "<div on-click=hello2 on-click={this.hello2()} >haha</div>",
	        data: { test: 0 , name: 'hahah'}
	      }).$inject(container);
	
	      dispatchMockEvent(nes.one('div', container), "click");
	
	      expect(i).to.equal(1);
	      expect(j).to.equal(1);
	
	      destroy(component, container);
	
	
	    })
	
	    it("$event.origin should point to the element that bingding the event", function(done){
	      var container = document.createElement('div');
	      document.body.appendChild(container);
	      var component = new Regular({
	        template: "<div on-click=hello2 on-click={this.hello2($event)} ref=div > <a ref=a href='javascript:;'>haha</a></div>",
	        data: { test: 0 , name: 'hahah'},
	        hello2: function($event){
	          $event.preventDefault();
	          expect($event.origin).to.equal(this.$refs.div);
	          document.body.removeChild(container);
	          done();
	          this.destroy();
	        }
	      }).$inject(container);
	      dispatchMockEvent(component.$refs.a, "click");
	    })
	
	  })
	
	  describe("delegate Event via `delegate-*`", function(){
	    var Component = Regular.extend();
	    var container = document.createElement("div")
	    before(function(){
	      document.body.appendChild(container)
	    })
	
	    after(function(){
	      document.body.removeChild(container);
	    })
	
	    it("delegate Event should work via", function(){
	      var i,j;
	      var component = new Component({
	        template: "<div delegate-click=proxy delegate-click={this.hello2()} >haha</div>",
	        data: { test: 0 , name: 'hahah'},
	        hello2: function(){
	          i=1;
	        }
	
	      }).$inject(container);
	
	      component.$on("proxy", function(){
	        j=1;
	      })
	
	      dispatchMockEvent(nes.one('div', container), "click");
	
	
	      expect(i).to.equal(1);
	      expect(j).to.equal(1);
	
	      destroy(component, container);
	
	    })
	
	    it("delegate Event should destroy via {#if}", function(){
	      var i = 0, j=0;
	      var component = new Component({
	        template: "<div {#if test} delegate-click=proxy {#else} delegate-click=proxy2 {/if} >haha</div>",
	        data: { test: true , name: 'hahah'}
	      }).$inject(container);
	
	      component.$on("proxy", function(){i++})
	      component.$on("proxy2", function(){j++})
	
	      expect(j).to.equal(0);
	
	      dispatchMockEvent(nes.one('div', container), "click");
	
	      expect(i).to.equal(1);
	      expect(j).to.equal(0);
	
	      component.$update("test", false);
	
	      dispatchMockEvent(nes.one('div', container), "click");
	
	      expect(i).to.equal(1);
	      expect(j).to.equal(1);
	
	      component.$update("test", true);
	
	      dispatchMockEvent(nes.one('div', container), "click");
	
	      expect(i).to.equal(2);
	      expect(j).to.equal(1);
	
	      destroy(component, container);
	
	    })
	
	    it("delegate Event will merge to new container if use $inject", function(){
	      var container2 = document.createElement("div");
	      document.body.appendChild(container2);
	
	      var component = new Component({
	        template: "<div ref=a delegate-click={i = i+1}  >haha</div>",
	        data: { i: 1 }
	      }).$inject( container );
	
	      component.$inject( container2 );
	
	
	      dispatchMockEvent(component.$refs.a, "click" );
	
	      expect( component.data.i ).to.equal(2);
	
	      component.$inject(false);
	      dispatchMockEvent(component.$refs.a, "click" );
	
	      expect( component.data.i ).to.equal(2);
	
	      component.$inject( container2 );
	
	
	      dispatchMockEvent(component.$refs.a, "click" );
	
	      expect( component.data.i ).to.equal(3);
	
	      document.body.removeChild( container2 );
	
	      destroy(component, container2)
	
	    })
	
	    it("delegate Event only bind on the rootComponent", function(){
	      var Nested = Regular.extend({
	        name: "nest",
	        template: "<div delegate-click=hello></div>"
	      })
	      var component = new Component({
	        template: "<nest></nest>",
	        data: { i: 1 }
	      }).$inject( container );
	
	
	      expect( component._delegates["click"].length ).to.equal(1);
	
	      destroy( component, container );
	
	      expect( component._delegates["click"] ).to.equal( null );
	
	    })
	
	    it('delegate Event should work when the directive is linked after node being injected', function(){
	      var Nested = Regular.extend({
	        name: "nest",
	        template: "{#if show}<div delegate-click='hello'></div>{/if}"
	      })
	
	      var component = new Component({
	        template: "<nest show={show} on-hello={name=1}></nest>",
	        data: { i: 1 }
	      }).$inject( container );
	
	
	      expect( component._delegates ).to.equal(undefined);
	
	      component.$update('show', true);
	
	      expect( component._delegates["click"].length ).to.equal(1);
	      dispatchMockEvent(nes.one( 'div', container ), "click" );
	      expect(component.data.name).to.equal(1);
	
	      destroy( component, container );
	
	      expect( component._delegates["click"] ).to.equal( null );
	    })
	  })
	
	  describe("dom.element should work as expect", function(){
	    var Nested = Regular.extend({
	      name: "nest",
	      template: "{#if !show}<div id='hide'>HIDE</div>{/if}"
	    })
	    var component = new Regular({
	      template: "<nest show={show}></nest>{#if show}<div id='show'>SHOW</div>{/if}\
	                {#list nodes as node}<div class='list'>list{node_index}</div>{/list}",
	      data: {
	        show: false,
	        nodes: [1,2,3]
	      }
	    })
	    it("dom.element basic", function(){
	      component.$update('show', false);
	      expect(dom.element(component).innerHTML).to.equal('HIDE')
	      var all = dom.element(component, true);
	      expect(all.length).to.equal(4)
	      expect(all[1].className).to.equal('list')
	      expect( all[2].innerHTML ).to.equal( 'list1' )
	    })
	    it("dom.element is changed with its content", function(){
	      component.data.nodes = [1,2]
	      component.$update('show', true)
	      expect(dom.element(component).innerHTML).to.equal('SHOW')
	      var all = dom.element(component, true);
	      expect(all.length).to.equal(3)
	      expect(all[1].innerHTML).to.equal('list0')
	      expect(all[2].innerHTML).to.equal('list1')
	    })
	
	  })
	
	  
	
	
	})
	


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	var Regular = __webpack_require__(16);
	var combine = __webpack_require__(20);
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	describe("combine api", function(){
	
	  var  container;
	  before(function(){
	    container = document.createElement("div");
	  })
	  after(function(){
	    container = null;
	  })
	  it("combine.inject can be used in group", function( done){
	    var component = new Regular({
	      data: {name: 'hello'}
	    });
	    var group = component.$compile("<div>{name}</div>")
	    component.$update();
	    group.inject(container)
	    expect(container.innerHTML.toLowerCase()).to.equal('<div>hello</div>')
	    group.destroy(true);
	    expect(container.innerHTML).to.equal('')
	    done()
	  })
	  it("combine.inject can be pass false to remove group or component", function(){
	    var component = new Regular({
	      data: {name: 'hello'}
	    });
	    var group = component.$compile("<div>{name}</div>")
	    component.$update();
	    group.inject(container)
	    expect(container.innerHTML.toLowerCase()).to.equal('<div>hello</div>')
	    group.inject(false)
	    expect(container.innerHTML).to.equal('');
	    group.destroy(true);
	  })
	})
	describe("instance API", function(){
	  var  container, container2;
	  before(function(){
	    container = document.createElement("div");
	    container2 = document.createElement("div");
	  })
	  after(function(){
	    container = null;
	    container2 = null;
	  })
	  it("component.$inject can use twice", function(){
	    var component = new Regular({
	      template:"{hello}<div>hello</div><p>name</p>"
	    }).$inject(container);
	    expect(nes.all("p,div",container).length).to.equal(2);
	
	    component.$inject(container2);
	
	    expect(container.innerHTML).to.equal("");
	    expect(nes("div", container2).length).to.equal(1);
	
	    destroy(component, container2)
	  })
	
	  it("component.$inject works on list when use twice", function(){
	    var component = new Regular({
	      template:"{#list items as item}<div>hello</div>{/list}",
	      data: {items: [1]}
	    }).$inject(container);
	
	    component.$inject(container2)
	
	    component.data.items.push(2);
	    component.$update()
	
	    expect(nes.all("div", container2).length).to.equal(2);
	    expect(nes.all("div", container).length).to.equal(0);
	    destroy(component, container2)
	  })
	
	  it("component.$inject works on if when use twice", function(){
	    var component = new Regular({
	      template:"{#if test}<div>hello</div><p>name</p>{/if}",
	      data: {test: true}
	    }).$inject(container);
	
	    expect(nes.all("div", container).length).to.equal(1);
	
	    component.$inject(container2)
	
	    expect(container.innerHTML).to.equal("");
	    expect(nes.all("div", container2).length).to.equal(1);
	    destroy(component, container2)
	  })
	
	  it("component.$inject works on include when use twice", function(){
	    var component = new Regular({
	
	      template:"{#include template}",
	
	      data: { template: "<div></div>" }
	
	    }).$inject(container);
	
	    component.$inject(container2)
	    
	    expect(nes.all("div", container).length).to.equal(0);
	
	    expect(nes.all("div", container2).length).to.equal(1);
	    destroy(component, container2)
	  })
	
	  it("component.$inject will repoint the `parentNode` ", function(){
	    var node = document.createElement("div");
	    container.appendChild(node);
	    var component = new Regular({
	      template:"<div>hello</div><p>name</p>"
	    }).$inject(node, "after");
	
	    expect(node.nextSibling.innerHTML).to.equal("hello")
	    expect(component.parentNode).to.equal(container)
	
	    component.$inject(node, "before");
	
	
	    expect(node.previousSibling.innerHTML).to.equal("name")
	    expect(component.parentNode).to.equal(container)
	
	    component.$inject(node, "bottom");
	
	    expect(node.lastChild.innerHTML).to.equal("name")
	    expect(component.parentNode).to.equal(node)
	
	    component.$inject(node, "top");
	
	    expect(node.firstChild.innerHTML).to.equal("hello")
	    expect(component.parentNode).to.equal(node)
	
	    component.destroy();
	
	    expect(nes.all("div", container).length).to.equal(1);
	    expect(nes.one("div", container)).to.equal(node);
	    container.innerHTML = "";
	
	  })
	  it("component.$inject(false) remove component from document", function(){
	
	    var component = new Regular({
	      template:"<div>hello</div><p>name</p>"
	    }).$inject(container);
	
	    expect(container.childNodes.length).to.equal(2);
	    expect(container.childNodes[0].innerHTML).to.equal('hello');
	
	    component.$inject(false);
	    expect(container.innerHTML).to.equal('');
	    destroy(component, container);
	  })
	  it("directly inject component to false, won't throw Error", function(){
	
	    var component = new Regular({
	      template:"<div>hello</div><p>name</p>"
	    }).$inject(false);
	
	  })
	
	})


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	  var Regular = __webpack_require__(16);
	
	function reset(){}
	
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	
	describe("test Regular's modular mechanism", function(){
	
	  describe("Regular definition" , function(){
	
	    it("should preparse template in Regular.extend", function(){
	      var Component = Regular.extend({
	        template: "aa",
	        computed: {
	          "len": "left + right" 
	        }
	      });
	
	      expect(Component.prototype.template).to.an("array");
	      expect(Component.prototype.computed.len.type).to.equal("expression");
	
	    })
	
	    it("should accepet [Element] as the template", function(){
	      var templateNode = document.createElement("div");
	      
	      templateNode.innerHTML = "<div>{hello}</div>";
	      var Component = Regular.extend({
	        template: templateNode
	      });
	
	      expect(Component.prototype.template).to.an("array");
	
	      var component = new Regular({
	        template: templateNode
	      })
	
	      expect(component.template).to.an("array");
	
	    })
	  })
	
	  describe('fitler, directive, event isolation ', function(){
	    var Root = Regular;
	    var Parent = Regular.extend();
	    var Children = Parent.extend();
	    function foo(){}
	    it("you can extend filter, event multiply with the[Object] param", function(){
	      Parent.animation({
	        "a1": function(){},
	        "a2": function(){}
	      });
	      expect(Children.animation("a1")).to.an("function")
	      expect(Children.animation("a2")).to.an("function")
	
	    })
	    it("you can extend directives multiply with the[Object] param", function(){
	      Parent.directive({
	        "a1": function(){},
	        "a2": function(){}
	      });
	      expect(Children.directive("a1")).to.an("object")
	      expect(Children.directive("a2")).to.an("object")
	
	    })
	
	    it('filter should ioslated to Parent', function(){
	      Parent.filter('foo', foo);
	      expect(Children.filter('foo').get).to.equal(foo)
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
	      expect(Children.filter('foo2').get).to.equal(foo2)
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
	    it('data, events, computed, should merged throw extend and initialize', function(){
	      reset();
	      var Component = Regular.extend({
	        data: {a:1},
	        events: {b:1},
	        computed: {c: "a+b"}
	      }).implement({
	        data: {a: 2, b:1},
	        events: {c: 1},
	        computed: {c: "a-b"}
	      })
	
	      var component =  new Component({
	        data: {a: 3,b:2},
	        computed: {c: "a*b"}
	      })
	
	      expect(component.events.c).to.equal(1);
	      expect(component.events.b).to.equal(1);
	      expect(component.data.a).to.equal(3);
	      expect(component.data.b).to.equal(2);
	      expect(component.$get("c")).to.equal(6);
	
	    })
	  })
	
	});
	
	
	
	describe("Some buildin plugin", function(){
	var Component = Regular.extend({
	  template: "<div>{ this.name}</div>"
	}).use("timeout");
	
	it("timeout's $timeout should update when time is out", function(done){
	  var container = document.createElement("div");
	  var component = new Component().$inject(container); 
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
	  var component = new Component().$inject(container); 
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
	
	
	


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	var Regular = __webpack_require__(16);
	var SSR = __webpack_require__(26);
	var _ = Regular.util;
	
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	
	describe("List", function(){
	  var container = document.createElement('div');
	
	  describe("basic", function(){
	    it("the list based on range should work", function(){
	      var list = "<div t-test={num} class='m-model'>{#list 1..3 as num}<div class='a-{num}'>{num}</div> {/list}</div>"
	      var BaseComponent = Regular.extend({
	        template: list
	      })
	
	      var component = new BaseComponent().$inject(container);
	      expect($("div",container).length).to.equal(4);
	      expect($(".a-1",container)[0].innerHTML).to.equal("1");
	      expect($(".a-2",container)[0].innerHTML).to.equal("2");
	      expect($(".a-3",container)[0].innerHTML).to.equal("3");
	      destroy(component, container);
	    })
	
	    it("should destroy clear when have non parentNode", function(){
	      var list = "{#list 1..3 as num}{num}{/list}"
	      var component = new Regular({
	        template: list
	      }).$inject(container);
	      expect(container.innerHTML.slice(-3)).to.equal("123")
	      destroy(component, container);
	    })
	
	    it("the dom should sync with the 'sequence' value", function(){
	      var list =
	        "{#list todos as todo}" + 
	          "<div class='a-{todo_index}'>{todo.content}</div>" + 
	        "{/list}";
	      var component = new Regular({
	        data: {todos: [{content: "hello"}, {content: "hello2"}]},
	        template: list
	      }).$inject(container);
	      // expect($("div",container).length).to.equal(2);
	      // expect($(".a-0",container)[0].innerHTML).to.equal("hello");
	      // expect($(".a-1",container)[0].innerHTML).to.equal("hello2");
	
	      component.$update(function(data){
	        data.todos.push({content: 'lily'})
	        data.todos[0].content = 'people'
	      })
	
	
	      expect($(".a-0",container)[0].innerHTML).to.equal("people");
	      // expect($(".a-1",container)[0].innerHTML).to.equal("hello2");
	      // expect($(".a-2",container)[0].innerHTML).to.equal("lily");
	
	      destroy(component, container);
	    })
	
	    it("list should work with sibling node or text", function(){
	      var list =
	        "<a>name</a>{#list todos as todo}" + 
	          "<div >{todo.content}</div>" + 
	        "{/list}xxx";
	      var component = new Regular({
	        data: {todos: [{content: "hello"}, {content: "hello2"}]},
	        template: list
	      }).$inject(container);
	
	      expect($('a', container).length).to.equal(1);
	      expect($("div",container).length).to.equal(2);
	      expect(container.innerHTML.slice(-3)).to.equal('xxx');
	      destroy(component, container);
	
	    })
	    it("delete first element should sync with dom", function(){
	      var todos = [{content: "hello"}, {content: "hello2"}]
	      var list =
	        "{#list todos as todo}" + 
	          "<div >{todo_index}{todo.content}</div>" + 
	        "{/list}";
	      var component = new Regular({
	        data: {todos: todos},
	        template: list
	      }).$inject(container);
	
	      expect($("div",container).length).to.equal(2);
	      expect(nes.one("div", container).innerHTML).to.equal("0hello");
	
	      todos.shift();
	      component.$update()
	      expect(nes("div", container).length).to.equal(1);
	      expect(nes.one("div", container).innerHTML).to.equal("0hello2");
	      destroy(component, container);
	
	    })
	
	    it("the VARIABLE_index should work as expected", function(){
	      var list =
	        "{#list 1..4 as num}" + 
	          "<div class='a-{num}'>{num_index}</div>" + 
	        "{/list}"
	      var component = new Regular({
	        data: {todos: [{content: "hello"}, {content: "hello2"}]},
	        template: list
	      }).$inject(container);
	
	      expect($("div",container).length).to.equal(4);
	      expect($("div",container)[0].innerHTML).to.equal("0");
	      expect($("div",container)[1].innerHTML).to.equal("1");
	      expect($("div",container)[2].innerHTML).to.equal("2");
	
	
	      destroy(component, container);
	
	    })
	
	    it("the 'sequence' with expression should work as expect", function(){
	      var list =
	        "{#list this.filter() as num}" + 
	          "<div>{num_index}</div>"+
	        "{/list}"
	      var List = Regular.extend({
	        template: list, 
	        data: { len: 1, todos:[1,2,3,4,5,6] },
	        filter: function(){
	          var data = this.data;
	          return data.todos.slice(0, data.len);
	        }
	      });
	      var component = new List().$inject(container);
	
	      expect($("div",container).length).to.equal(1);
	
	      component.$update('len',5);
	      expect($("div",container).length).to.equal(5);
	      expect($("div",container)[4].innerHTML).to.equal("4");
	
	      destroy(component, container);
	
	    })
	    it("on,off's context should point to outer component", function(){
	      var context, num=0;
	      var Component = Regular.extend({
	        template: "{#list 1..2 as i} <li tmp-test></li> {/list}"
	      }).directive({
	        "tmp-test":function(){
	          this.$on("hello", function(){
	            num++;
	          })
	        }
	      })
	      var component = new Component();
	      component.$emit("hello");
	
	      expect(num).to.equal(2);
	
	    })
	  })
	  describe("list with nested", function(){
	
	    it("list can work with component", function(){
	
	    var TodoComponent = Regular.extend({
	      name: 'todo',
	      template: "<div>{content}</div>"
	    });
	
	    var component = new Regular({
	      data: {todos: [{content: "hello"}, {content: "hello2"}]},
	      template: 
	        "{#list todos as todo}\
	          <todo content={todo.content}/>\
	         {/list}"
	    }).$inject(container);
	
	    expect($("div",container).length).to.equal(2);
	    expect($("div", container)[0].innerHTML).to.equal("hello");
	    expect($("div", container)[1].innerHTML).to.equal("hello2");
	
	    destroy(component, container)
	
	    })
	
	    it("nested list should have the outerComponent's context", function(){
	      var container = document.createElement('div');
	
	      var list =
	        "{#list 1..2 as todo}" + 
	          "<div class='sub' data-value={this.get(todo_index)}>" + 
	          "{#list 1..2 as num}" + 
	          "<div class='sub2'>{this.get(num_index)}</div>"+
	          "{/list}" +
	          "</div>"+
	        "{/list}"
	      var List = Regular.extend({
	        hello: "123456",
	        template: list, 
	        get: function(index){
	          return this.data.todos[index].content;
	        }
	      });
	      var component = new List({
	        data: {todos: [{content: "hello"}, {content: "hello2"}]}
	      }).$inject(container);
	
	      expect($("div",container).length).to.equal(6);
	      expect($(".sub:nth-child(10n+1)",container).attr("data-value")).to.equal("hello");
	      expect($(".sub:nth-child(10n+2)",container).attr("data-value")).to.equal("hello2");
	      expect($(".sub2:nth-child(10n+1)",container).html()).to.equal("hello");
	      expect($(".sub2:nth-child(10n+2)",container).html()).to.equal("hello2");
	
	      component.$update('todos[0].content', 'changedvalue');
	      expect($(".sub:nth-child(10n+1)",container).attr("data-value")).to.equal("changedvalue");
	      expect($(".sub2:nth-child(10n+1)",container).html()).to.equal("changedvalue");
	
	      destroy(component, container)
	
	    })
	
	    it("list with table should work correctly", function(){
	      var container = document.createElement('table')
	      var list =
	        "{#list todos as todo}" + 
	          "<tr class={this.get(todo_index)}>" + 
	          "{#list 1..2 as num}" + 
	          "<td>{this.get(num_index)}</td>"+
	          "{/list}" +
	          "</tr>"+
	        "{/list}"
	      var List = Regular.extend({
	        template: list, 
	        get: function(index){
	          return this.data.todos[index].content;
	        }
	      });
	      var component = new List({
	        data: {todos: [{content: "hello"}, {content: "hello2"}]}
	      }).$inject(container);
	
	      expect($("td",container).length).to.equal(4);
	
	      expect($("td:nth-child(10n+1)",container).html()).to.equal("hello");
	      expect($("td:nth-child(10n+2)",container).html()).to.equal("hello2");
	
	      component.$update(function(data){
	        data.todos.push({content: "hello3"})
	      })
	
	      expect($("td",container).length).to.equal(6);
	      destroy(component, container);
	
	    })
	
	    it("list should get the parent's directive", function(){
	      var container = document.createElement('table')
	      var num = 0;
	      var Component = Regular.extend({})
	        .directive('r-name', function(elem, value){
	          num++;
	        })
	      var component = new Component({
	        template: "{#list 1..2 as num}<div r-name='name'>haha</div>{/list}"
	      }).$inject(container)
	
	      expect(num).to.equal(2);
	
	      destroy(component, container);
	    })
	    it("component in list should works as expect", function(){
	      var container = document.createElement('div')
	      var num = 0;
	      var Component = Regular.extend({})
	        .directive('r-name', function(elem, value){
	          num++;
	        })
	
	      var Item = Regular.extend({
	        template: "<p>{item}</p>",
	        name: 'item'
	      })
	      var component = new Regular({
	        data: {items: ["item1", "item2"]} ,
	        template: "{#list items as item}<item item={item} />{/list}"
	      }).$inject(container)
	
	      expect($("p",container).length).to.equal(2);
	      expect($("p", container)[0].innerHTML).to.equal("item1");
	      expect($("p", container)[1].innerHTML).to.equal("item2");
	
	      component.$update(function(data){
	        data.items.push("item3");
	        data.items[0] = "item11";
	      })
	      expect($("p",container).length).to.equal(3);
	      expect($("p", container)[0].innerHTML).to.equal("item11");
	      expect($("p", container)[2].innerHTML).to.equal("item3");
	
	      destroy(component, container);
	    })
	
	    var container = document.createElement('div')
	    
	    it("input:checkbox in list should have correct type", function(){
	      var List = Regular.extend({
	        template: "<div>{#list items as item}<input type='checkbox' class='1' >{/list}</div>"
	      });
	
	      var component = new List({
	        data: {
	          items: [1,2,3,4]
	        }
	      }).$inject(container)
	
	      var inputs = nes.all("input", container);
	      var types = inputs.map(function(node){
	        return node.type
	      })
	
	      expect(types).to.eql(["checkbox","checkbox","checkbox","checkbox"])
	
	      destroy(component, container);
	
	
	    })
	
	    it("array change from Array back to undefined, should not throw undefined", function(){
	      var list = new Regular({
	        template: "<div ref=cnt>{#list items as item}<p>{item}</p>{/list}</div>",
	        data: {items: [1]}
	      })
	      expect(nes.all("p", list.$refs.cnt).length).to.equal(1);
	      list.$update("items", undefined);
	      expect(nes.all("p", list.$refs.cnt).length).to.equal(0);
	
	
	
	    })
	
	
	      it("item in list should not emit ,init, update or destroy to outerComponent", function(){
	      var List = Regular.extend({
	        template: "{#list items as item}<div>{item}</div>{/list}"
	      })
	      var initTimes = 0;
	      var destroyTimes = 0;
	      var updateTimes = 0;
	      var component = new List({
	        data: {
	          items: [1,2,3]
	        },
	        events: {
	          $init: function(){
	            initTimes++
	          },
	          $destroy: function(){
	            destroyTimes++
	          },
	          $update: function(){
	            updateTimes++
	          }
	        }
	      })
	
	      expect(initTimes).to.equal(1);
	      expect(destroyTimes).to.equal(0);
	      // expect(updateTimes).to.equal(1);
	
	      component.$update(function(data){
	        data.items.pop();
	      })
	      
	      expect(initTimes).to.equal(1);
	      expect(destroyTimes).to.equal(0);
	      expect(updateTimes).to.equal(1);
	
	      component.destroy();
	
	    })
	
	
	  it("list in list should not thorw error , when both of them are update", function(){
	    // beacuse if not record.
	    var List = Regular.extend({
	      template: "<div ref=cnt>{#list list1 as it1}<ul>{#list list2 as it2}{it2}{/list}</ul>{/list}</div>",
	      data: {list1:[1], list2: [2]}
	    })
	    var list = new List;
	
	    list.data.list1 = [];
	    list.data.list2 = [];
	    list.$update()
	
	    expect(nes.all('ul',list.$refs.cnt).length).to.equal(0);
	
	    list.destroy();
	
	  })
	  it("list with else", function(){
	
	
	
	    var List = Regular.extend({
	      template: '<div ref=cnt>{#list list as item}<div>{item}</div>{#else}<p>nothing{list.length}</p>{/list}</div>'
	    })
	
	    var list1 = new List({data: {list: []}})
	    var list2 = new List({data: {list: [1]}})
	
	    expect(nes.all('div',list1.$refs.cnt).length).to.equal(0);
	    var ps = nes.all('p',list1.$refs.cnt)
	    expect(ps.length).to.equal(1);
	    expect(ps[0].innerHTML).to.equal('nothing0')
	
	    expect(nes.all('div',list2.$refs.cnt).length).to.equal(1);
	    var ps = nes.all('p',list2.$refs.cnt)
	    expect(ps.length).to.equal(0);
	
	    list1.$update('list', [1,2,3])
	    expect(nes.all('div',list1.$refs.cnt).length).to.equal(3);
	    var ps = nes.all('p',list1.$refs.cnt)
	    expect(ps.length).to.equal(0);
	
	    list1.$update('list', [])
	    expect(nes.all('div',list1.$refs.cnt).length).to.equal(0);
	    var ps = nes.all('p',list1.$refs.cnt)
	    expect(ps.length).to.equal(1);
	    expect(ps[0].innerHTML).to.equal('nothing0')
	
	    list1.destroy()
	    list2.destroy()
	
	  })
	it("list with else should also works under track mode", function(){
	
	  var List = Regular.extend({
	    template: '<div ref=cnt>{#list list as item by item_index}<div>{item}</div>{#else}<p>nothing{list.length}</p>{/list}</div>'
	  })
	
	  var list1 = new List({data: {list: []}})
	  var list2 = new List({data: {list: [1]}})
	
	  expect(nes.all('div',list1.$refs.cnt).length).to.equal(0);
	  var ps = nes.all('p',list1.$refs.cnt)
	  expect(ps.length).to.equal(1);
	  expect(ps[0].innerHTML).to.equal('nothing0')
	
	  expect(nes.all('div',list2.$refs.cnt).length).to.equal(1);
	  var ps = nes.all('p',list2.$refs.cnt)
	  expect(ps.length).to.equal(0);
	
	  list1.$update('list', [1,2,3])
	  expect(nes.all('div',list1.$refs.cnt).length).to.equal(3);
	  var ps = nes.all('p',list1.$refs.cnt)
	  expect(ps.length).to.equal(0);
	
	  list1.$update('list', [])
	  expect(nes.all('div',list1.$refs.cnt).length).to.equal(0);
	  var ps = nes.all('p',list1.$refs.cnt)
	  expect(ps.length).to.equal(1);
	  expect(ps[0].innerHTML).to.equal('nothing0')
	
	  list1.destroy()
	  list2.destroy()
	
	})
	
	
	
	  // 即如果全量更新的话， 外部list的属性也应该可以正确响应
	  // 
	  it("ref to outer of list should update correctly", function(){
	    // beacuse if not record.
	    var ListView = Regular.extend({
	      template: "<div ref=cnt>{#list databases as db}<h2>{db.name}</h2>\
	          {#list db.list as query}\
	            <span>{db.name}</span>\
	          {/list}{/list}</div>",
	      config: function(data) {
	        data.databases = [{ list: [1], name: 'hzzhenghaibo' }];
	      }
	    });
	
	    var list = new ListView();
	
	
	
	    // init correctly
	    var h2s = nes.all('h2',list.$refs.cnt);
	    expect(h2s.length).to.equal(1);
	    var spans = nes.all('span',list.$refs.cnt);
	    expect(spans.length).to.equal(1);
	    expect(h2s[0].innerHTML).to.equal('hzzhenghaibo');
	    expect(spans[0].innerHTML).to.equal('hzzhenghaibo');
	
	
	    list.data.databases[0].name = 'leeluolee'
	    list.$update()
	    // changed partial
	    var spans = nes.all('span',list.$refs.cnt);
	    expect(spans.length).to.equal(1);
	    expect(spans[0].innerHTML).to.equal('leeluolee');
	    // whote changed
	
	    list.data.databases = [{list:[1], name: 'luobo'}]
	    list.$update()
	    var spans = nes.all('span',list.$refs.cnt);
	    expect(spans.length).to.equal(1);
	    expect(spans[0].innerHTML).to.equal('luobo');
	
	    list.destroy()
	  })
	
	
	  })
	
	  describe("List track", function(){
	
	
	    it("list with track item_index should work as expected", function(){
	      var List = Regular.extend({
	        template: '<div ref=cnt>{#list list as item by item_index}\
	          <div>{item.a}</div>{/list}</div>'
	      })
	
	      var list = new List({
	        data: {
	          list: [{a: 1},{a: 2} , {a: 3}]
	        }
	      })
	      var divs = nes.all('div', list.$refs.cnt);
	
	      list.data.list = [{a: 4},{a: 5} , {a: 6}]
	      list.$update();
	
	      var divs2 = nes.all('div', list.$refs.cnt);
	
	      expect(divs[0]).to.equal(divs2[0]);
	      expect(divs[0].innerHTML).to.equal('4');
	      expect(divs[1]).to.equal(divs2[1]);
	      expect(divs[1].innerHTML).to.equal('5');
	      expect(divs[2]).to.equal(divs2[2]);
	      expect(divs[2].innerHTML).to.equal('6');
	
	    })
	    it("list track constant will be consider as same as index", function(){
	      var List = Regular.extend({
	        template: '<div ref=cnt>{#list list as item by 1}\
	          <div>{item.a}</div>{/list}</div>'
	      })
	      var list = new List({
	        data: {
	          list: [{a: 1},{a: 2} , {a: 3}]
	        }
	      })
	
	      var divs = nes.all('div', list.$refs.cnt);
	      list.data.list = [{a: 4},{a: 5} , {a: 6}]
	      list.$update();
	
	      var divs2 = nes.all('div', list.$refs.cnt);
	
	      expect(divs[0]).to.equal(divs2[0]);
	      expect(divs[0].innerHTML).to.equal('4');
	      expect(divs[1]).to.equal(divs2[1]);
	      expect(divs[1].innerHTML).to.equal('5');
	      expect(divs[2]).to.equal(divs2[2]);
	      expect(divs[2].innerHTML).to.equal('6');
	
	
	
	    })
	
	    it("list with no track should rebuild each group when data changes", function(){
	      var List = Regular.extend({
	        template: '<div ref=cnt>{#list list as item}\
	          <div>{item.a}</div>{/list}</div>'
	      })
	
	      var list = new List({
	        data: {
	          list: [{a: 1},{a: 2} , {a: 3}]
	        }
	      })
	      var divs = nes.all('div', list.$refs.cnt);
	
	      list.data.list = [{a: 4},{a: 5} , {a: 6}]
	      list.$update();
	
	      var divs2 = nes.all('div', list.$refs.cnt);
	
	      expect(divs[0]).to.not.equal(divs2[0]);
	      expect(divs[1]).to.not.equal(divs2[1]);
	      expect(divs[2]).to.not.equal(divs2[2]);
	    })
	
	    it("list track non-index expression" , function(){
	      var List = Regular.extend({
	        template: '<div ref=cnt>{#list list as item by item.a}\
	          <div>{item.a}</div>{/list}</div>'
	      })
	      var list = new List({
	        data: {
	          list: [{a: 1}, {a: 2} , {a: 3}]
	        }
	      })
	      var divs = nes.all('div', list.$refs.cnt);
	
	      list.data.list = [{a: 4},{a: 2} , {a: 6}]
	      list.$update();
	
	      var divs2 = nes.all('div', list.$refs.cnt);
	
	      expect(divs[0]).to.not.equal(divs2[0]);
	      expect(divs[1]).to.equal(divs2[1]);
	      expect(divs[2]).to.not.equal(divs2[2]);
	
	    })
	    it("list track non-index expression" , function(){
	      var List = Regular.extend({
	        template: '<div ref=cnt>{#list list as item by item.a}\
	          <div>{item.a}</div>{/list}</div>'
	      })
	      var list = new List({
	        data: {
	          list: [{a: 1}, {a: 2} , {a: 3}]
	        }
	      })
	      var divs = nes.all('div', list.$refs.cnt);
	
	      list.data.list = [{a: 4},{a: 2} , {a: 6}]
	      list.$update();
	
	      var divs2 = nes.all('div', list.$refs.cnt);
	
	      expect(divs[0]).to.not.equal(divs2[0]);
	      expect(divs[1]).to.equal(divs2[1]);
	      expect(divs[2]).to.not.equal(divs2[2]);
	
	    })
	  })
	
	  describe("List with Object", function(){
	
	    var obj = {
	      "xiaomin": {age:11},
	      "xiaoli": {age:12},
	      "xiaogang": {age:13}
	    }
	    var arr = [
	      {age:11},
	      {age:12},
	      {age:13}
	    ]
	
	    var ComplexList = Regular.extend({
	        template: "<div ref=container>\
	          {#list json as item}\
	            <div>{item.age}:{item_key}:{item_index}</div>\
	          {/list}\
	        </div>"
	    })
	
	
	    it("items should list by Object.keys", function( ){
	
	      var component = new Regular({
	        template: "<div ref=container>\
	          {#list json as item by item_key}\
	            <div>{item.age}:{item_key}:{item_index}</div>\
	          {/list}\
	        </div>",
	        data: {
	          json: {
	            "xiaomin": {age:11},
	            "xiaoli": {age:12},
	            "xiaogang": {age:13}
	          }
	        }
	      })
	
	      // only make sure 
	      var json = component.data.json;
	      var keys = _.keys(json);
	
	      var divs =  nes.all('div', component.$refs.container );
	
	      expect(divs.length).to.equal(3);
	
	      divs.forEach(function(div, index){
	        expect(div.innerHTML).to.equal('' + json[ keys[index] ].age + ':' + keys[index] + ':' + index);
	      })
	
	      delete json.xiaomin;
	      json.xiaoli = {age: 33}
	
	      component.$update();
	
	      divs =  nes.all('div', component.$refs.container );
	
	      expect(divs.length).to.equal(2);
	
	      expect(divs[0].innerHTML).to.equal('33:xiaoli:0')
	
	      component.destroy();
	
	
	
	    })
	    it("items should works under complex mode: item_index & item_key & item", function( ){
	
	      var component = new ComplexList({
	        data: {
	          json: {
	            "xiaomin": {age:11},
	            "xiaoli": {age:12},
	            "xiaogang": {age:13}
	          }
	        }
	      })
	
	      // only make sure 
	      var json = component.data.json;
	      var keys = _.keys(json);
	
	      var divs =  nes.all('div', component.$refs.container );
	
	      expect(divs.length).to.equal(3);
	
	      divs.forEach(function(div, index){
	        expect(div.innerHTML).to.equal('' + json[ keys[index] ].age + ':' + keys[index]+ ':' + index);
	      })
	
	      delete json.xiaomin;
	      json.xiaoli = {age: 33}
	
	      component.$update();
	
	      divs =  nes.all('div', component.$refs.container );
	
	      expect(divs.length).to.equal(2);
	
	      expect(divs[0].innerHTML).to.equal('33:xiaoli:0')
	      expect(divs[1].innerHTML).to.equal('13:xiaogang:1')
	
	      component.destroy();
	
	
	    })
	
	    it("items converted from Object to Array", function(){
	      var component = new ComplexList({
	        data: { json: obj }
	      })
	
	      component.$update('json', arr)
	
	      divs =  nes.all('div', component.$refs.container );
	
	      expect(divs.length).to.equal(3);
	
	      divs.forEach(function(div, index){
	        expect(div.innerHTML).to.equal('' + arr[index].age  + '::' + index);
	      })
	
	      component.destroy();
	      
	    })
	    it("items converted from Array to Object", function(){
	
	      var component = new ComplexList({
	        data: { json: arr }
	      })
	
	      var divs =  nes.all('div', component.$refs.container );
	      var keys = _.keys(obj);
	
	      expect(divs.length).to.equal(3);
	
	      divs.forEach(function(div, index){
	        expect(div.innerHTML).to.equal('' + arr[index].age  + '::' + index);
	      })
	
	      
	      component.$update('json', obj )
	      divs =  nes.all('div', component.$refs.container );
	      divs.forEach(function(div, index){
	        expect(div.innerHTML).to.equal('' + arr[index].age  + ':'+keys[index]+':' + index);
	      })
	
	      component.destroy();
	    })
	    it("items converted from null to Object", function(){
	
	      var component = new ComplexList({
	        data: { json: null }
	      })
	      var divs =  nes.all('div', component.$refs.container );
	      var keys = _.keys(obj);
	      expect(divs.length).to.equal(0);
	
	      component.$update('json', obj )
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(3);
	      component.destroy();
	    })
	    it("items converted from Object to null", function(){
	
	      var component = new ComplexList({
	        data: { json: obj }
	      })
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(3);
	      var keys = _.keys(obj);
	
	      component.$update('json', null )
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(0);
	
	      component.destroy();
	
	    })
	    it("items converted from Object to other dataType", function(){
	
	      var component = new ComplexList({
	        data: { json: obj }
	      })
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(3);
	      var keys = _.keys(obj);
	
	      component.$update('json', 100 )
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(0);
	
	      component.destroy();
	    })
	    it("items converted from  other dataType to Object", function(){
	
	      var component = new ComplexList({
	        data: { json: true }
	      })
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(0);
	      var keys = _.keys(obj);
	
	      component.$update('json', obj )
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(3);
	
	      component.destroy();
	    })
	
	    it("items key should update if only value is changed", function(){
	
	      var raw =  {a: {age: 1}, b:{age: 2}, c:{age:3}};
	      var component = new ComplexList({
	        data: { json: raw}
	      })
	
	      raw.b = raw.a;
	      delete raw.a;
	      component.$update();
	
	      expect(component.$refs.container)
	
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(2);
	      var keys = _.keys(raw);
	
	      divs.forEach(function(div, index){
	        expect(div.innerHTML).to.equal('' + raw[keys[index]].age  + ':'+keys[index]+':' + index);
	      })
	
	
	    })
	
	    it("list Object also accept #else stateman", function(){
	      var component = new Regular({
	        template: "<div ref=container>\
	          {#list json as item by item_key}\
	            <div>{item.age}:{item_key}:{item_index}</div>\
	          {#else} <div id='notfound'></div>\
	          {/list}\
	        </div>",
	        data: { json: obj}
	      })
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(3);
	      component.$update('json', null);
	
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(1);
	      expect(divs[0].id).to.equal('notfound');
	
	      component.$update('json', arr);
	      var divs =  nes.all('div', component.$refs.container );
	      expect(divs.length).to.equal(3);
	
	    })
	
	  })
	
	
	})
	
	describe("SSR: list", function(){
	  it("basic usage of ssr with list", function( ){
	    var container = document.createElement('div');
	    var Component = Regular.extend({
	      template: "<div ref=container>\
	        {#list json as item by item_key}\
	          <div class='item'>{item.age}:{item_index}</div>\
	        {#else} <div id='notfound'></div>\
	        {/list}\
	      </div>"
	    });
	
	
	    container.innerHTML = SSR.render(Component);
	
	    var component = new Component({
	      mountNode: container
	    })
	
	    expect(nes('.item', container).length).to.equal(0);
	    expect(nes('div', container).length).to.equal(1);
	
	    component.$update('json', [
	      { age: 10 },
	      { age: 20 }
	    ])
	
	    expect(nes('.item', container).length).to.equal(2);
	    expect(nes.one('.item', container).innerHTML).to.equal('10:0');
	
	  })
	
	  it("should handle common xss error", function(){
	
	    var container = document.createElement('div');
	    var Component = Regular.extend({
	        template: "<div ref=container>\
	        <div class='item' onerror={onerror}> {script}</div>\
	        </div>",
	        data: {
	          onerror: "><script>alert(1000)</script>",
	          script: "test2</a><img src=# onerror='alert(1)'>"
	        }
	    })
	    expect(function(){
	      new Component();
	    }).to.not.throwError();
	
	    var html = SSR.render(Component);
	
	    container.innerHTML = html
	
	    expect(function(){
	      new Component({
	        mountNode: container
	      })
	    }).to.not.throwError();
	
	  })
	})
	
	
	
	
	
	
	
	
	
	


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	
	
	var dom = __webpack_require__(17);
	var Regular = __webpack_require__(16);
	
	var container = document.createElement('div');
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	
	
	describe("If", function(){
	  describe("basic usage", function(){
	    it("use if standalone should work correctly", function(){
	
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "{#if test}<div>test</div>{/if}",
	        data: {test: true}
	      }).$inject(container);
	
	
	      expect($("div",container).length).to.equal(1);
	
	      component.$update("test", false);
	      expect($("div",container).length).to.equal(0);
	
	      destroy(component, container)
	    })
	
	    it("regular should convert value to boolean", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "{#if test}<div>test</div>{/if}",
	        data: {test: 0}
	      }).$inject(container);
	
	      expect($("div",container).length).to.equal(0);
	      component.$update("test", 1);
	
	      expect($("div",container).length).to.equal(1);
	
	      destroy(component, container)
	    })
	
	
	    it("use if else should work correctly", function(){
	
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "{#if test}<div>test</div>{#else}<div>altname</div>{/if}"
	      }).$inject(container);
	
	      expect($("div",container).length).to.equal(1);
	      expect($("div",container).html()).to.equal("altname");
	      component.$update("test", 1);
	      expect($("div",container).length).to.equal(1);
	      expect($("div",container).html()).to.equal("test");
	
	      destroy(component, container)
	
	    })
	
	    it("use if elseif should work", function(){
	
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "{#if test > 5}<div>test</div>{#elseif test<2}<div>altname</div>{/if}",
	        data: {test: 1}
	      }).$inject(container);
	
	
	      expect($("div",container).length).to.equal(1);
	      expect($("div",container).html()).to.equal("altname");
	      component.$update("test", 6);
	      expect($("div",container).length).to.equal(1);
	      expect($("div",container).html()).to.equal("test");
	      component.$update("test", 4);
	      expect($("div",container).length).to.equal(0);
	
	      destroy(component, container)
	    })
	
	    it("use if elseif else should work correctly", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "{#if test > 5}<div>test</div>{#elseif test<2}<div>altname</div>{#else}<div>altname2</div>{/if}",
	        data: {test: 1}
	      }).$inject(container);
	
	      expect($("div",container).length).to.equal(1);
	      expect($("div",container).html()).to.equal("altname");
	      component.$update("test", 6);
	      expect($("div",container).length).to.equal(1);
	      expect($("div",container).html()).to.equal("test");
	      component.$update("test", 4);
	      expect($("div",container).length).to.equal(1);
	      expect($("div",container).html()).to.equal("altname2");
	
	      destroy(component, container)
	
	    })
	
	    it("use if elseif should equal with if else if", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "{#if test > 5}<div>test</div>{#else}{#if test<2}<div>altname</div>{#else}<div>altname2</div>{/if}{/if}",
	        data: {test: 1}
	      }).$inject(container);
	
	      expect($("div",container).length).to.equal(1);
	      expect($("div",container).html()).to.equal("altname");
	      component.$update("test", 6);
	      expect($("div",container).length).to.equal(1);
	      expect($("div",container).html()).to.equal("test");
	  
	
	      destroy(component, container)
	
	    })
	
	    it("if destroy should remove bind watchers", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "{#if test > 5}<div>{test} {hello}</div>{#else}<div>{hello}</div>{/if}",
	        data: { test: 1 }
	      }).$inject(container);
	
	      expect(component._watchers.length).to.equal(2)
	
	      component.$update('test', 6);
	
	      expect(component._watchers.length).to.equal(3)
	      component.$update('test', 0);
	
	      expect(component._watchers.length).to.equal(2)
	      destroy(component, container);
	    })
	
	    it("nested if destroy should remove bind watchers", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "{#if test > 5}{#if test < 8}<div>{test} {hello}</div>{/if}{/if}",
	        data: { test: 6 }
	      }).$inject(container);
	
	      expect(component._watchers.length).to.equal(4);
	
	      component.$update("test", 10);
	      expect(component._watchers.length).to.equal(2);
	      component.$update("test", 6);
	      expect(component._watchers.length).to.equal(4);
	      component.$update("test", 10);
	      expect(component._watchers.length).to.equal(2);
	
	      destroy(component, container)
	    })
	
	  })
	
	  describe("If combine with attribute", function(){
	    it("other rule expect if should throw error when pass in tag", function(){
	      expect(function(){
	        new Parser("<div {#list xx as x}ng-repeat{/list}>").parse();
	      }).to.throwError();
	    })
	    it("if should toggle the basic attribute", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "<div {#if test}class='name' title='noname'{/if} data-haha=name >haha</div>",
	        data: { test: 0 }
	      }).$inject(container);
	
	      var $node = $("div[data-haha]",container)
	      expect($node.length).to.equal(1);
	      expect($node[0].className).to.equal("");
	      expect($node.attr("title")).to.equal(undefined);
	      component.$update("test", 10);
	      expect($node[0].className).to.equal("name");
	      expect($node.attr("title")).to.equal("noname");
	      component.$update("test", 0);
	      expect($node[0].className).to.equal("");
	      expect($node.attr("title")).to.equal(undefined);
	      expect($node.attr("data-haha")).to.equal("name");
	      destroy(component, container);
	    })
	
	    it("if combine with unassigned attribute should work correctly", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "<div {#if test}ng-repeat disabled{/if}  class='hello' >haha</div>",
	        data: { test: 0 }
	      }).$inject(container);
	
	      var $node = $("div.hello",container)
	      expect($node.length).to.equal(1);
	      expect($node.attr("ng-repeat")).to.equal(undefined);
	      component.$update("test", 10);
	      expect($node.attr("ng-repeat")).to.equal('');
	      component.$update("test", 0);
	      expect($node.attr("ng-repeat")).to.equal(undefined);
	      destroy(component, container);
	    })
	
	
	    it("if combine with inteplation attribute should work correctly", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "<div {#if test}ng-repeat={name}{/if} class='hello' >haha</div>",
	        data: { test: 0 , name: 'hahah'}
	      }).$inject(container);
	
	      var $node = $("div.hello",container)
	      expect($node.length).to.equal(1);
	      expect($node.attr("ng-repeat")).to.equal(undefined);
	      expect(component._watchers.length).to.equal(1);
	      component.$update("test", 10);
	      expect($node.attr("ng-repeat")).to.equal("hahah");
	      expect(component._watchers.length).to.equal(2);
	      component.$update("test", 0);
	      expect($node.attr("ng-repeat")).to.equal(undefined);
	      expect(component._watchers.length).to.equal(1);
	      destroy(component, container);
	    })
	
	    it("if combine with event should work correctly", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "<div {#if test}ng-repeat={name}{/if} class='hello' >haha</div>",
	        data: { test: 0 , name: 'hahah'}
	      }).$inject(container);
	    })
	    it("if combine with custom event should work correctly", function(){
	      var container = document.createElement('div');
	      var Component = Regular.extend();
	      var i=0;
	      Component.event('hello', function(elem, fire){
	        i = 1
	        dom.on(elem, 'click', fire)
	        return function(){
	          i = 0;
	          dom.off(elem, 'click', fire)
	        }
	      })
	      var component = new Component({
	        template: "<div {#if test}on-hello={name=name+1}{/if} class='hello' >haha</div>",
	        data: { test: 0 , name: 'hahah'}
	      }).$inject(container);
	      var node = nes.one("div", container);
	      expect(i).to.equal(0);
	      component.$update("test", 10);
	
	      expect(i).to.equal(1);
	      expect(component.data.name).to.equal("hahah");
	
	      dispatchMockEvent(node, 'click');
	      expect(component.data.name).to.equal("hahah1");
	
	      expect(component._watchers.length).to.equal(1)
	
	      component.$update("test", 0);
	      expect(i).to.equal(0);
	
	      destroy(component, container);
	    })
	
	    it("if combine with event , the watchers should be automately removed", function(){
	      var container = document.createElement('div');
	      var Component = Regular.extend();
	      Component.event('hello', function(elem, fire){
	        this.$watch("hello", function(){})
	      })
	
	      var component = new Component({
	        template: "<div {#if test}on-hello={name=name+1}{/if} class='hello' >haha</div>",
	        data: { test: 0 , name: 'hahah'}
	      }).$inject(container);
	
	      expect(component._watchers.length).to.equal(1)
	      component.$update("test", 10);
	      expect(component._watchers.length).to.equal(2)
	      component.$update("test", 0);
	      expect(component._watchers.length).to.equal(1)
	    })
	
	    it("if combine with directive should work correctly", function(){
	      var container = document.createElement('div');
	      var Component = Regular.extend();
	      var i = 0;
	      Component.directive('t-hello', function(elem, fire){
	        this.$watch('name', function(){
	          i++;
	        })
	      })
	      var component = new Component({
	        template: "<div {#if test} t-hello='haha'{/if} class='hello' >haha</div>",
	        data: { test: 0 , name: 'hahah'}
	      }).$inject(container);
	
	      expect(i).to.equal(0);
	      component.$update("test", 10);
	      expect(i).to.equal(1);
	      component.$update("name", 10);
	      expect(i).to.equal(2);
	      component.$update("test", 10);
	      component.$update("name", 10);
	      expect(i).to.equal(2);
	      destroy(component, container)
	    })
	
	    it("when switch if state, the watcher should distroy automately", function(){
	      var container = document.createElement('div');
	      var Component = Regular.extend();
	      Component.directive('t-hello', function(elem, fire){
	        this.$watch("hello", function(){})
	      })
	      var component = new Component({
	        template: "<div {#if test} t-hello='haha'{/if} class='hello' >haha</div>",
	        data: { test: 0 , name: 'hahah'}
	      }).$inject(container);
	      expect(component._watchers.length).to.equal(1)
	      component.$update("test", 10);
	      expect(component._watchers.length).to.equal(2)
	      component.$update("test", 0);
	      expect(component._watchers.length).to.equal(1)
	
	      destroy(component, container)
	
	    })
	
	    it("if else combine with attribute should work as expect", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "<div {#if test} title='haha' {#else} title2='haha2' {/if} class='hello' >haha</div>",
	        data: { test: 1 , name: 'hahah'}
	      }).$inject(container);
	      var $node = $("div.hello",container)
	      expect($node.attr("title")).to.equal("haha");
	      expect($node.attr("title2")).to.equal(undefined);
	      component.$update("test", 0)
	      expect($node.attr("title")).to.equal(undefined);
	      expect($node.attr("title2")).to.equal("haha2");
	
	      destroy(component, container);
	    })
	    it("if elseif combine with attribute should work as expect", function(){
	      var container = document.createElement('div');
	      var component = new Regular({
	        template: "<div {#if test} title='haha' {#elseif name} title2='haha2' {/if} class='hello' >haha</div>",
	        data: { test: 0 , name: 'hahah'}
	      }).$inject(container);
	
	      var $node = $("div.hello",container)
	      expect($node.attr("title")).to.equal(undefined);
	      expect($node.attr("title2")).to.equal("haha2");
	      
	      component.$update("test", true)
	      expect($node.attr("title2")).to.equal(undefined);
	      expect($node.attr("title")).to.equal("haha");
	
	
	      destroy(component, container);
	    })
	    it("if/list combine with attribute should work as expect", function(){
	      var container = document.createElement('div');
	
	      var component = new Regular({
	        template: "<div ref=a  class='hello' >{#list list as a }<div {#if a.id} title={a.id} {#else} title=0 {/if}>title</div>{/list}</div>",
	        data: { test: 1 , list: [{id: 10}, {id:null}, {id:11}]}
	      }).$inject(container);
	      var node = component.$refs.a;
	      var divs = nes('div', node);
	      expect(divs.length).to.equal(3);
	      expect(divs[2].title).to.equal("11");
	      expect(divs[1].title).to.equal("0");
	      expect(divs[0].title).to.equal("10");
	      // var $node = $(component.$refs.a)
	      // expect($node.attr("title")).to.equal("haha");
	      // expect($node.attr("title2")).to.equal(undefined);
	      // component.$update("name", true)
	      // expect($node.attr("title2")).to.equal("haha2");
	
	      destroy(component, container);
	
	    })
	    it("if elseif else combine with attribute should work as expect", function(){
	      var container = document.createElement('div');
	
	      var component = new Regular({
	        template: "<div {#if test} title='haha' {#elseif name} title2='haha2' {#else} title3='haha3' {/if} class='hello' >haha</div>",
	        data: { test: 1 , name: ''}
	      }).$inject(container);
	      var $node = $("div.hello",container)
	
	      expect($node.attr("title")).to.equal("haha");
	      expect($node.attr("title2")).to.equal(undefined);
	      expect($node.attr("title3")).to.equal(undefined);
	
	      component.$update("test", false)
	      component.$update("name", true)
	      expect($node.attr("title")).to.equal(undefined);
	      expect($node.attr("title2")).to.equal("haha2");
	      expect($node.attr("title3")).to.equal(undefined);
	
	      component.$update("test", false)
	      component.$update("name", false)
	      expect($node.attr("title3")).to.equal("haha3");
	      expect($node.attr("title")).to.equal(undefined);
	      expect($node.attr("title2")).to.equal(undefined);
	
	      destroy(component, container);
	
	    })
	
	  })
	})
	
	
	


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	var Regular = __webpack_require__(16);
	
	var container = document.createElement('div');
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	
	describe("Dynamic include", function(){
	  var Component = Regular.extend();
	  it("#include should compile value at runtime correctly", function(){
	    var container = document.createElement('div');
	    var component = new Regular({
	      template: "<div>{#include content}</div>",
	      data: {content: "<div>{name}</div>", name: "hello"}
	    }).$inject(container);
	
	    var $node = $("div", container);
	    expect($("div", container).length).to.equal(2);
	    expect($node[1].innerHTML).to.equal("hello");
	
	    destroy(component, container)
	
	  })
	
	  it("#include should recompile template when changed", function(){
	    var container = document.createElement('div');
	    var component = new Regular({
	      template: "<div>{#include content}</div>",
	      data: {content: "<div>{name}</div>", name: "hello"}
	    }).$inject(container);
	
	    var $node = $("div", container);
	    expect($("div", container).length).to.equal(2);
	
	    component.$update("content", "<span>{name + '2'}</span>");
	
	    expect($("div", container).length).to.equal(1);
	    expect($("span", container).html()).to.equal("hello2");
	
	    destroy(component, container)
	
	  })
	
	  it("if body has been a ast, there should be not watch binding", function(){
	    var container = document.createElement('div');
	    var component = new Regular({
	      template: "<div>{#include content}</div>",
	      data: {content: Regular.parse("<div>{name}</div>"), name: "hello"}
	    }).$inject(container);
	
	    var $node = $("div", container);
	    expect($("div", container).length).to.equal(2);
	
	    component.$update("content", "<span>{name + '2'}</span>");
	
	    expect($("div", container).length).to.equal(1);
	    expect($("span", container).html()).to.equal("hello2");
	
	    destroy(component, container)
	
	  })
	  it("nest should be as a special propertie $body", function(){
	    var Component = Regular.extend({
	      name: "test-body",
	      template: "{#list list as item}<div>{#include this.$body}</div>{/list}"
	    });
	    var container = document.createElement('div');
	    var component = new Component({
	      template: "<test-body list={list}><span>{list.length}:{list[0]}</span></test-body>",
	      data: {list: ["hello", "name"]}
	    }).$inject(container);
	
	    var nodes = nes.all("span", container);
	    expect(nodes.length).to.equal(2);
	    expect(nodes[0].innerHTML).to.equal("2:hello");
	    
	    destroy(component, container)
	
	  })
	  it("include can pass anything that compiled to Group", function(){
	    var Component = Regular.extend({});
	    var container = Regular.dom.create('div');
	    var Nested = Component.extend({
	      name: 'nested',
	      template: '<div><div class="head">{#inc hd}</div><div class="body">{#inc this.$body}</div><div class="foot">{#inc ft}</div></div>',
	      config: function(data){
	        data.head = 'InnerHEAD'
	        data.foot = 'InnerFoot'
	      }
	    })
	    var component = new Component({
	      template: '<nested hd.cmpl="<p>{head}</p>>" ft={"<p>{foot}</p>"}><strong>{head + foot}</strong></nested>',
	      data: {head: 'OuterHead', foot: 'OuterFoot'}
	    }).$inject(container);
	
	
	
	    var head = nes.one('.head p', container);
	    var foot = nes.one('.foot p', container);
	    var body = nes.one('.body strong', container);
	
	    expect(head.innerHTML).to.equal('OuterHead');
	    expect(foot.innerHTML).to.equal('InnerFoot');
	    expect(body.innerHTML).to.equal('OuterHeadOuterFoot');
	
	    component.$update('head', 'OuterUpdate');
	    expect(head.innerHTML).to.equal('OuterUpdate');
	
	
	    destroy(component, container)
	  })
	
	 it("group switch twice works as expect", function(){
	    var container = Regular.dom.create('div');
	    var Nested = Component.extend({
	      name: 'nested',
	      template: '<div>{head}</div>',
	      config: function(data){
	        data.head = 'InnerHEAD'
	        data.foot = 'InnerFoot'
	      }
	    })
	    var component = new Component({
	      template: '<div class="body">{#inc body || this.$refs.nested.$body}</div><nested ref=nested ><strong>InnerBody</strong></nested>',
	      data: {head: 'OuterHead'}
	    }).$inject(container);
	
	    var body = nes.one('.body strong', container);
	
	    expect(body.innerHTML).to.equal('InnerBody')
	    component.$update('body', '<strong>OuterBody</strong>')
	    var body = nes.one('.body strong', container);
	    component.$update('body', null)
	    var body = nes.one('.body strong', container);
	    expect(body.innerHTML).to.equal('InnerBody')
	  
	    destroy(component, container)
	 })
	 it("extra should pass to Component", function(){
	    var container = Regular.dom.create('div');
	    var Nested = Component.extend({
	      name: 'nested',
	      template: '<div>{head}</div>',
	      config: function(data){
	        data.head = 'InnerHEAD'
	        data.foot = 'InnerFoot'
	      }
	    })
	
	    var component = new Component({
	      template: '<div class="body">{#inc this.$refs.nested.$body}</div>{#list [1] as item}<nested ref=nested ><strong>{item}</strong></nested>{/list}'
	    }).$inject(container);
	
	    var body = nes.one('.body strong', container);
	
	    expect(body.innerHTML).to.equal('1')
	    destroy(component, container)
	  
	 })
	 it("data.body is inner outer $body, if combine with {#inc body || this.$body} should not throw error during digest", function(){
	    var container = Regular.dom.create('div');
	    var Modal = Regular.extend({
	      name: 'modal',
	      // if body is exsits , this.$body will be destroied
	      template: '<div>{#inc body || this.$body}</div>'
	    })
	
	    Modal.body = Regular.extend({
	      name: 'modal.body',
	
	      init: function(){
	        // this.$outer point to modal
	        this.$outer.data['body'] = this.$body;
	      }
	    })
	
	    var component = new Regular({
	      template: '<div class="body"><modal><modal.body><p>{name}</p></modal.body></modal></div>{#list [1] as item}<nested ref=nested ><strong>{item}</strong></nested>{/list}',
	      data: {name: 'hzzhenghaibo'}
	    }).$inject(container);
	
	    var body = nes.one('.body p', container);
	
	    expect(body.innerHTML).to.equal('hzzhenghaibo')
	    destroy(component, container)
	  
	 })
	 // @REMOVE supoort for {#inc component}
	 // it("include can pass anything that compiled to Component", function(){
	 //    var Component = Regular.extend({});
	 //    var container = Regular.dom.create('div');
	 //    var Nested = Component.extend({
	 //      name: 'nested',
	 //      template: '<div class="nested">Nested</div>',
	 //      config: function(data){
	 //        data.head = 'InnerHEAD'
	 //        data.foot = 'InnerFoot'
	 //      }
	 //    })
	
	 //    var nested = new Nested()
	 //    var component = new Component({
	 //      template: '<div>{#inc component}</div>',
	 //      data: {component: nested }
	 //    }).$inject(container);
	
	
	
	 //    var nested = nes.one('.nested', container);
	
	 //    expect(nested.innerHTML).to.equal('Nested');
	
	 //    destroy(component, container)
	 //  })
	})
	
	


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	
	
	var Regular = __webpack_require__(16);
	
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	
	  
	describe("Directive", function(){
	  describe('Process', function(){
	    var container = document.createElement('div')
	    Regular.directive('t-html', function(elem, value){
	      this.$watch(value, function(nvalue){
	        elem.innerHTML = nvalue;
	      })
	    })
	    
	    it('registed directive should works on template', function(){
	      var component = new Regular({
	        template: "<div class='m-class' t-html='content'></div>",
	        data: {
	          content:'hello'
	        }
	      }).$inject(container)
	
	
	      expect($('.m-class', container).html()).to.equal(component.data.content)
	
	      component.$update('content', 30000)
	
	      expect($('.m-class', container).html()).to.equal('30000')
	      component.destroy();
	      expect(container.innerHTML).to.equal('');
	    })
	
	    it('unregister attribute should just act attribute-inteplation', function(){
	      var component = new Regular({
	        template: "<div class='m-class' t-invalid={content}></div>",
	        data: {
	          content:'hello'
	        }
	      }).$inject(container)
	
	
	      expect($('.m-class', container).attr('t-invalid')).to.equal(component.data.content)
	      component.$update('content', 'changed')
	      expect($('.m-class', container).attr('t-invalid')).to.equal('changed')
	      component.destroy();
	      expect(container.innerHTML).to.equal('');
	
	    })
	
	    it('const value should not pass Expression to directive', function(done){
	        var container = document.createElement('div');
	        var tmp  = (+new Date()).toString(36);
	        var Component = Regular.extend({
	          template: "<div constd = {1}></div>"
	        }).directive('constd', function(e, d){
	          expect(d).to.equal(1)
	          done()
	        })
	        var component = new Component({
	          data: {test: 0}
	        }).$inject(container);
	        destroy(component, container);
	    })
	
	    it('the expression passed in should touched already ', function(){
	      var tmpName = "t-" + Regular.util.uid();
	      Regular.directive(tmpName, function(elem, value){
	        expect(value.type).to.equal('expression')        
	        expect(value.get).to.be.a('function')
	        expect(value.set).to.be.a('function')
	      })
	      var component = new Regular({
	        template: "<div class='m-class' "+tmpName+"={content}></div>",
	        data: {
	          content:'hello'
	        }
	      }).$inject(container)
	    })
	
	    it('the whole attributes should be get in directive handler', function(done){
	      var tmpName = "t-" + Regular.util.uid();
	      Regular.directive(tmpName, function(elem, value, name, attrs){
	        expect(value.type).to.equal('expression')        
	        expect(value.get).to.be.a('function');
	        expect(value.set).to.be.a('function');
	        expect(attrs.length).to.equal(3);
	        done()
	      })
	      var component = new Regular({
	        template: "<div class='m-class' "+tmpName+"={content} t-randomAttr={1}></div>",
	        data: {
	          content:'hello'
	        }
	      })
	
	    })
	    it('the whole attributes should be get in event handler', function(done){
	      var tmpName = "on-upload2";
	      Regular.event("upload2", function(elem, fire, attrs){
	        expect(attrs.length).to.equal(3);
	        done()
	      })
	      var component = new Regular({
	        template: "<div class='m-class' on-upload2={content} t-randomAttr={1}></div>",
	        data: {
	          content:'hello'
	        }
	      })
	
	    })
	
	
	  })
	
	
	
	});
	
	describe('r-model directive', function(){
	
	
	  var container = document.createElement('form');
	
	  describe('text binding', function(){
	    it("input:email with 'model' directive should works as expect", function(){
	      var template = '<input type="email" value="87399126@163.com" r-model={email}><div>{email}</div>';
	      var component = new Regular({
	        template: template
	      }).$inject(container)
	
	
	      expect(nes.all('input', container).length).to.equal(1);
	      // expect($('div', container).html()).to.equal('87399126@163.com')
	
	      component.$update('email','hello');
	
	
	
	      expect(component.data.email).to.equal('hello')
	      expect(nes.one('input', container).value).to.equal('hello')
	
	      destroy(component, container)
	
	    })
	
	    it("input:password and text with 'r-model' should works", function(){
	      var template = 
	        '<input type="password" value="123456" r-model={password}>'+
	        '<input type="text" r-model={text}>'
	      var component = new Regular({
	        template: template
	      }).$inject(container)
	
	      var inputs = nes.all('input', container);
	
	      expect(inputs.length).to.equal(2)
	      expect(inputs[0].value).to.equal("123456");
	      expect(inputs[1].value).to.equal("");
	
	      component.$update({
	        text: '1234',
	        password: 3456
	      })
	      expect(inputs[0].value).to.equal("3456");
	      expect(inputs[1].value).to.equal("1234");
	      destroy(component, container)
	    })
	    it('input with non type should works as expect', function(){
	      var template = "<input r-model={nontype}>";
	      var component = new Regular({
	        template: template
	      }).$inject(container);
	
	      expect($('input', container).length).to.equal(1)
	      expect($('input', container).val()).to.equal('')
	
	      component.$update('nontype', 'hello');
	      expect($('input', container).val()).to.equal('hello')
	
	      component.destroy()
	    })
	
	    it('textarea binding should also works', function(){
	
	        var template = 
	          '<textarea r-model={textarea}></textarea>'+
	          '<textarea r-model={textarea}></textarea>'
	        var component = new Regular({
	          template: template,
	          data: {textarea: '100'}
	        }).$inject(container);
	
	        expect($('textarea', container).length).to.equal(2);
	        expect($('textarea', container).val()).to.equal("100");
	        destroy(component, container);
	    })
	
	
	
	  })
	
	  describe('checkbox binding', function(){
	    it('input:checkbox"s initial state should be correct', function(){
	      var template = 
	        "<input checked  type='checkbox' r-model={nontype} >"+
	        "<input type='checkbox' r-model={nontype3}>"+
	        "<input type='checkbox' r-model={nontype2} checked=checked>";
	      var component = new Regular({
	        template: template
	      }).$inject(container);
	
	
	
	
	      expect($('input', container).length).to.equal(3)
	      expect($('input:first-child', container)[0].checked).to.equal(true)
	      expect($('input:last-child', container)[0].checked).to.equal(true)
	      expect($('input:nth-child(10n+2)', container)[0].checked).to.equal(false)
	
	      expect(component.data.nontype).to.equal(true);
	      expect(component.data.nontype2).to.equal(true);
	      expect(component.data.nontype3).to.equal(false);
	
	      destroy(component, container);
	
	    })
	    it('input:checkbox should works correctly', function(){
	      var template = "<input type='checkbox' r-model={checked}>";
	      var component = new Regular({
	        template: template
	      }).$inject(container);
	
	      expect($('input', container).length).to.equal(1)
	      expect(component.data.checked).to.equal(false);
	
	      component.$update('checked', true)
	
	      expect($('input', container)[0].checked).to.equal(true)
	
	      destroy(component, container);
	    });
	  })
	
	  describe('select binding', function(){
	    it('the initial state of select binding should correct', function(){
	      var template1 = 
	        "<select  r-model={selected1}>\
	          <option value='1' >Ningbo</option>\
	          <option value='2'>Hangzhou</option>\
	          <option value='3' selected>Beijing</option>\
	        </select>";
	      var template2 = 
	        "<select  r-model={selected2}>\
	          <option value='1'>Ningbo</option>\
	          <option value='2'  selected=selected>Hangzhou</option>\
	          <option value='3'>Beijing</option>\
	        </select>";
	      var template3 = 
	        "<select  r-model={selected3}>\
	          <option value='1'>Ningbo</option>\
	          <option value='2'>Hangzhou</option>\
	          <option value='3'>Beijing</option>\
	        </select>";
	
	      var component = new Regular({
	
	        template: template1 + template2 + template3
	
	      }).$inject(container);
	
	      expect($('select', container).length).to.equal(3)
	
	      expect($('select:first-child', container).val()).to.equal("3")
	      expect($('select:nth-child(10n+2)', container).val()).to.equal("2")
	      expect($('select:nth-child(10n+3)', container).val()).to.equal("1")
	
	      expect(component.data.selected1).to.equal('3');
	      expect(component.data.selected2).to.equal('2');
	      expect(component.data.selected3).to.equal('1');
	
	      destroy(component, container)
	    })
	
	    it("select should works as expect", function(){
	      var template1 = 
	        "<select  r-model={selected1}>\
	          <option value='1' >Ningbo</option>\
	          <option value='2'>Hangzhou</option>\
	          <option value='3' selected>Beijing</option>\
	        </select>";
	      var component = new Regular({
	
	        template: template1
	
	      }).$inject(container);
	
	
	      expect($('select', container).val()).to.equal("3");
	      expect(component.data.selected1).to.equal("3");
	
	      component.$update('selected1', "2");
	      expect($('select', container).val()).to.equal("2");
	
	      //destroy
	      destroy(component, container);
	    })
	
	    it('select combine with list should works as expected', function(){
	      var template = 
	        "<select  r-model={selected}>\
	          {#list values as value}\
	            <option value={value.value}>{value.name}</option>\
	          {/list}\
	        </select>";
	      var component = new Regular({
	
	        template: template,
	        data: {
	          values: [
	            { value:"10", name:"Ningbo" },
	            { value:"20", name:"Hangzhou" },
	            { value:"30", name:"Beijing" }
	
	          ],
	          selected: "10"
	        }
	
	      }).$inject(container);
	
	
	      // expect($('select option', container).length).to.equal(3)
	        expect($('select', container).val()).to.equal("10");
	        component.$update("selected", "20");
	        expect($('select', container).val()).to.equal("20");
	
	        destroy(component, container);
	
	    })
	
	    it("r-model:select in list should works as expect", function(){
	      var container = document.createElement('div')
	      var Component = Regular.extend({});
	      var component = new Regular({
	        data: {test: true, hello: {} } ,
	        template: "{#list 1..2 as hah}<select r-model='hello.name'>{#list [1,2,3,4] as item}<option value={item} selected={item_index==2}>haha</option>{/list}</select>{/list}"
	      }).$inject(container)
	
	
	      expect(nes.one("select", container).value).to.equal('3');
	      expect(component.data.hello.name).to.equal('3');
	
	      destroy(component, container);
	
	    })
	  })
	
	
	  describe('radio binding', function(){
	    var container = document.createElement("div");
	
	    it('input:checkbox"s initial state should be correct', function(){
	      var template = 
	        "<input  value='radio1' type='radio' r-model={radio}>" + 
	        "<input value='radio2' type='radio' r-model={radio} checked >"
	      var component = new Regular({
	        template: template
	      }).$inject(container);
	
	      expect(nes.all('input', container).length).to.equal(2);
	      expect(component.data.radio).to.equal('radio2');
	
	      destroy(component, container);
	    })
	    it('input:checkbox should work as expected', function(){
	      var template = 
	        "<input type='radio' r-model={radio} value='radio1'>" + 
	        "<input type='radio' r-model={radio} value='radio2'>"
	      var component = new Regular({
	        template: template
	      }).$inject(container);
	
	      expect($('input', container).length).to.equal(2);
	      expect(component.data.radio).to.equal(undefined);
	
	      component.$update('radio', 'radio2')
	
	      expect($('input', container)[1].checked).to.equal(true);
	
	      destroy(component, container);
	
	    })
	
	    it("r-model in if should works as expect", function(){
	      var container = document.createElement('div')
	      var Component = Regular.extend({});
	      var component = new Regular({
	        data: {test: true} ,
	        template: "{#if !test}<input r-model={item} value='1' />{/if}"
	      }).$inject(container)
	
	      component.$update("test", false);
	
	      expect(nes.one("input", container).value).to.equal('1');
	      expect(component.data.item).to.equal('1');
	
	      destroy(component, container);
	
	    })
	    it("r-model in list should works as expect", function(){
	      var container = document.createElement('div')
	      var Component = Regular.extend({});
	      var component = new Regular({
	        data: {test: true, hello: {} } ,
	        template: "{#list [1,2,3,4] as item}<input r-model={hello.name} value='1' />{/list}"
	      }).$inject(container)
	
	      expect(nes.one("input", container).value).to.equal('1');
	      expect(component.data.hello.name).to.equal('1');
	
	      destroy(component, container);
	
	    });
	
	  })
	
	})
	
	
	
	describe('other buildin directive', function(){
	  var container = document.createElement('div');
	
	
	  it('r-hide should force element to "display:none" when the expression is evaluated to true', function(){
	    var template = "<div r-hide={!!user}>Please Login</div>" 
	
	    var component = new Regular({
	      template: template,
	      data: {user: 'hello'}
	    }).$inject(container);
	
	    
	
	    expect($('div', container).css('display')).to.equal('none');
	
	    component.$update('user','');
	
	    expect($('div', container).css('display')).not.to.equal('none');
	
	    destroy(component, container);
	
	  })
	
	  it('r-class should add all property as the class whose propertyValue is evaluated to true', function(){
	    var template = "<div r-class={ {'z-show': num < 6, 'z-active': num > 3} } >Please Login</div>" 
	
	    var component = new Regular({
	      template: template,
	      data: {num: 4}
	    }).$inject(container);
	
	    expect($('div', container).hasClass('z-show')).to.equal(true);
	    expect($('div', container).hasClass('z-active')).to.equal(true);
	
	    component.$update('num', 2);
	    expect($('div', container).hasClass('z-show')).to.equal(true);
	    expect($('div', container).hasClass('z-active')).to.equal(false);
	
	    component.$update('num', 8);
	    expect($('div', container).hasClass('z-show')).to.equal(false);
	    expect($('div', container).hasClass('z-active')).to.equal(true);
	
	    destroy(component, container);
	
	  })
	
	  it("r-class can combine with raw class attribute", function(){
	    var template = "<div class='rawClass' r-class={ {'z-show': num < 6, 'z-active': num > 3} }>Please Login</div>" 
	    var component = new Regular({
	      template: template,
	      data: {num: 4}
	    }).$inject(container);
	
	    expect($('div', container).hasClass('rawClass')).to.equal(true);
	    expect($('div', container).hasClass('z-active')).to.equal(true);
	    expect($('div', container).hasClass('z-show')).to.equal(true);
	
	    component.$update('num', 2);
	    expect($('div', container).hasClass('rawClass')).to.equal(true);
	    expect($('div', container).hasClass('z-show')).to.equal(true);
	    expect($('div', container).hasClass('z-active')).to.equal(false);
	
	    destroy(component, container)
	
	  })
	  it("r-class can not combine with class inteplation", function(){
	    var template = "<div class='{topClass}' r-class={ {'z-show': num < 6, 'z-active': num > 3} }>Please Login</div>" 
	    var component = new Regular({
	      template: template,
	      data: {num: 4}
	    }).$inject(container);
	
	    expect($('div', container).hasClass('z-active')).to.equal(true);
	    expect($('div', container).hasClass('z-show')).to.equal(true);
	
	    component.$update('topClass', 'hello')
	
	    expect($('div', container).hasClass('z-active')).to.equal(false);
	    expect($('div', container).hasClass('z-show')).to.equal(false);
	    // override the r-class
	    expect($('div', container).hasClass('hello')).to.equal(true);
	
	    destroy(component, container);
	
	  })
	  it("r-style, r-class accept unBraced string", function(){
	    var template = "<div ref=cnt r-class=\"'z-show': num < 6, 'z-active': num > 3 \" r-style=\"left: num+'px'\" >Please Login</div>" 
	    var component = new Regular({
	      template: template,
	      data: {num: 2}
	    });
	    var dom = Regular.dom;
	    var div = component.$refs.cnt;
	    expect(dom.hasClass(div, 'z-show' )).to.equal(true);
	    expect(dom.hasClass(div, 'z-active' )).to.equal(false);
	
	    expect(div.style.left).to.equal('2px')
	
	  })
	  it("r-style should add all property specify in the passed arguments(type Object)", function(){
	    var template = "<div class='{topClass}' r-class={ {'z-show': num < 6, 'z-active': num > 3} }>Please Login</div>" 
	    var component = new Regular({
	      template: template,
	      data: {num: 2}
	    }).$inject(container);
	
	    // TODO
	    destroy(component, container)
	
	  })
	
	  it("r-html should create unescaped inteplation verus {} ", function(){
	    var template = "<div r-html='name'>Please Login</div>" 
	    var component = new Regular({
	      template: template,
	      data: {}
	    }).$inject(container);
	
	    expect(nes.one('div', container).innerHTML).to.equal("");
	
	    component.$update("name", "<p>a</p>")
	
	    expect(nes.all('div p', container).length).to.equal(1);
	    destroy(component, container)
	
	  })
	
	
	})
	
	describe("refs attribute", function(){
	  var container = document.createElement("div");
	  var Component = Regular.extend({
	    template: "<div>haha</div>"
	  });
	  it("ref on element should work as expect", function(){
	    var component = new Component({
	      template: "<div ref=haha>hello</div>",
	      data: {
	        hello: 1
	      }
	    }).$inject(container)
	
	    expect(component.$refs["haha"] === nes.one('div', container)).to.equal(true);
	    destroy(component, container);
	  })
	  it("ref on element with expression should work as expect", function(){
	    var component = new Component({
	      template: "<p ref={haha}></p>",
	      data: {
	        haha: "haha"
	      }
	    }).$inject(container)
	
	    expect(component.$refs["haha"] === nes.one('p', container)).to.equal(true);
	    destroy(component, container);
	
	  })
	
	  it("ref on component should work as expect", function(){
	    var Component1 = Component.extend({
	      name: "haha",
	      template: "<input type='text' />"
	    }) 
	    var component = new Component({
	      template: "<haha ref=haha></haha>",
	      data: {
	        haha: "haha"
	      }
	    }).$inject(container)
	
	    expect(component.$refs["haha"] instanceof Component1).to.equal(true);
	    destroy(component, container);
	  })
	
	  it("ref on component with should work as expect", function(){
	    var Component1 = Component.extend({
	      name: "haha",
	      template: "<input type='text' />"
	    }) 
	    var component = new Component({
	      template: "<haha ref={haha}></haha>",
	      data: {
	        haha: "haha"
	      }
	    }).$inject(container)
	
	
	    expect(component.$refs["haha"] instanceof Component1).to.equal(true);
	
	    destroy(component, container);
	  })
	
	  it("ref should works with list", function(){
	    var component = new Component({
	      template: "{#list items as item}<div ref={haha + item_index} id={item_index}>haha</div>{/list}",
	      data: {
	        haha: "haha",
	        items: [1,2,3]
	      }
	    }).$inject(container)
	
	    expect(component.$refs["haha0"].id).to.equal("0");
	    expect(component.$refs["haha1"].id).to.equal("1");
	    expect(component.$refs["haha2"].id).to.equal("2");
	
	    component.$update(function(data){
	      data.items.pop();
	    })
	
	    expect(component.$refs["haha2"]).to.equal(null);
	
	    destroy(component, container);
	  })
	  it("ref should destroied as expect", function(){
	    var component = new Component({
	      template: "{#list items as item}<div ref={haha + item_index} id={item_index}>haha</div>{/list}",
	      data: {
	        haha: "haha",
	        items: [1,2,3]
	      }
	    }).$inject(container)
	
	    component.$update(function(data){
	      data.items.pop();
	    })
	
	    destroy(component, container);
	    expect(component.$refs).to.equal(null);
	  })
	  it("ref updated when value update:[element]", function(){
	    var component = new Component({
	      template: "<div ref={name} id='100'></div>{#list items as item}<div ref='{name}{item}'>{item}</div>{/list}",
	      data: {
	        name: "haha",
	        items: [1,2,3]
	      }
	    })
	
	    expect(component.$refs.haha.id).to.equal('100')
	    component.$update('name', 'hehe')
	    expect(component.$refs.hehe.id).to.equal('100')
	    expect(component.$refs.haha==null).to.equal(true);
	
	    expect(component.$refs.hehe1.innerHTML).to.equal('1')
	    expect(component.$refs.hehe2.innerHTML).to.equal('2')
	    expect(component.$refs.hehe3.innerHTML).to.equal('3')
	
	    component.$update('items', [2,3,4, 5])
	
	    expect(component.$refs.hehe2.innerHTML).to.equal('2')
	    expect(component.$refs.hehe3.innerHTML).to.equal('3')
	    expect(component.$refs.hehe4.innerHTML).to.equal('4')
	    expect(component.$refs.hehe5.innerHTML).to.equal('5')
	
	    destroy(component, container);
	  })
	  it("ref updated when value update:[component]", function(){
	    
	    Component.extend({
	      name: 'nested'
	    })
	    var component = new Component({
	      template: "<nested ref={name} id='100'></nested>{#list items as item}<nested ref='{name}{item}' value='{item}'></nested>{/list}",
	      data: {
	        name: "haha",
	        items: [1,2,3]
	      }
	    })
	
	    expect(component.$refs.haha.data.id).to.equal('100')
	    component.$update('name', 'hehe')
	    expect(component.$refs.hehe.data.id).to.equal('100')
	    expect(component.$refs.haha==null).to.equal(true);
	
	    expect(component.$refs.hehe1.data.value).to.equal(1)
	    expect(component.$refs.hehe2.data.value).to.equal(2)
	    expect(component.$refs.hehe3.data.value).to.equal(3)
	
	    component.$update('items', [2,3,4, 5])
	
	    expect(component.$refs.hehe2.data.value).to.equal(2)
	    expect(component.$refs.hehe3.data.value).to.equal(3)
	    expect(component.$refs.hehe4.data.value).to.equal(4)
	    expect(component.$refs.hehe5.data.value).to.equal(5)
	
	    destroy(component, container);
	  })
	})
	
	
	


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	
	var Regular = __webpack_require__(16);
	
	
	describe("Filter", function(){
	var Component = Regular.extend();
	
	Component.filter('lowercase', function(value){
	  return value.toLowerCase();
	})
	// simplest date format
	Component.filter("format",function(value, format){
	   function fix(str){
	     str = "" + (str || "");
	     return str.length <= 1? "0" + str : str;
	   }
	   var maps = {
	     'yyyy': function(date){return date.getFullYear()},
	     'MM': function(date){return fix(date.getMonth() + 1); },
	     'dd': function(date){ return fix(date.getDate()) },
	     'HH': function(date){ return fix(date.getHours()) },
	     'mm': function(date){ return fix(date.getMinutes())}
	   }
	
	   var trunk = new RegExp(Regular.util.keys(maps).join('|'),'g');
	   
	   return function(value, format){
	    
	     format = format || "yyyy-MM-dd HH:mm";
	     value = new Date(value);
	     
	
	     return format.replace(trunk, function(capture){
	       return maps[capture]? maps[capture](value): "";
	     });
	   }
	 }())
	
	
	
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	  var container = document.createElement('div')
	  it("fitler should works correctly", function(){
	    var component = new Component({
	      template: "<div>{test|lowercase}</div>",
	      data: {test: "ABcD"}
	    }).$inject(container);
	
	
	    expect($("div",container).html()).to.equal('abcd');
	
	    destroy(component, container);
	  })
	
	  it("filter should works with param", function(){
	    var component = new Component({
	      template: "<div>{test|format: 'yyyy-MM-dd'}</div>",
	      data: {test: +new Date(1407908567273)}
	    }).$inject(container);
	    expect($("div",container).html()).to.equal('2014-08-13');
	    destroy(component, container);
	  })
	
	
	  it("filter's context should point to component self", function(){
	    var setValue, getValue;
	
	    Component.filter({
	      "context":{
	        set: function(){
	          setValue = this.a;
	        },
	        get: function(){
	          getValue = this.b;
	        }
	      }
	
	    })
	
	    var component = new Component({a:1,b:2});
	
	    component.$set("name|context");
	    expect(setValue).to.equal(1);
	    component.$get("name|context");
	    expect(getValue).to.equal(2);
	
	  })
	
	  it("use two-way filter", function(){
	    Component.filter({
	      // accept String
	      "split": {
	        get: function(preValue, split){
	          split = split || "-";
	          return preValue.split(split);
	        },
	        set: function(lastValue, split){
	          split = split || "-";
	          return lastValue.join(split);
	        }
	      },
	      // accept Array
	      "prefix": {
	        get: function(preValue, prefix){
	          prefix = prefix || "";
	          return preValue.map(function(value){
	            return prefix + value;
	          })
	        },
	        set: function(lastValue, prefix){
	          prefix = prefix || "";
	          return lastValue.map(function(value){
	            if(value.indexOf(prefix) === 0){
	              value = value.replace(prefix, "");
	            }
	            return value;
	          })
	
	        }
	      }
	    })
	
	    var component = new Component({
	      template: "<div ref=view>{fullname|split:'_'|prefix:'@'}</div>",
	      data: {fullname: 'haibo_zheng'}
	    })
	    expect(component.$refs.view.innerHTML).to.equal("@haibo,@zheng")
	    expect(component.$update("fullname|split:'_'|prefix:'@'", ["@zheng","@haibo"]))
	    expect(component.$refs.view.innerHTML).to.equal("@zheng,@haibo")
	    expect(component.data.fullname).to.equal("zheng_haibo")
	
	  })
	
	
	  it("builtin json", function(){
	    var component = new Component({
	      data: {user: {first: 'zheng', last: 'haibo'}}
	    })
	    if(typeof JSON !== 'undefined' && JSON.stringify){
	      expect(component.$get("user|json")).to.equal('{"first":"zheng","last":"haibo"}')
	    }
	  })
	
	
	  it("fitler with computed", function(){
	    Component.filter({
	      "split2": {
	        get: function(value){
	          return value.split("-")
	        },
	        set: function(value){
	          return  value.join("-");
	        }
	      }
	    })
	    var component = new Component({
	      tmp2: "zheng-haibo",
	      computed: {
	        tmp: {
	          set: function(value){
	            this.tmp2 = value;
	          },
	          get: function(){
	            return this.tmp2
	          }
	        }
	      }
	    })
	
	    expect(component.$get("tmp|split2")).to.eql(["zheng","haibo"]);
	    expect(component.tmp2).to.equal("zheng-haibo");
	
	    component.$set("tmp|split2", ["leeluolee", "regularjs"])
	    expect(component.tmp2).to.equal("leeluolee-regularjs");
	    expect(component.$get("tmp|split2")).to.eql(["leeluolee", "regularjs"]);
	
	  })
	
	  it(" LeftHandExpression is setable with filter", function(){
	    var expr = Regular.expression("a+1|format")
	    expect(expr.setbody).to.equal(false)
	  })
	
	  it("undefined filter should throw error", function(){
	    var component = new Regular();
	    expect(function(){
	      component.$set('tmp|undefinedfilter')
	    }).to.throwError();
	  })
	  
	})
	


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	var Regular = __webpack_require__(16);
	var parse = __webpack_require__(21);
	
	var Component = Regular.extend();
	
	function destroy(component, container){
	  component.destroy();
	  expect(container.innerHTML).to.equal('');
	}
	
	describe("Computed Property", function(){
	  var container = document.createElement("div");
	  it("only pass string will use Regular.expression to generate get(may have set)", function(){
	    var Component = Regular.extend({
	      computed: {
	        len: "items.length",
	        hello: function(){}
	      },
	      template: "xx"
	    });
	
	
	    var component = new Component({data: {items: [1,2]}});
	
	    expect(component.$get("len")).to.equal(2);
	    component.$update("len", 1);
	    expect(component.$get("items").length).to.equal(1);
	  })
	
	  it("only pass a function should register a get function", function(){
	    var Component = Regular.extend({
	      computed: {
	        len: function(data){
	          return data.items.length
	        }
	      }
	    })
	    var component = new Component({data: {items: [1,2]}});
	    expect(component.$get("len")).to.equal(2);
	    component.$update("len", 1); 
	    expect(component.$get("len")).to.equal(2);// not affect len computed
	    expect(component.data.len).to.equal(1) //but affcet the data;
	  })
	
	  it("define get/set computed property should works as expect", function(){
	    var Component = Regular.extend({
	      template: "<div>{fullname}</div>",
	      computed: {
	        fullname: {
	          get: function(data){
	            return data.first + "-" + data.last;
	          },
	          set: function(value, data){
	            var tmp = value.split("-");
	            data.first = tmp[0];
	            data.last = tmp[1];
	          }
	        }
	      }
	    })
	
	    var component = new Component({
	      data: {first: '1', last: '2'}
	    }).$inject(container);
	
	
	
	    expect( nes.one("div", container).innerHTML ).to.equal("1-2");
	
	    component.$update("fullname", "3-4");
	    expect( component.$get("first")).to.equal("3");
	    expect( component.$get("last")).to.equal("4");
	
	    destroy(component, container);
	  })
	
	  it("context should point to component", function(){
	
	  })
	
	  it("computed property in intialize will merge/override the setting on Component.extend", function(){
	    var Component = Regular.extend({
	      template: "<div>{fullname}</div><div>{hello}</div>",
	      computed: {
	        fullname: {
	          get: function(data){
	            return data.first + "-" + data.last;
	          },
	          set: function(value, data){
	            var tmp = value.split("-");
	            data.first = tmp[0];
	            data.last = tmp[1];
	          }
	        }
	      }
	    })
	
	    var component = new Component({
	      data: {
	        first: '1', last: '2'
	      },
	      computed: {
	        fullname: {
	          get: function(data){
	            return data.first + "=" + data.last;
	          },
	          set: function(value, data){
	            var tmp = value.split("=");
	            data.first = tmp[0];
	            data.last = tmp[1];
	          }
	        },
	        hello: function(data){
	          return "hello" + data.first + data.last
	        }
	      }
	    }).$inject(container);
	
	
	    var divs = nes.all("div", container);
	    expect(divs[0].innerHTML ).to.equal("1=2");
	    expect(divs[1].innerHTML ).to.equal("hello12");
	
	    component.$update("fullname", "3=4");
	    expect(divs[0].innerHTML ).to.equal("3=4");
	    expect(divs[1].innerHTML ).to.equal("hello34");
	    destroy(component, container);
	  })
	})
	describe("Expression", function(){
	  function run_expr(expr, context){
	    return expect(context.$expression(expr).get(context));
	  }
	  describe("compiled expression", function(){
	    var context = new Regular({
	      data: {
	        a: 2,
	        b: 3,
	        c: {
	          c1: 1,
	          c2: 2
	        },
	        ab: function(a, b){
	          return a + b;
	        }
	      },
	      show: function(){
	        var data = this.data;
	        data.a++;
	        return data.a;
	      }
	    })
	
	    describe('Primative Type', function(){
	      it("object type returns correctly", function(){
	        run_expr("{a: 1, b: b+1}", context).to.eql({a:1, b: 4});
	        run_expr("{a: 1, b: b+1,}", context).to.eql({a:1, b: 4});
	      });
	
	      it("array type returns correctly", function(){
	        run_expr("[1,5+a, a+b]", context).to.eql([1,7,5]);
	
	      });
	      it("range type returns correctly", function(){
	        run_expr("a..b", context).to.eql([2,3]);
	      });
	
	
	      it("primative type returns correctly", function(){
	        run_expr("1", context).to.eql(1);
	        run_expr("null", context).to.eql(null);
	        run_expr("undefined", context).to.eql(undefined);
	        run_expr("Math", context).to.eql(Math);
	        run_expr("1.1", context).to.eql(1.1);
	        run_expr("-1.1", context).to.eql(-1.1);
	        run_expr("-1.1e3", context).to.eql(-1.1e3);
	        run_expr("true", context).to.eql(true);
	        run_expr("false", context).to.eql(false);
	      })
	
	    })
	
	    describe('Operation', function(){
	      it("add/sub returns correctly", function(){
	        run_expr("1+3", context).to.eql(4);
	        run_expr("b-a", context).to.eql(1);
	      });
	
	      it("mult/div returns correctly", function(){
	        run_expr(" 3 * a ", context).to.eql(6);
	        run_expr("b/a", context).to.eql(1.5);
	      });
	      it("logic operation returns correctly", function(){
	        run_expr(" 3 || a ", context).to.eql(3);
	        run_expr("b && a", context).to.eql(2);
	        run_expr("!b", context).to.eql(false);
	      });
	      it("Relation operation returns correctly", function(){
	        run_expr(" 3 === a ", context).to.eql(false);
	        run_expr(" 3 == a ", context).to.eql(false);
	        run_expr("b !== a", context).to.eql(true);
	        run_expr("b != a", context).to.eql(true);
	        run_expr("b >= a", context).to.eql(true);
	        run_expr("b > a", context).to.eql(true);
	        run_expr("b < a", context).to.eql(false);
	        run_expr("b <= a", context).to.eql(false);
	
	      });
	
	      it("condition returns correctly", function(){
	        run_expr("a? 2: 3", context).to.eql(2);
	      })
	
	      it("paren returns correctly", function(){
	        run_expr("(2+3)*b", context).to.eql(15);
	      })
	
	      it("function call returns correctly", function(){
	        run_expr("ab(a,2)", context).to.eql(4)
	        run_expr("this.show()", context)
	        expect(context.data.a).to.eql(3);
	      })
	
	      it("assignment should works correctly", function(){
	        run_expr("a=1", context).to.eql(1)
	        expect(context.data.a).to.eql(1);
	      })
	
	      it("member should works correctly", function(){
	        expect(context.data.c.c1).to.eql(1);
	        run_expr("c.c1=10", context).to.eql(10)
	        expect(context.data.c.c1).to.eql(10);
	      })
	
	      it("setable expression should works correctly", function(){
	        expect(context.data.c.c2).to.eql(2);
	        context.$update("c.c2", 10);
	        expect(context.data.c.c2).to.eql(10);
	      })
	      it("+=, -= /= *= %= should work as expect", function(){
	        var component = new Regular({data: {a: 1}});
	        component.$get("a+=1");
	        expect(component.data.a).to.equal(2);
	        component.$get("a-=1")
	        expect(component.data.a).to.equal(1);
	        component.$get("a*=100")
	        expect(component.data.a).to.equal(100);
	        component.$get("a/=2")
	        expect(component.data.a).to.equal(50);
	        component.$get("a%=3")
	        expect(component.data.a).to.equal(2);
	      })
	    })
	  })
	})
	
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
	
	  it("digest will throw Error when watching dynamic 【Object】 without deep", function(){
	    var component = new Regular();
	    // every time call hello,  a new Object will be return
	    component.hello = function(){return {}}
	    component.$watch('this.hello()', function(){})
	    expect(function(){
	      component.$update()
	    }).to.throwError();
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
	      template: "<div class='name'>{name}</div><div class='age'>{age}</div>",
	      data: {
	        name: "leeluolee",
	        age: 10
	      }
	    }).$inject(container);
	    var component2 = new Component({
	      template: "<div class='user-name'>{user.name}</div><div class='user-age'>{user.age}</div>",
	      data: {user: {}}
	    }).$inject(container);
	
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
	
	  it("bind once should works on interpolation", function(){
	    var container = document.createElement("div");
	    var component = new Component({
	      template: "<div class='name'>{ @(name) }</div><div class='age'>{age}</div>",
	      data: {
	        name: "leeluolee",
	        age: 10
	      }
	    }).$inject(container);
	
	    component.$update("name", "luobo")
	    component.$update("age", "100")
	    expect(nes.one(".name", container).innerHTML).to.equal("leeluolee");
	    expect(nes.one(".age", container).innerHTML).to.equal("100");
	
	    destroy(component, container);
	  })
	  it("bind once should works on list", function(){
	    var container = document.createElement("div");
	    var component = new Component({
	      template: "{#list @(todos) as todo}<p>{todo}</p>{/list}",
	      data: {
	        todos: ["name", "name2"]
	      }
	    }).$inject(container);
	
	    expect(nes.all("p", container).length).to.equal(2);
	    expect(nes.all("p", container)[0].innerHTML).to.equal("name");
	
	    component.$update(function(data){
	      data.todos.push("name3");
	    })
	
	    expect(nes.all("p", container).length).to.equal(2);
	
	    destroy(component, container);
	  })
	  it("bind once should works on if", function(){
	    var container = document.createElement("div");
	    var component = new Component({
	      template: "{#if @(test) }<p>haha</p>{#else}<a></a>{/if}",
	      data: {test: true}
	    }).$inject(container);
	
	    expect(nes.all("p", container).length).to.equal(1);
	
	    component.$update("test", false);
	
	    expect(nes.all("p", container).length).to.equal(1);
	
	
	    destroy(component, container);
	  })
	
	
	
	
	})
	
	
	
	describe("component.watcher", function(){
	  var watcher = new Regular({
	    data: {
	      str: 'hehe',
	      obj: {},
	      array: []
	    }
	  });
	
	  it('it should watch once when have @(str) ', function(){
	    var trigger = 0;
	    var trigger2 =0;
	    watcher.$watch('@(str)', function(){
	      trigger++;
	    })
	    watcher.$watch('str', function(){
	      trigger2++;
	    })
	    watcher.data.str = 'haha'
	    watcher.$digest();
	    watcher.data.str = 'heihei'
	    watcher.$digest();
	    expect(trigger).to.equal(1);
	    expect(trigger2).to.equal(2);
	
	  } )
	
	  it("beacuse of cache passed same expr should return the same expression", function(){
	    var expr = parse.expression("a+b");
	    var expr2 = parse.expression("a+b");
	    expect(expr === expr2).to.equal(true);
	  })
	
	  it("watch accept multi binding ", function(done){
	    watcher.$watch(["str", "array.length"], function(str, len){
	      expect(str).to.equal("haha")
	      expect(len).to.equal(2)
	      done();
	    })
	
	    watcher.data.str = "haha";
	    watcher.data.array = [1,2];
	    watcher.$digest();
	  })
	
	  it("watch accept function", function(done){
	    watcher.$watch( function(){return this.first+":" + this.last}, function(now, old){
	      expect(old).to.equal(undefined)
	      expect(now).to.equal("first:last")
	      done();
	    })
	    watcher.first = "first";
	    watcher.last = "last";
	    watcher.$digest();
	  })
	  it("watch list [undefined - > [], [] -> undefined]", function(done){
	    var num = 0;
	    var watchid = watcher.$watch( 'list', function(now, old){
	      num++;
	      if(num === 1){
	        expect(old).to.equal(undefined)
	        expect(now).to.eql([])
	      }
	      if(num === 2){
	        expect(old).to.eql([])
	        expect(now).to.eql(undefined)
	        done()
	      }
	    })
	    watcher.data.list = [];
	    watcher.$digest();
	    expect(num).to.equal(1)
	    watcher.data.list = undefined;
	    watcher.$digest();
	  })
	  it("watch list [{} - > [], [] -> {}]", function(done){
	    var num = 0;
	    var watchid = watcher.$watch( 'list', function(now, old){
	      num++;
	      if(num === 2){
	        expect(old).to.eql({})
	        expect(now).to.eql([])
	      }
	      if(num === 3){
	        expect(now).to.eql({})
	        expect(old).to.eql([])
	        done()
	      }
	    })
	
	    watcher.data.list = {};
	    watcher.$digest();
	    watcher.data.list = [];
	    watcher.$digest();
	    watcher.data.list = {};
	    watcher.$digest();
	  })
	
	  it("watch object deep should checked the key", function(){
	    var watcher = new Regular({
	      data: {
	        str: 'hehe',
	        obj: {},
	        array: []
	      }
	    })
	
	    var trigger = 0;
	    var trigger2 = 0;
	    watcher.$watch("obj", function(){
	      trigger++;
	    })
	    watcher.$watch("obj", function(){
	      trigger2++;
	    }, true)
	
	    watcher.$digest();
	    watcher.data.obj.name = 1;
	    watcher.$digest();
	    watcher.data.obj.name = 2;
	    watcher.$digest();
	    expect(trigger).to.equal(1);
	    expect(trigger2).to.equal(3);
	    watcher.data.obj.key = 2;
	    watcher.$digest();
	    expect(trigger).to.equal(1);
	    expect(trigger2).to.equal(4);
	    delete watcher.data.obj.name;
	    watcher.$digest();
	    expect(trigger).to.equal(1);
	    expect(trigger2).to.equal(5);
	  })
	
	  it('$digest in $update should be ignored', function(){
	    var i = 0;
	    var Component = Regular.extend({
	      data: {
	        'title':2
	      },
	      template: "<div ref=div on-click={this.click()}>{title}</div>",
	      _digest: function(){
	        i++;
	        return this.supr()
	      },
	      click: function(){
	        this.data.title='1';
	        this.show();
	        this.$update();
	      },
	      show: function(){
	        this.$update();
	      }
	    })
	
	    var comp = new Component();
	
	    expect(i).to.equal(1);
	    expect(comp.$refs.div.innerHTML). to.equal('2')
	
	    dispatchMockEvent(comp.$refs.div, 'click');
	
	    expect(i).to.equal(3);
	
	  })
	
	  it("$watch list should pass the newarray  and old array", function(){
	     var watcher = new Regular({
	      data:{
	        list: [1,2]
	      }
	     });
	     var i=0;
	
	     watcher.$watch('list', function(nList, oList, splice){
	      expect(splice).to.equal(true);
	      i++;
	     })
	     watcher.$watch('list', function(nList, oList, splice){
	      expect(splice).to.not.equal(true);
	      i++;
	     },{
	      diff: true
	     })
	
	     watcher.$update('list', [1,2,3])
	     expect(i). to.equal(2);
	  })
	
	})
	
	
	
	
	


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	
	  var Regular = __webpack_require__(16);
	  var Component = Regular.extend();
	
	  function destroy(component, container){
	    component.destroy();
	    expect(container.innerHTML).to.equal('');
	  }
	
	
	  describe("Nested Component", function(){
	    var NameSpace = Regular.extend();
	    var containerAll = document.createElement("div");
	    var Test = NameSpace.extend({
	      template: "<div>{#inc this.$body}</div>"
	    })
	
	    NameSpace.component('test', Test);
	
	    it("the attribute with plain String will pass to sub_component", function(){
	
	      //lazy bind watcher will not trigger in intialize state 
	      var container = document.createElement("div");
	      var Component = NameSpace.extend({
	        name: "test1",
	        template: "<p>{hello}</p>"
	      })
	      var component = new NameSpace({
	        template: "<test1 hello='leeluolee' />"
	      }).$inject(container)
	
	      expect( nes.one("p", container).innerHTML ).to.equal("leeluolee");
	      component.destroy();
	    });
	
	    it("it should create two-way binding from parent to nested when pass Expression", function(){
	      var container = document.createElement("div");
	      var Component = NameSpace.extend({
	        name: "test2",
	        template: "<p on-click={hello='haha'}>{hello}</p>"
	      })
	      var component = new NameSpace({
	        template: "<test2 hello={name} /><span class='name'>{name}</span>",
	        data: {name: "leeluolee"}
	      }).$inject(container)
	
	      expect( nes.one("p", container).innerHTML ).to.equal("leeluolee");
	
	      component.$update("name", "luobo")
	
	
	      expect( nes.one("p", container).innerHTML ).to.equal("luobo");
	      dispatchMockEvent(nes.one("p", container), "click")
	      expect( nes.one("p", container).innerHTML ).to.equal("haha");
	      expect( nes.one(".name", container).innerHTML ).to.equal("haha");
	      destroy(component, container);
	    });
	    it("it should create one-way binding from parent to nested when Expression is not setable", function(){
	      var container = document.createElement("div");
	      var Component = NameSpace.extend({
	        name: "test2",
	        template: "<p on-click={hello='haha'}>{hello}</p>"
	      })
	      var component = new NameSpace({
	        template: "<test2 hello={name+'1'} /><span class='name'>{name}</span>",
	        data: {name: "leeluolee"}
	      }).$inject(container)
	
	      expect( nes.one("p", container).innerHTML ).to.equal("leeluolee1");
	      expect( nes.one(".name", container).innerHTML ).to.equal("leeluolee");
	
	
	      dispatchMockEvent(nes.one("p", container), "click")
	      expect( nes.one("p", container).innerHTML ).to.equal("haha");
	      expect( nes.one(".name", container).innerHTML ).to.equal("leeluolee");
	      destroy(component, container);
	    })
	
	    it("context of transclude-html should point to outer component", function(){
	      var container = document.createElement("div");
	      var Component = NameSpace.extend({
	        name: "nested1",
	        template: "<p><a>haha</a>{#inc this.$body}</p>"
	      })
	
	      var i = 0;
	      var component = new NameSpace({
	        template: "<nested1 on-hello={this.hello}><span on-click={this.hello()}>{name}</span></nested1>",
	        data: {name: "leeluolee"},
	        hello: function(){
	          i++
	        }
	      }).$inject(container);
	
	      dispatchMockEvent(nes.one("span", container), "click");
	
	      expect(i).to.equal(1);
	
	      expect(nes.one("p span", container).innerHTML).to.equal("leeluolee");
	
	      destroy(component, container);
	
	    })
	
	    it("transclude-html with $body ", function(){
	                  
	
	      var test = new Test({
	        $body: "<p ref=p>{title}</p>",
	        data: {title: 'leeluolee'}
	      })
	      expect(test.$refs.p.innerHTML).to.equal('leeluolee');
	      test.destroy();
	    })
	
	
	    it("$outer should point to visual outer component", function(){
	      var TestChild = NameSpace.extend({
	        template: "<p>{title}</p>"
	      })
	      NameSpace.component("test-child", TestChild);
	
	      var  component = new NameSpace({
	        template: 
	          "<test ref=test>\
	            <test-child title={title} ref=child></test-child>\
	            <test-child title={title} ref=child2></test-child>\
	          </test>",
	        data: {title: 'regularjs'}
	      })
	
	
	      expect(component.$refs.child.$outer).to.equal(component.$refs.test);
	
	      component.destroy();
	
	    })
	
	    it("nested intialize step should follow particular sequence", function(){
	      var step = [];
	      var Child = NameSpace.extend({
	        template: "<p><r-content></p>",
	        config: function(data){
	          step.push( "config " + data.step);
	        },
	        init: function(){
	          var data = this.data;
	          step.push("init "+data.step);
	        }
	      })
	      var Child2 = NameSpace.extend({
	        template: "<p>{#inc this.$body}</p>",
	        config: function(data){
	          step.push( "config " + data.step);
	        },
	        init: function(){
	          var data = this.data;
	          step.push("init "+data.step);
	        }
	      })
	      NameSpace.component("child1", Child);
	      NameSpace.component("child2", Child);
	      NameSpace.component("child3", Child2);
	      NameSpace.component("child4", Child2);
	
	      var  component = new NameSpace({
	        template: 
	          "<div ref=container ><child1 step=child1>\
	            <child2 step=child21></child2>\
	            <child2 step=child22>\
	              <child3 step='child31'>\
	                <child4 step='child41'>{title}</child4>\
	                <child4 step='child42'>{title}</child4>\
	              </child3>\
	              <child3 step='child32'></child3>\
	            </child2>\
	          </child1></div>",
	        data: {title: 'regularjs'}
	      })
	
	      expect(step).to.eql( 
	        ["config child1", 
	          "config child21", "init child21", 
	          "config child22", 
	            "config child31", 
	              "config child41", "init child41", 
	              "config child42", "init child42", 
	            "init child31", 
	            "config child32", "init child32", 
	          "init child22", 
	        "init child1"]
	        )
	
	      component.destroy();
	
	
	    })
	
	
	    it("nested component should get the outer component's data before create the binding", function(){
	
	      var container = document.createElement("div");
	      var Component = NameSpace.extend({
	        name: "nest2",
	        template: "<p>{user.name.first}</p>"
	      })
	
	      var component = new NameSpace({
	        template: "<nest2 user={user}></nest2>",
	        data: {user: {name: {first: "Zheng"} } }
	      }).$inject(container);
	
	      expect(nes.one("p", container).innerHTML).to.equal("Zheng");
	
	      destroy(component, container);
	
	    })
	
	    it("r-component can register dynamic component", function(){
	     
	      var container = document.createElement("div");
	      var Component2 = NameSpace.extend({
	        name: "nest2",
	        template: "<p>{user.name.first}</p>"
	      })
	
	      var Component3 = NameSpace.extend({
	        name: "nest3",
	        template: "<p>{user.name.first + ':hello'}</p>"
	      })
	
	      var component = new NameSpace({
	
	        template: "<r-component is=nest2 user={user} ref=component />",
	        data: {user: {name: {first: "Zheng"} } }
	      }).$inject(container);
	
	      expect(nes.one("p", container).innerHTML).to.equal("Zheng");
	      expect(component.$refs.component instanceof Component2).to.equal(true);
	
	      destroy(component, container);
	
	      var component = new NameSpace({
	
	        template: "<r-component is={name} user={user} ref=component />",
	        data: {user: {name: {first: "Zheng"} } ,name: 'nest3'}
	      }).$inject(container);
	 
	      expect(component.$refs.component instanceof Component3).to.equal(true);
	      expect(nes.one("p", container).innerHTML).to.equal("Zheng:hello");
	
	      component.$update('name', 'nest2');
	      expect(component.$refs.component instanceof Component2).to.equal(true);
	      expect(nes.one("p", container).innerHTML).to.equal("Zheng");
	      destroy(component, container);
	    })
	
	
	    describe("nested Component with Event", function(){
	
	      it("on-* should evaluate the Expression when the listener is called", function(){
	        var container = document.createElement("div");
	        var Component = NameSpace.extend({
	          name: "nested3",
	          template: "<p on-click={this.$emit('hello')}></p>"
	        })
	
	        var i =0;
	        var component = new NameSpace({
	          template: "<nested3 on-hello={this.hello()} />",
	          hello: function(){
	            i++
	          }
	        }).$inject(container);
	
	        dispatchMockEvent(nes.one("p", container), "click");
	
	        expect(i).to.equal(1);
	
	        destroy(component, container);
	
	      })
	      it("on-*='String' should proxy the listener to outer component", function(){
	        var container = document.createElement("div");
	        var Component = NameSpace.extend({
	          name: "nested4",
	          template: "<p on-click={this.$emit('hello', $event)}></p><p on-click={this.$emit('nav', 1)} ref=p></p>"
	        })
	
	        var i =0;
	        var type=null;
	        var page = null;
	        var component = new NameSpace({
	          template: "<nested4 on-hello='hello' on-nav={this.nav($event)} />",
	          init: function(){
	            this.$on('hello', function(ev){
	              type = ev.type;
	              i++;
	            })
	          },
	          nav: function(p){
	            page = p
	          }
	        }).$inject(container);
	
	        var ps = nes.all("p", container);
	        dispatchMockEvent( ps[0], "click");
	
	        expect(i).to.equal(1);
	        expect(type).to.equal("click");
	
	        dispatchMockEvent( ps[1], "click");
	
	        expect(page).to.equal(1);
	
	        destroy(component, container);
	
	      }) 
	
	
	
	
	  })
	    // stop parent <-> component
	    it("isolate = 3 should make the component isolate to/from parent", function(){
	      var container = document.createElement("div");
	      var Test = NameSpace.extend({
	        name: 'nested5',
	        template: "<p>{title}</p>"
	      })
	
	
	      var component = new NameSpace({
	        template: "<span>{title}</span><nested5 ref=a title={title} isolate></nested5><nested5 ref=b title={title} isolate=3></nested5>",
	        data: {title: 'leeluolee'}
	      }).$inject(containerAll);
	
	      var p1= containerAll.getElementsByTagName("p")[0]
	      var p2= containerAll.getElementsByTagName("p")[1]
	      var span= containerAll.getElementsByTagName("span")[0]
	      expect(p1.innerHTML).to.equal("leeluolee");
	      expect(p2.innerHTML).to.equal("leeluolee");
	      expect(span.innerHTML).to.equal("leeluolee");
	
	      component.$update("title", 'leeluolee2')
	      expect(p1.innerHTML).to.equal("leeluolee");
	      expect(p2.innerHTML).to.equal("leeluolee");
	      expect(span.innerHTML).to.equal("leeluolee2");
	
	      component.$refs.a.$update("title", "leeluolee3");
	      expect(p1.innerHTML).to.equal("leeluolee3");
	      expect(p2.innerHTML).to.equal("leeluolee");
	      expect(span.innerHTML).to.equal("leeluolee2");
	
	      component.$refs.b.$update("title", "leeluolee4");
	      expect(p1.innerHTML).to.equal("leeluolee3");
	      expect(p2.innerHTML).to.equal("leeluolee4");
	      expect(span.innerHTML).to.equal("leeluolee2");
	
	      destroy(component, containerAll);
	      
	    })
	    // stop parent ->  component
	    it("isolate = 2 should make the component isolate from parent", function(){
	      var Test = NameSpace.extend({
	        name: 'nested6',
	        template: "<p>{title}</p>"
	      })
	      var component = new NameSpace({
	        template: "<span>{title}</span><nested6 ref=a title={title} isolate=2></nested6>",
	        data: {title: 'leeluolee'}
	      }).$inject(containerAll);
	      var p1= containerAll.getElementsByTagName("p")[0]
	      var span= containerAll.getElementsByTagName("span")[0]
	      expect(p1.innerHTML).to.equal("leeluolee");
	      expect(span.innerHTML).to.equal("leeluolee");
	
	      component.$update("title", 'leeluolee2')
	
	      expect(p1.innerHTML).to.equal("leeluolee");
	      expect(span.innerHTML).to.equal("leeluolee2");
	
	      component.$refs.a.$update("title", "leeluolee3");
	      expect(p1.innerHTML).to.equal("leeluolee3");
	      expect(span.innerHTML).to.equal("leeluolee3");
	      
	      destroy(component, containerAll);
	    })
	    // stop component -> parent
	    it("isolate = 1 should make the component isolate to parent", function(){
	      var Test = NameSpace.extend({
	        name: 'nested7',
	        template: "<p>{title}</p>"
	      })
	      var component = new NameSpace({
	        template: "<span>{title}</span><nested7 ref=a title={title} isolate=1></nested7>",
	        data: {title: 'leeluolee'}
	      }).$inject(containerAll);
	      var p1= containerAll.getElementsByTagName("p")[0]
	      var span= containerAll.getElementsByTagName("span")[0]
	
	      expect(p1.innerHTML).to.equal("leeluolee");
	      expect(span.innerHTML).to.equal("leeluolee");
	
	      component.$update("title", 'leeluolee2')
	      
	      expect(p1.innerHTML).to.equal("leeluolee2");
	      expect(span.innerHTML).to.equal("leeluolee2");
	
	      component.$refs.a.$update("title", "leeluolee3");
	      expect(p1.innerHTML).to.equal("leeluolee3");
	      expect(span.innerHTML).to.equal("leeluolee2");
	      destroy(component, containerAll);
	    })
	
	    //@TODO
	    it("component with (isolate &2) should stop digest phase from parent", function(){
	      var Test = NameSpace.extend({
	        name: 'nested7',
	        template: "<p>{title}</p>",
	        config: function(){
	          this.num = 0;
	        },
	        _digest: function(){
	          this.num++;
	          return this.supr();
	        }
	
	      })
	      var component = new NameSpace({
	        template: "<span>{title}</span>\
	          <nested7 ref=a title={title} isolate=3></nested7>\
	          <nested7 ref=b title={title} isolate=2></nested7>\
	          <nested7 ref=c title={title} isolate=1></nested7>\
	          <nested7 ref=d title={title} ></nested7>",
	        data: {title: 'leeluolee'}
	      });
	
	      expect(component.$refs.a.num).to.equal(1);
	      expect(component.$refs.b.num).to.equal(1);
	      expect(component.$refs.c.num).to.equal(2);
	      expect(component.$refs.d.num).to.equal(2);
	
	      component.$update('title', 'hello')
	
	      expect(component.$refs.a.num).to.equal(1);
	      expect(component.$refs.b.num).to.equal(1);
	      expect(component.$refs.c.num).to.equal(4);
	      expect(component.$refs.d.num).to.equal(4);
	
	    })
	
	
	
	    it("ab-cd-ef should convert to abCdEf when passed to nested component", function(){
	      var Test = NameSpace.extend({
	        name: 'nested',
	        template: "<p>{title}</p>"
	      })
	      var component = new NameSpace({
	        template: "<span>{title}</span><nested ref=a my-title={title} myHome={1}></nested>",
	        data: {title: 'leeluolee'}
	      }).$inject(containerAll);
	
	      expect(component.$refs.a.data.myTitle).to.equal('leeluolee')
	      expect(component.$refs.a.data.myHome).to.equal(1)
	      destroy(component, containerAll);
	    })
	    it("without value, the attr should consider as a Boolean", function(){
	      var Test = NameSpace.extend({
	        name: 'nested',
	        template: "<p>{title}</p>"
	      })
	      var component = new NameSpace({
	        template: "<span>{title}</span><nested non='' ref=a is-disabled is-actived={!title} isOld  isNew={true} normal></nested>",
	        data: {title: 'leeluolee'}
	      }).$inject(containerAll);
	      var data = component.$refs.a.data;
	      destroy(component, containerAll);
	      expect(data.isDisabled).to.equal(true)
	      expect(data.isActived).to.equal(false)
	      expect(data.isOld).to.equal(true)
	      expect(data.isNew).to.equal(true)
	      expect(data.normal).to.equal(true)
	    })
	})
	
	


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	var _ = __webpack_require__(18);
	var shim = __webpack_require__(22);
	var extend = __webpack_require__(23);
	var diff = __webpack_require__(24)
	var diffArray = diff.diffArray;
	var diffObject = diff.diffObject;
	
	
	
	describe("Regular.util", function(){
	  it('klass"s extend should works as expect', function(){
	    function A(){}
	    A.extend = extend;
	    A.prototype.hello = function(){
	      this.b = 1;
	    }
	
	    var B = A.extend({
	      hello: function(){
	        this.supr();
	        this.a = 2;
	      }
	    })
	
	    var b = new B()
	    b.hello();
	
	    expect(b.b).to.equal(1);
	    expect(b.a).to.equal(2);
	
	    var C = B.extend({
	      hello: function(){
	        this.supr();
	        this.c=3;
	      },
	      say: function(){}
	    })
	
	    var c = new C();
	    c.hello();
	
	    expect(c.a).to.equal(2);
	    expect(c.b).to.equal(1);
	    expect(c.c).to.equal(3);
	  })
	
	  it('extend can work on raw function', function(){
	    function A(){}
	    extend(A);
	
	    A.implement({
	      hello: function(){
	        this.b = 1;
	      }
	    });
	    expect(typeof A.implement).to.equal('function')
	    expect(typeof A.extend).to.equal('function')
	
	    var B = A.extend({
	      hello: function(){
	        this.supr();
	        this.a = 2;
	      }
	    });
	
	    var b = new B
	    b.hello();
	
	    expect(b.a).to.equal(2);
	    expect(b.b).to.equal(1);
	
	  })
	
	  it('klass.implement should works as expected', function(){
	    function A(){}
	    A.prototype.hello = function(){
	      this.b = 1;
	    }
	    extend(A);
	
	    var B = A.extend();
	    B.implement({
	      hello: function(){
	        this.supr();
	        this.a = 2;
	      }
	    })
	    var b = new B;
	    b.hello();
	
	    expect(b.a).to.equal(2);
	    expect(b.b).to.equal(1);
	
	  })
	
	  it('_.extend should works as expect', function(){
	    var a = {a:1};
	    _.extend(a, {
	      a:2,
	      b:3
	    },true);
	
	    expect(a).to.eql({a:2,b:3})
	
	    var c = {a:1};
	    _.extend(c, {a:2})
	    expect(c).to.eql({a:1})
	
	    // expect(_.extend(c, {b:1,c:2},["c"])).to.eql({a:1,c:2})
	  })
	
	  it('diffArray should works as expect', function(){
	    expect(diffArray([], [1,2], true)).to.eql([
	      {
	        "index": 0,
	        "add": 0,
	        "removed": [
	          1,
	          2
	        ]
	      }
	    ])
	    expect(diffArray([1,2], [], true)).to.eql([
	      { index: 0, add: 2, removed: [] } 
	    ]);
	    expect(diffArray([1,2,3], [2], true)).to.eql([
	      { index: 0, add: 1, removed: [] },
	      { index: 2, add: 1, removed: []} 
	    ]);
	    var a = [1,2,3];
	    expect(diffArray(_.slice(a, 1),[], true)).to.eql([
	      { index: 0, add: 2, removed: []} 
	    ]);
	
	    expect(diffArray([{a:1},{a:3}], [{a:2}, {a:3}])).to.equal(true)
	    expect(diffArray([1,2], [1,2])).to.equal(false)
	  })
	
	  it('complex diffObject should work as expect when the values are deep Equal', function(){
	
	    var obj = {a: 1, b:2, c:3};
	    var obj2 = {a: 1, b:2, c:3};
	
	    expect( diffObject(obj, obj2, true) ).to.eql([])
	
	  })
	
	  it('complex diffObject should work as expect when the values aren"t deep Equal', function(){
	
	    var obj = { a: 1, b:2, c:3 };
	    var obj2 = { a: 1, b:2, c:4 };
	
	    expect( diffObject(obj, obj2, true) ).to.eql([ { index: 2, add: 1, removed: [ 'c' ] } ] )
	
	  })
	
	  it('complex diffObject"s equalitation should judged by value, but not the key ', function(){
	
	    var obj = { a: 1, b:2, c:3 };
	    var obj2 = { a: 1, c: 2};
	
	    expect( diffObject(obj, obj2, true) ).to.eql([ { index: 2, add: 1, removed: [] } ] )
	
	  })
	
	  it('complex diffObject should work as expect when the keys"s number aren"t equal', function(){
	
	    var obj = { a: 1, b:2, c:3 };
	    var obj2 = { a: 1, b:2};
	
	    expect( diffObject(obj, obj2, true) ).to.eql([ { index: 2, add: 1, removed: [  ] } ] )
	
	  })
	
	  it('simple diffObject should work as expect when the value are deep Equal', function(){
	
	    var obj = {a: 1, b:2, c:3};
	    var obj2 = {a: 1, b:2, c:3};
	
	    expect( diffObject(obj, obj2) ).to.equal(false)
	
	  })
	
	  it('simple diffObject should work as expect when the value aren"t deep Equal', function(){
	
	    var obj = {a: 1, b:2, c:3};
	    var obj2 = {a: 1, b:2, c:4};
	
	    expect( diffObject(obj, obj2) ).to.equal(true)
	
	  })
	
	
	  it('_.equals should works as expect', function(){
	    expect(_.equals(1,2)).to.equal(false)
	    expect(_.equals(1,1)).to.equal(true)
	    expect(_.equals(NaN,NaN)).to.equal(true)
	    expect(_.equals(null,undefined)).to.equal(false)
	  })
	
	  it('_.throttle should works as expect', function(){
	    var k=0;
	    var a =  _.throttle(function (){k++});
	    a();
	    a();
	    a();
	    a();
	    a();
	    // @TODO
	  })
	  it('_.clone should works as expect', function(){
	    var a = {a:1,b:[2]};
	    var c = [1,2,3]
	    expect(_.clone(a)).not.equal(a);
	    expect(_.clone(a)).to.eql({a:1,b:[2]});
	    expect(_.clone(c)).not.equal(c);
	    expect(_.clone(c)).to.eql([1,2,3]);
	    expect(_.clone(1)).to.eql(1);
	  })
	
	  it('_.cache should works as expect', function(){
	    var cache = _.cache(2);   
	    cache.set('name',1)
	    cache.set('name2',2)
	    cache.set('name3', 3);
	    cache.set('name4', 4);
	
	    expect(cache.get('name')).to.eql(undefined);
	    expect(cache.len()).to.eql(3);
	
	  })
	  it('_.escape should works as expect', function(){
	
	   expect(_.escape('<div hello>')).to.equal('&lt;div hello&gt;')
	   expect(_.escape('""')).to.equal('&quot;&quot;')
	  })
	
	
	
	  it("_.trackErrorPos should have no '...' prefix if not slice", function(){
	    expect(_.trackErrorPos("abcdefghi", 1)).to.equal('[1] abcdefghi\n     ^^^\n');
	    expect(_.trackErrorPos("abcdefghi", 2)).to.equal('[1] abcdefghi\n      ^^^\n');
	
	
	  })
	
	
	  describe("shim should work as expect", function(){
	    var map = {
	      string: {
	        pro: String.prototype,
	        methods: ['trim']
	      },
	      array: {
	        pro: Array.prototype,
	        methods: ['indexOf', 'forEach', 'filter']
	      },
	      array_static: {
	        pro: Array,
	        methods: ['isArray']
	      },
	      fn: {
	        pro: Function.prototype,
	        methods: ['bind']
	      }
	    }
	    for(var i in map){
	      var pair = map[i];
	      pair.preCache = {};
	      var methods = pair.methods
	      for(var i = 0; i < methods.length ; i++){
	        var method = methods[i];
	        pair.preCache[method] = pair.pro[method];
	        delete pair.pro[method];
	      }
	    }
	    shim();
	    after( function(){
	      // for(var i in map){
	      //   _.extend(map.pro, map.proCache, true);
	      // }
	    })
	
	    it("string.trim", function(){
	      expect('  dada  '.trim()).to.equal('dada')
	    })
	    it("array.indexOf", function(){
	      expect([1,2,3].indexOf(1)).to.equal(0)
	      expect([1,2,3].indexOf(-1)).to.equal(-1)
	    })
	    it("array.forEach", function(){
	      var arr = [1,2,3];
	      var res = "";
	      arr.forEach(function(item, index){
	        res += item + ':'  + index + '-';
	      })
	      expect(res).to.equal('1:0-2:1-3:2-');
	    })
	    it("array.filter", function(){
	      var arr = [3,4,5, 1];
	      var res = arr.filter(function(item, index){
	        return index < 2 || item < 2;
	      })
	      expect(res).to.eql([3,4,1]);
	    })
	    it("array.isArray", function(){
	      expect(Array.isArray([])).to.equal(true);
	      expect(Array.isArray({})).to.equal(false);
	    })
	    it("function.bind", function(){
	      var fn = function(first, two, three){
	        expect(this.a).to.equal(1)
	        expect(first).to.equal(1)
	        expect(two).to.equal(2)
	        expect(three).to.equal(3)
	      }.bind({a:1}, 1, 2)(3)
	    })
	  })
	
	})


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var expect = __webpack_require__(27);
	var Event = __webpack_require__(25);
	
	
	
	describe("EventEmitter", function(){
	  it("Event can 'mixTo' other [Object] and [Function]", function(){
	    var obj = {};
	    var Foo = function(){};
	    var obj2 = new Foo();
	    Event.mixTo(obj2);
	    Event.mixTo(obj);
	
	    expect(obj.$on).to.be.an("function");
	    expect(obj.$off).to.be.an("function");
	    expect(obj.$emit).to.be.an("function");
	    expect(obj2.$on).to.be.an("function");
	    expect(obj2.$off).to.be.an("function");
	    expect(obj2.$emit).to.be.an("function");
	  })
	
	  it("$emit|$on should works correctly with basic usage ", function(){
	    var eo = new Event();
	    var obj = {};
	    eo.$on("event1", function(name){
	      obj.name = name;
	    });
	    eo.$emit("event1", "leeluolee");
	
	    expect(obj.name).to.equal("leeluolee")
	  })
	  it("$on should accepet [Object] to act multi-binding ", function(){
	    var eo = new Event;
	    var obj = {};
	    eo.$on({
	      "changename": function(name){
	        obj.name = name
	      },
	      "changeage": function(age){
	        obj.age = age
	      }
	    });
	    eo.$emit("changeage", 12);
	    expect(obj.age).to.equal(12)
	    eo.$emit("changename", "leeluolee");
	    expect(obj.name).to.equal("leeluolee")
	  })
	
	  it("$on can bind multi event with same eventName", function(){
	    var eo = new Event();
	    var obj = {};
	    eo.$on("event1", function(name){
	      obj.name = name;
	    });
	    eo.$on("event1", function(name2){
	      obj.name2 = name2;
	    });
	    eo.$on("event1", function(name3){
	      obj.name3 = name3;
	    });
	    eo.$emit("event1", 12);
	    expect(obj.name).to.equal(12)
	    expect(obj.name2).to.equal(12)
	    expect(obj.name3).to.equal(12)
	
	  })
	
	  it("$off can unbind multi events with same eventName", function(){
	    var eo = new Event;
	    var obj = {};
	    function nameFn(name){
	      obj.name = name;
	    }
	    eo.$on("event1", nameFn);
	    eo.$on("age", function(age){
	      obj.age = age;
	    });
	    eo.$on("event1", function(name2){
	      obj.name2 = name2;
	    });
	    eo.$on("event1", function(name3){
	      obj.name3 = name3;
	    });
	
	
	    eo.$off("event1", nameFn);
	    eo.$emit("event1", 12);
	    expect(obj.name).to.equal(undefined)
	    expect(obj.name2).to.equal(12)
	    expect(obj.name3).to.equal(12)
	
	    eo.$off("event1");
	    eo.$emit("event1", 120);
	    expect(obj.name).to.equal(undefined)
	    expect(obj.name2).to.equal(12)
	    expect(obj.name3).to.equal(12)
	
	  })
	  it("$off can unbind all events when have no arguments passed in", function(){
	    var eo = new Event;
	    var obj = {};
	    function nameFn(name){
	      obj.name = name;
	    }
	    eo.$on("event1", nameFn);
	    eo.$on("age", function(age){
	      obj.age = age;
	    });
	    eo.$on("event1", function(name2){
	      obj.name2 = name2;
	    });
	    eo.$on("event1", function(name3){
	      obj.name3 = name3;
	    });
	
	    eo.$off();
	    eo.$emit("age", 120);
	    eo.$emit("event1", 120);
	    expect(obj.age).to.equal(undefined)
	    expect(obj.name).to.equal(undefined)
	    expect(obj.name1).to.equal(undefined)
	    expect(obj.name2).to.equal(undefined)
	  })
	
	
	})


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var env =  __webpack_require__(28);
	var config = __webpack_require__(29); 
	var Regular = module.exports = __webpack_require__(30);
	var Parser = Regular.Parser;
	var Lexer = Regular.Lexer;
	
	// if(env.browser){
	    __webpack_require__(33);
	    __webpack_require__(34);
	    __webpack_require__(35);
	    Regular.dom = __webpack_require__(17);
	// }
	Regular.env = env;
	Regular.util = __webpack_require__(18);
	Regular.parse = function(str, options){
	  options = options || {};
	
	  if(options.BEGIN || options.END){
	    if(options.BEGIN) config.BEGIN = options.BEGIN;
	    if(options.END) config.END = options.END;
	    Lexer.setup();
	  }
	  var ast = new Parser(str).parse();
	  return !options.stringify? ast : JSON.stringify(ast);
	}
	Regular.Cursor =__webpack_require__(31) 
	
	Regular.isServer = env.node;
	Regular.isRegular = function( Comp ){
	  return !( Comp.prototype instanceof Regular );
	}
	
	


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint -W082 */ 
	
	// thanks for angular && mootools for some concise&cross-platform  implemention
	// =====================================
	
	// The MIT License
	// Copyright (c) 2010-2014 Google, Inc. http://angularjs.org
	
	// ---
	// license: MIT-style license. http://mootools.net
	
	
	if(typeof window !== 'undefined'){
	  
	var dom = module.exports;
	var env = __webpack_require__(28);
	var _ = __webpack_require__(18);
	var tNode = document.createElement('div')
	var addEvent, removeEvent;
	var noop = function(){}
	
	var namespaces = {
	  html: "http://www.w3.org/1999/xhtml",
	  svg: "http://www.w3.org/2000/svg"
	}
	
	dom.body = document.body;
	dom.doc = document;
	dom.tNode = tNode;
	
	
	// camelCase
	var camelCase = function (str){
	  return ("" + str).replace(/-\D/g, function(match){
	    return match.charAt(1).toUpperCase();
	  });
	}
	
	
	
	if(tNode.addEventListener){
	  addEvent = function(node, type, fn) {
	    node.addEventListener(type, fn, false);
	  }
	  removeEvent = function(node, type, fn) {
	    node.removeEventListener(type, fn, false) 
	  }
	}else{
	  addEvent = function(node, type, fn) {
	    node.attachEvent('on' + type, fn);
	  }
	  removeEvent = function(node, type, fn) {
	    node.detachEvent('on' + type, fn); 
	  }
	}
	
	
	dom.msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
	if (isNaN(dom.msie)) {
	  dom.msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
	}
	
	dom.find = function(sl){
	  if(document.querySelector) {
	    try{
	      return document.querySelector(sl);
	    }catch(e){
	
	    }
	  }
	  if(sl.indexOf('#')!==-1) return document.getElementById( sl.slice(1) );
	}
	
	
	dom.inject = function(node, refer, position){
	
	  position = position || 'bottom';
	  if(!node) return ;
	  if(Array.isArray(node)){
	    var tmp = node;
	    node = dom.fragment();
	    for(var i = 0,len = tmp.length; i < len ;i++){
	      node.appendChild(tmp[i])
	    }
	  }
	
	  var firstChild, next;
	  switch(position){
	    case 'bottom':
	      refer.appendChild( node );
	      break;
	    case 'top':
	      if( firstChild = refer.firstChild ){
	        refer.insertBefore( node, refer.firstChild );
	      }else{
	        refer.appendChild( node );
	      }
	      break;
	    case 'after':
	      if( next = refer.nextSibling ){
	        next.parentNode.insertBefore( node, next );
	      }else{
	        refer.parentNode.appendChild( node );
	      }
	      break;
	    case 'before':
	      refer.parentNode.insertBefore( node, refer );
	  }
	}
	
	
	dom.id = function(id){
	  return document.getElementById(id);
	}
	
	// createElement 
	dom.create = function(type, ns){
	  if(ns === 'svg'){
	    if(!env.svg) throw Error('the env need svg support')
	    ns = namespaces.svg;
	  }
	  return !ns? document.createElement(type): document.createElementNS(ns, type);
	}
	
	// documentFragment
	dom.fragment = function(){
	  return document.createDocumentFragment();
	}
	
	
	
	
	var specialAttr = {
	  'class': function(node, value){
	    ('className' in node && (node.namespaceURI === namespaces.html || !node.namespaceURI)) ?
	      node.className = (value || '') : node.setAttribute('class', value);
	  },
	  'for': function(node, value){
	    ('htmlFor' in node) ? node.htmlFor = value : node.setAttribute('for', value);
	  },
	  'style': function(node, value){
	    (node.style) ? node.style.cssText = value : node.setAttribute('style', value);
	  },
	  'value': function(node, value){
	    node.value = (value != null) ? value : '';
	  }
	}
	
	
	// attribute Setter & Getter
	dom.attr = function(node, name, value){
	  if (_.isBooleanAttr(name)) {
	    if (typeof value !== 'undefined') {
	      if (!!value) {
	        node[name] = true;
	        node.setAttribute(name, name);
	        // lt ie7 . the javascript checked setting is in valid
	        //http://bytes.com/topic/javascript/insights/799167-browser-quirk-dynamically-appended-checked-checkbox-does-not-appear-checked-ie
	        if(dom.msie && dom.msie <=7 ) node.defaultChecked = true
	      } else {
	        node[name] = false;
	        node.removeAttribute(name);
	      }
	    } else {
	      return (node[name] ||
	               (node.attributes.getNamedItem(name)|| noop).specified) ? name : undefined;
	    }
	  } else if (typeof (value) !== 'undefined') {
	    // if in specialAttr;
	    if(specialAttr[name]) specialAttr[name](node, value);
	    else if(value === null) node.removeAttribute(name)
	    else node.setAttribute(name, value);
	  } else if (node.getAttribute) {
	    // the extra argument "2" is to get the right thing for a.href in IE, see jQuery code
	    // some elements (e.g. Document) don't have get attribute, so return undefined
	    var ret = node.getAttribute(name, 2);
	    // normalize non-existing attributes to undefined (as jQuery)
	    return ret === null ? undefined : ret;
	  }
	}
	
	
	dom.on = function(node, type, handler){
	  var types = type.split(' ');
	  handler.real = function(ev){
	    var $event = new Event(ev);
	    $event.origin = node;
	    handler.call(node, $event);
	  }
	  types.forEach(function(type){
	    type = fixEventName(node, type);
	    addEvent(node, type, handler.real);
	  });
	}
	dom.off = function(node, type, handler){
	  var types = type.split(' ');
	  handler = handler.real || handler;
	  types.forEach(function(type){
	    type = fixEventName(node, type);
	    removeEvent(node, type, handler);
	  })
	}
	
	
	dom.text = (function (){
	  var map = {};
	  if (dom.msie && dom.msie < 9) {
	    map[1] = 'innerText';    
	    map[3] = 'nodeValue';    
	  } else {
	    map[1] = map[3] = 'textContent';
	  }
	  
	  return function (node, value) {
	    var textProp = map[node.nodeType];
	    if (value == null) {
	      return textProp ? node[textProp] : '';
	    }
	    node[textProp] = value;
	  }
	})();
	
	
	dom.html = function( node, html ){
	  if(typeof html === "undefined"){
	    return node.innerHTML;
	  }else{
	    node.innerHTML = html;
	  }
	}
	
	dom.replace = function(node, replaced){
	  if(replaced.parentNode) replaced.parentNode.replaceChild(node, replaced);
	}
	
	dom.remove = function(node){
	  if(node.parentNode) node.parentNode.removeChild(node);
	}
	
	// css Settle & Getter from angular
	// =================================
	// it isnt computed style 
	dom.css = function(node, name, value){
	  if( _.typeOf(name) === "object" ){
	    for(var i in name){
	      if( name.hasOwnProperty(i) ){
	        dom.css( node, i, name[i] );
	      }
	    }
	    return;
	  }
	  if ( typeof value !== "undefined" ) {
	
	    name = camelCase(name);
	    if(name) node.style[name] = value;
	
	  } else {
	
	    var val;
	    if (dom.msie <= 8) {
	      // this is some IE specific weirdness that jQuery 1.6.4 does not sure why
	      val = node.currentStyle && node.currentStyle[name];
	      if (val === '') val = 'auto';
	    }
	    val = val || node.style[name];
	    if (dom.msie <= 8) {
	      val = val === '' ? undefined : val;
	    }
	    return  val;
	  }
	}
	
	dom.addClass = function(node, className){
	  var current = node.className || "";
	  if ((" " + current + " ").indexOf(" " + className + " ") === -1) {
	    node.className = current? ( current + " " + className ) : className;
	  }
	}
	
	dom.delClass = function(node, className){
	  var current = node.className || "";
	  node.className = (" " + current + " ").replace(" " + className + " ", " ").trim();
	}
	
	dom.hasClass = function(node, className){
	  var current = node.className || "";
	  return (" " + current + " ").indexOf(" " + className + " ") !== -1;
	}
	
	
	
	// simple Event wrap
	
	//http://stackoverflow.com/questions/11068196/ie8-ie7-onchange-event-is-emited-only-after-repeated-selection
	function fixEventName(elem, name){
	  return (name === 'change'  &&  dom.msie < 9 && 
	      (elem && elem.tagName && elem.tagName.toLowerCase()==='input' && 
	        (elem.type === 'checkbox' || elem.type === 'radio')
	      )
	    )? 'click': name;
	}
	
	var rMouseEvent = /^(?:click|dblclick|contextmenu|DOMMouseScroll|mouse(?:\w+))$/
	var doc = document;
	doc = (!doc.compatMode || doc.compatMode === 'CSS1Compat') ? doc.documentElement : doc.body;
	function Event(ev){
	  ev = ev || window.event;
	  if(ev._fixed) return ev;
	  this.event = ev;
	  this.target = ev.target || ev.srcElement;
	
	  var type = this.type = ev.type;
	  var button = this.button = ev.button;
	
	  // if is mouse event patch pageX
	  if(rMouseEvent.test(type)){ //fix pageX
	    this.pageX = (ev.pageX != null) ? ev.pageX : ev.clientX + doc.scrollLeft;
	    this.pageY = (ev.pageX != null) ? ev.pageY : ev.clientY + doc.scrollTop;
	    if (type === 'mouseover' || type === 'mouseout'){// fix relatedTarget
	      var related = ev.relatedTarget || ev[(type === 'mouseover' ? 'from' : 'to') + 'Element'];
	      while (related && related.nodeType === 3) related = related.parentNode;
	      this.relatedTarget = related;
	    }
	  }
	  // if is mousescroll
	  if (type === 'DOMMouseScroll' || type === 'mousewheel'){
	    // ff ev.detail: 3    other ev.wheelDelta: -120
	    this.wheelDelta = (ev.wheelDelta) ? ev.wheelDelta / 120 : -(ev.detail || 0) / 3;
	  }
	  
	  // fix which
	  this.which = ev.which || ev.keyCode;
	  if( !this.which && button !== undefined){
	    // http://api.jquery.com/event.which/ use which
	    this.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
	  }
	  this._fixed = true;
	}
	
	_.extend(Event.prototype, {
	  immediateStop: _.isFalse,
	  stop: function(){
	    this.preventDefault().stopPropagation();
	  },
	  preventDefault: function(){
	    if (this.event.preventDefault) this.event.preventDefault();
	    else this.event.returnValue = false;
	    return this;
	  },
	  stopPropagation: function(){
	    if (this.event.stopPropagation) this.event.stopPropagation();
	    else this.event.cancelBubble = true;
	    return this;
	  },
	  stopImmediatePropagation: function(){
	    if(this.event.stopImmediatePropagation) this.event.stopImmediatePropagation();
	  }
	})
	
	
	dom.nextFrame = (function(){
	    var request = window.requestAnimationFrame ||
	                  window.webkitRequestAnimationFrame ||
	                  window.mozRequestAnimationFrame|| 
	                  function(callback){
	                    setTimeout(callback, 16)
	                  }
	
	    var cancel = window.cancelAnimationFrame ||
	                 window.webkitCancelAnimationFrame ||
	                 window.mozCancelAnimationFrame ||
	                 window.webkitCancelRequestAnimationFrame ||
	                 function(tid){
	                    clearTimeout(tid)
	                 }
	  
	  return function(callback){
	    var id = request(callback);
	    return function(){ cancel(id); }
	  }
	})();
	
	// 3ks for angular's raf  service
	var k
	dom.nextReflow = dom.msie? function(callback){
	  return dom.nextFrame(function(){
	    k = document.body.offsetWidth;
	    callback();
	  })
	}: dom.nextFrame;
	
	}
	
	
	


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {__webpack_require__(22)();
	
	
	
	var _  = module.exports;
	var entities = __webpack_require__(32);
	var slice = [].slice;
	var o2str = ({}).toString;
	var win = typeof window !=='undefined'? window: global;
	
	
	_.noop = function(){};
	_.uid = (function(){
	  var _uid=0;
	  return function(){
	    return _uid++;
	  }
	})();
	
	_.extend = function( o1, o2, override ){
	  // if(_.typeOf(override) === 'array'){
	  //  for(var i = 0, len = override.length; i < len; i++ ){
	  //   var key = override[i];
	  //   o1[key] = o2[key];
	  //  } 
	  // }else{
	  for(var i in o2){
	    if( typeof o1[i] === "undefined" || override === true ){
	      o1[i] = o2[i]
	    }
	  }
	  // }
	  return o1;
	}
	
	_.keys = function(obj){
	  if(Object.keys) return Object.keys(obj);
	  var res = [];
	  for(var i in obj) if(obj.hasOwnProperty(i)){
	    res.push(i);
	  }
	  return res;
	}
	
	_.varName = 'd';
	_.setName = 'p_';
	_.ctxName = 'c';
	_.extName = 'e';
	
	_.rWord = /^[\$\w]+$/;
	_.rSimpleAccessor = /^[\$\w]+(\.[\$\w]+)*$/;
	
	_.nextTick = typeof setImmediate === 'function'? 
	  setImmediate.bind(win) : 
	  function(callback) {
	    setTimeout(callback, 0) 
	  }
	
	
	
	_.prefix = "var " + _.varName + "=" + _.ctxName + ".data;" +  _.extName  + "=" + _.extName + "||'';";
	
	
	_.slice = function(obj, start, end){
	  var res = [];
	  for(var i = start || 0, len = end || obj.length; i < len; i++){
	    var item = obj[i];
	    res.push(item)
	  }
	  return res;
	}
	
	_.typeOf = function (o) {
	  return o == null ? String(o) :o2str.call(o).slice(8, -1).toLowerCase();
	}
	
	
	_.makePredicate = function makePredicate(words, prefix) {
	    if (typeof words === "string") {
	        words = words.split(" ");
	    }
	    var f = "",
	    cats = [];
	    out: for (var i = 0; i < words.length; ++i) {
	        for (var j = 0; j < cats.length; ++j){
	          if (cats[j][0].length === words[i].length) {
	              cats[j].push(words[i]);
	              continue out;
	          }
	        }
	        cats.push([words[i]]);
	    }
	    function compareTo(arr) {
	        if (arr.length === 1) return f += "return str === '" + arr[0] + "';";
	        f += "switch(str){";
	        for (var i = 0; i < arr.length; ++i){
	           f += "case '" + arr[i] + "':";
	        }
	        f += "return true}return false;";
	    }
	
	    // When there are more than three length categories, an outer
	    // switch first dispatches on the lengths, to save on comparisons.
	    if (cats.length > 3) {
	        cats.sort(function(a, b) {
	            return b.length - a.length;
	        });
	        f += "switch(str.length){";
	        for (var i = 0; i < cats.length; ++i) {
	            var cat = cats[i];
	            f += "case " + cat[0].length + ":";
	            compareTo(cat);
	        }
	        f += "}";
	
	        // Otherwise, simply generate a flat `switch` statement.
	    } else {
	        compareTo(words);
	    }
	    return new Function("str", f);
	}
	
	
	_.trackErrorPos = (function (){
	  // linebreak
	  var lb = /\r\n|[\n\r\u2028\u2029]/g;
	  var minRange = 20, maxRange = 20;
	  function findLine(lines, pos){
	    var tmpLen = 0;
	    for(var i = 0,len = lines.length; i < len; i++){
	      var lineLen = (lines[i] || "").length;
	
	      if(tmpLen + lineLen > pos) {
	        return {num: i, line: lines[i], start: pos - i - tmpLen , prev:lines[i-1], next: lines[i+1] };
	      }
	      // 1 is for the linebreak
	      tmpLen = tmpLen + lineLen ;
	    }
	  }
	  function formatLine(str,  start, num, target){
	    var len = str.length;
	    var min = start - minRange;
	    if(min < 0) min = 0;
	    var max = start + maxRange;
	    if(max > len) max = len;
	
	    var remain = str.slice(min, max);
	    var prefix = "[" +(num+1) + "] " + (min > 0? ".." : "")
	    var postfix = max < len ? "..": "";
	    var res = prefix + remain + postfix;
	    if(target) res += "\n" + new Array(start-min + prefix.length + 1).join(" ") + "^^^";
	    return res;
	  }
	  return function(input, pos){
	    if(pos > input.length-1) pos = input.length-1;
	    lb.lastIndex = 0;
	    var lines = input.split(lb);
	    var line = findLine(lines,pos);
	    var start = line.start, num = line.num;
	
	    return (line.prev? formatLine(line.prev, start, num-1 ) + '\n': '' ) + 
	      formatLine(line.line, start, num, true) + '\n' + 
	      (line.next? formatLine(line.next, start, num+1 ) + '\n': '' );
	
	  }
	})();
	
	
	var ignoredRef = /\((\?\!|\?\:|\?\=)/g;
	_.findSubCapture = function (regStr) {
	  var left = 0,
	    right = 0,
	    len = regStr.length,
	    ignored = regStr.match(ignoredRef); // ignored uncapture
	  if(ignored) ignored = ignored.length
	  else ignored = 0;
	  for (; len--;) {
	    var letter = regStr.charAt(len);
	    if (len === 0 || regStr.charAt(len - 1) !== "\\" ) { 
	      if (letter === "(") left++;
	      if (letter === ")") right++;
	    }
	  }
	  if (left !== right) throw "RegExp: "+ regStr + "'s bracket is not marched";
	  else return left - ignored;
	};
	
	
	_.escapeRegExp = function( str){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
	  return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, function(match){
	    return '\\' + match;
	  });
	};
	
	
	var rEntity = new RegExp("&(?:(#x[0-9a-fA-F]+)|(#[0-9]+)|(" + _.keys(entities).join('|') + '));', 'gi');
	
	_.convertEntity = function(chr){
	
	  return ("" + chr).replace(rEntity, function(all, hex, dec, capture){
	    var charCode;
	    if( dec ) charCode = parseInt( dec.slice(1), 10 );
	    else if( hex ) charCode = parseInt( hex.slice(2), 16 );
	    else charCode = entities[capture]
	
	    return String.fromCharCode( charCode )
	  });
	
	}
	
	
	// simple get accessor
	
	_.createObject = function(o, props){
	    function Foo() {}
	    Foo.prototype = o;
	    var res = new Foo;
	    if(props) _.extend(res, props);
	    return res;
	}
	
	_.createProto = function(fn, o){
	    function Foo() { this.constructor = fn;}
	    Foo.prototype = o;
	    return (fn.prototype = new Foo());
	}
	
	
	
	/**
	clone
	*/
	_.clone = function clone(obj){
	    var type = _.typeOf(obj);
	    if(type === 'array'){
	      var cloned = [];
	      for(var i=0,len = obj.length; i< len;i++){
	        cloned[i] = obj[i]
	      }
	      return cloned;
	    }
	    if(type === 'object'){
	      var cloned = {};
	      for(var i in obj) if(obj.hasOwnProperty(i)){
	        cloned[i] = obj[i];
	      }
	      return cloned;
	    }
	    return obj;
	  }
	
	_.equals = function(now, old){
	  var type = typeof now;
	  if(type === 'number' && typeof old === 'number'&& isNaN(now) && isNaN(old)) return true
	  return now === old;
	}
	
	var dash = /-([a-z])/g;
	_.camelCase = function(str){
	  return str.replace(dash, function(all, capture){
	    return capture.toUpperCase();
	  })
	}
	
	
	
	_.throttle = function throttle(func, wait){
	  var wait = wait || 100;
	  var context, args, result;
	  var timeout = null;
	  var previous = 0;
	  var later = function() {
	    previous = +new Date;
	    timeout = null;
	    result = func.apply(context, args);
	    context = args = null;
	  };
	  return function() {
	    var now = + new Date;
	    var remaining = wait - (now - previous);
	    context = this;
	    args = arguments;
	    if (remaining <= 0 || remaining > wait) {
	      clearTimeout(timeout);
	      timeout = null;
	      previous = now;
	      result = func.apply(context, args);
	      context = args = null;
	    } else if (!timeout) {
	      timeout = setTimeout(later, remaining);
	    }
	    return result;
	  };
	};
	
	// hogan escape
	// ==============
	_.escape = (function(){
	  var rAmp = /&/g,
	      rLt = /</g,
	      rGt = />/g,
	      rApos = /\'/g,
	      rQuot = /\"/g,
	      hChars = /[&<>\"\']/;
	
	  return function(str) {
	    return hChars.test(str) ?
	      str
	        .replace(rAmp, '&amp;')
	        .replace(rLt, '&lt;')
	        .replace(rGt, '&gt;')
	        .replace(rApos, '&#39;')
	        .replace(rQuot, '&quot;') :
	      str;
	  }
	})();
	
	_.cache = function(max){
	  max = max || 1000;
	  var keys = [],
	      cache = {};
	  return {
	    set: function(key, value) {
	      if (keys.length > this.max) {
	        cache[keys.shift()] = undefined;
	      }
	      // 
	      if(cache[key] === undefined){
	        keys.push(key);
	      }
	      cache[key] = value;
	      return value;
	    },
	    get: function(key) {
	      if (key === undefined) return cache;
	      return cache[key];
	    },
	    max: max,
	    len:function(){
	      return keys.length;
	    }
	  };
	}
	
	// // setup the raw Expression
	// _.touchExpression = function(expr){
	//   if(expr.type === 'expression'){
	//   }
	//   return expr;
	// }
	
	
	// handle the same logic on component's `on-*` and element's `on-*`
	// return the fire object
	_.handleEvent = function(value, type ){
	  var self = this, evaluate;
	  if(value.type === 'expression'){ // if is expression, go evaluated way
	    evaluate = value.get;
	  }
	  if(evaluate){
	    return function fire(obj){
	      self.$update(function(){
	        var data = this.data;
	        data.$event = obj;
	        var res = evaluate(self);
	        if(res === false && obj && obj.preventDefault) obj.preventDefault();
	        data.$event = undefined;
	      })
	
	    }
	  }else{
	    return function fire(){
	      var args = slice.call(arguments)      
	      args.unshift(value);
	      self.$update(function(){
	        self.$emit.apply(self, args);
	      })
	    }
	  }
	}
	
	// only call once
	_.once = function(fn){
	  var time = 0;
	  return function(){
	    if( time++ === 0) fn.apply(this, arguments);
	  }
	}
	
	_.fixObjStr = function(str){
	  if(str.trim().indexOf('{') !== 0){
	    return '{' + str + '}';
	  }
	  return str;
	}
	
	
	_.map= function(array, callback){
	  var res = [];
	  for (var i = 0, len = array.length; i < len; i++) {
	    res.push(callback(array[i], i));
	  }
	  return res;
	}
	
	function log(msg, type){
	  if(typeof console !== "undefined")  console[type || "log"](msg);
	}
	
	_.log = log;
	
	
	
	
	//http://www.w3.org/html/wg/drafts/html/master/single-page.html#void-elements
	_.isVoidTag = _.makePredicate("area base br col embed hr img input keygen link menuitem meta param source track wbr r-content");
	_.isBooleanAttr = _.makePredicate('selected checked disabled readonly required open autofocus controls autoplay compact loop defer multiple');
	
	_.isFalse - function(){return false}
	_.isTrue - function(){return true}
	
	_.isExpr = function(expr){
	  return expr && expr.type === 'expression';
	}
	// @TODO: make it more strict
	_.isGroup = function(group){
	  return group.inject || group.$inject;
	}
	
	_.blankReg = /\s+/; 
	
	_.getCompileFn = function(source, ctx, options){
	  return function( passedOptions ){
	    if( passedOptions && options ) _.extend( passedOptions , options );
	    else passedOptions = options;
	    return ctx.$compile(source, passedOptions )
	  }
	  return ctx.$compile.bind(ctx,source, options)
	}
	
	_.eventReg = /^on-(\w[-\w]+)$/;
	
	_.toText = function(obj){
	  return obj == null ? "": "" + obj;
	}
	
	
	
	
	
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(18);
	var dom  = __webpack_require__(17);
	var animate = {};
	var env = __webpack_require__(28);
	
	
	if(typeof window !== 'undefined'){
	var 
	  transitionEnd = 'transitionend', 
	  animationEnd = 'animationend', 
	  transitionProperty = 'transition', 
	  animationProperty = 'animation';
	
	if(!('ontransitionend' in window)){
	  if('onwebkittransitionend' in window) {
	    
	    // Chrome/Saf (+ Mobile Saf)/Android
	    transitionEnd += ' webkitTransitionEnd';
	    transitionProperty = 'webkitTransition'
	  } else if('onotransitionend' in dom.tNode || navigator.appName === 'Opera') {
	
	    // Opera
	    transitionEnd += ' oTransitionEnd';
	    transitionProperty = 'oTransition';
	  }
	}
	if(!('onanimationend' in window)){
	  if ('onwebkitanimationend' in window){
	    // Chrome/Saf (+ Mobile Saf)/Android
	    animationEnd += ' webkitAnimationEnd';
	    animationProperty = 'webkitAnimation';
	
	  }else if ('onoanimationend' in dom.tNode){
	    // Opera
	    animationEnd += ' oAnimationEnd';
	    animationProperty = 'oAnimation';
	  }
	}
	}
	
	/**
	 * inject node with animation
	 * @param  {[type]} node      [description]
	 * @param  {[type]} refer     [description]
	 * @param  {[type]} direction [description]
	 * @return {[type]}           [description]
	 */
	animate.inject = function( node, refer ,direction, callback ){
	  callback = callback || _.noop;
	  if( Array.isArray(node) ){
	    var fragment = dom.fragment();
	    var count=0;
	
	    for(var i = 0,len = node.length;i < len; i++ ){
	      fragment.appendChild(node[i]); 
	    }
	    dom.inject(fragment, refer, direction);
	
	    // if all nodes is done, we call the callback
	    var enterCallback = function (){
	      count++;
	      if( count === len ) callback();
	    }
	    if(len === count) callback();
	    for( i = 0; i < len; i++ ){
	      if(node[i].onenter){
	        node[i].onenter(enterCallback);
	      }else{
	        enterCallback();
	      }
	    }
	  }else{
	    if(!node) return;
	    dom.inject( node, refer, direction );
	    if(node.onenter){
	      node.onenter(callback)
	    }else{
	      callback();
	    }
	  }
	}
	
	/**
	 * remove node with animation
	 * @param  {[type]}   node     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	animate.remove = function(node, callback){
	  if(!node) return;
	  var count = 0;
	  function loop(){
	    count++;
	    if(count === len) callback && callback()
	  }
	  if(Array.isArray(node)){
	    for(var i = 0, len = node.length; i < len ; i++){
	      animate.remove(node[i], loop)
	    }
	    return node;
	  }
	  if(node.onleave){
	    node.onleave(function(){
	      removeDone(node, callback)
	    })
	  }else{
	    removeDone(node, callback)
	  }
	}
	
	var removeDone = function (node, callback){
	    dom.remove(node);
	    callback && callback();
	}
	
	
	
	animate.startClassAnimate = function ( node, className,  callback, mode ){
	  var activeClassName, timeout, tid, onceAnim;
	  if( (!animationEnd && !transitionEnd) || env.isRunning ){
	    return callback();
	  }
	
	  if(mode !== 4){
	    onceAnim = _.once(function onAnimateEnd(){
	      if(tid) clearTimeout(tid);
	
	      if(mode === 2) {
	        dom.delClass(node, activeClassName);
	      }
	      if(mode !== 3){ // mode hold the class
	        dom.delClass(node, className);
	      }
	      dom.off(node, animationEnd, onceAnim)
	      dom.off(node, transitionEnd, onceAnim)
	
	      callback();
	
	    });
	  }else{
	    onceAnim = _.once(function onAnimateEnd(){
	      if(tid) clearTimeout(tid);
	      callback();
	    });
	  }
	  if(mode === 2){ // auto removed
	    dom.addClass( node, className );
	
	    activeClassName = _.map(className.split(/\s+/), function(name){
	       return name + '-active';
	    }).join(" ");
	
	    dom.nextReflow(function(){
	      dom.addClass( node, activeClassName );
	      timeout = getMaxTimeout( node );
	      tid = setTimeout( onceAnim, timeout );
	    });
	
	  }else if(mode===4){
	    dom.nextReflow(function(){
	      dom.delClass( node, className );
	      timeout = getMaxTimeout( node );
	      tid = setTimeout( onceAnim, timeout );
	    });
	
	  }else{
	    dom.nextReflow(function(){
	      dom.addClass( node, className );
	      timeout = getMaxTimeout( node );
	      tid = setTimeout( onceAnim, timeout );
	    });
	  }
	
	
	
	  dom.on( node, animationEnd, onceAnim )
	  dom.on( node, transitionEnd, onceAnim )
	  return onceAnim;
	}
	
	
	animate.startStyleAnimate = function(node, styles, callback){
	  var timeout, onceAnim, tid;
	
	  dom.nextReflow(function(){
	    dom.css( node, styles );
	    timeout = getMaxTimeout( node );
	    tid = setTimeout( onceAnim, timeout );
	  });
	
	
	  onceAnim = _.once(function onAnimateEnd(){
	    if(tid) clearTimeout(tid);
	
	    dom.off(node, animationEnd, onceAnim)
	    dom.off(node, transitionEnd, onceAnim)
	
	    callback();
	
	  });
	
	  dom.on( node, animationEnd, onceAnim )
	  dom.on( node, transitionEnd, onceAnim )
	
	  return onceAnim;
	}
	
	
	/**
	 * get maxtimeout
	 * @param  {Node} node 
	 * @return {[type]}   [description]
	 */
	function getMaxTimeout(node){
	  var timeout = 0,
	    tDuration = 0,
	    tDelay = 0,
	    aDuration = 0,
	    aDelay = 0,
	    ratio = 5 / 3,
	    styles ;
	
	  if(window.getComputedStyle){
	
	    styles = window.getComputedStyle(node),
	    tDuration = getMaxTime( styles[transitionProperty + 'Duration']) || tDuration;
	    tDelay = getMaxTime( styles[transitionProperty + 'Delay']) || tDelay;
	    aDuration = getMaxTime( styles[animationProperty + 'Duration']) || aDuration;
	    aDelay = getMaxTime( styles[animationProperty + 'Delay']) || aDelay;
	    timeout = Math.max( tDuration+tDelay, aDuration + aDelay );
	
	  }
	  return timeout * 1000 * ratio;
	}
	
	function getMaxTime(str){
	
	  var maxTimeout = 0, time;
	
	  if(!str) return 0;
	
	  str.split(",").forEach(function(str){
	
	    time = parseFloat(str);
	    if( time > maxTimeout ) maxTimeout = time;
	
	  });
	
	  return maxTimeout;
	}
	
	module.exports = animate;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// some nested  operation in ast 
	// --------------------------------
	
	var dom = __webpack_require__(17);
	var animate = __webpack_require__(19);
	
	var combine = module.exports = {
	
	  // get the initial dom in object
	  node: function(item){
	    var children,node, nodes;
	    if(!item) return;
	    if(item.element) return item.element;
	    if(typeof item.node === "function") return item.node();
	    if(typeof item.nodeType === "number") return item;
	    if(item.group) return combine.node(item.group)
	    if(children = item.children){
	      if(children.length === 1){
	        return combine.node(children[0]);
	      }
	      nodes = [];
	      for(var i = 0, len = children.length; i < len; i++ ){
	        node = combine.node(children[i]);
	        if(Array.isArray(node)){
	          nodes.push.apply(nodes, node)
	        }else if(node) {
	          nodes.push(node)
	        }
	      }
	      return nodes;
	    }
	  },
	  // @TODO remove _gragContainer
	  inject: function(node, pos ){
	    var group = this;
	    var fragment = combine.node(group.group || group);
	    if(node === false) {
	      animate.remove(fragment)
	      return group;
	    }else{
	      if(!fragment) return group;
	      if(typeof node === 'string') node = dom.find(node);
	      if(!node) throw Error('injected node is not found');
	      // use animate to animate firstchildren
	      animate.inject(fragment, node, pos);
	    }
	    // if it is a component
	    if(group.$emit) {
	      var preParent = group.parentNode;
	      var newParent = (pos ==='after' || pos === 'before')? node.parentNode : node;
	      group.parentNode = newParent;
	      group.$emit("$inject", node, pos, preParent);
	    }
	    return group;
	  },
	
	  // get the last dom in object(for insertion operation)
	  last: function(item){
	    var children = item.children;
	
	    if(typeof item.last === "function") return item.last();
	    if(typeof item.nodeType === "number") return item;
	
	    if(children && children.length) return combine.last(children[children.length - 1]);
	    if(item.group) return combine.last(item.group);
	
	  },
	
	  destroy: function(item, first){
	    if(!item) return;
	    if(Array.isArray(item)){
	      for(var i = 0, len = item.length; i < len; i++ ){
	        combine.destroy(item[i], first);
	      }
	    }
	    var children = item.children;
	    if(typeof item.destroy === "function") return item.destroy(first);
	    if(typeof item.nodeType === "number" && first)  dom.remove(item);
	    if(children && children.length){
	      combine.destroy(children, true);
	      item.children = null;
	    }
	  }
	
	}
	
	
	// @TODO: need move to dom.js
	dom.element = function( component, all ){
	  if(!component) return !all? null: [];
	  var nodes = combine.node( component );
	  if( nodes.nodeType === 1 ) return all? [nodes]: nodes;
	  var elements = [];
	  for(var i = 0; i<nodes.length ;i++){
	    var node = nodes[i];
	    if( node && node.nodeType === 1){
	      if(!all) return node;
	      elements.push(node);
	    } 
	  }
	  return !all? elements[0]: elements;
	}
	
	
	


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var exprCache = __webpack_require__(28).exprCache;
	var _ = __webpack_require__(18);
	var Parser = __webpack_require__(36);
	module.exports = {
	  expression: function(expr, simple){
	    // @TODO cache
	    if( typeof expr === 'string' && ( expr = expr.trim() ) ){
	      expr = exprCache.get( expr ) || exprCache.set( expr, new Parser( expr, { mode: 2, expression: true } ).expression() )
	    }
	    if(expr) return expr;
	  },
	  parse: function(template){
	    return new Parser(template).parse();
	  }
	}
	


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// shim for es5
	var slice = [].slice;
	var tstr = ({}).toString;
	
	function extend(o1, o2 ){
	  for(var i in o2) if( o1[i] === undefined){
	    o1[i] = o2[i]
	  }
	  return o2;
	}
	
	
	module.exports = function(){
	  // String proto ;
	  extend(String.prototype, {
	    trim: function(){
	      return this.replace(/^\s+|\s+$/g, '');
	    }
	  });
	
	
	  // Array proto;
	  extend(Array.prototype, {
	    indexOf: function(obj, from){
	      from = from || 0;
	      for (var i = from, len = this.length; i < len; i++) {
	        if (this[i] === obj) return i;
	      }
	      return -1;
	    },
	    // polyfill from MDN 
	    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
	    forEach: function(callback, ctx){
	      var k = 0;
	
	      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
	      var O = Object(this);
	
	      var len = O.length >>> 0; 
	
	      if ( typeof callback !== "function" ) {
	        throw new TypeError( callback + " is not a function" );
	      }
	
	      // 7. Repeat, while k < len
	      while( k < len ) {
	
	        var kValue;
	
	        if ( k in O ) {
	
	          kValue = O[ k ];
	
	          callback.call( ctx, kValue, k, O );
	        }
	        k++;
	      }
	    },
	    // @deprecated
	    //  will be removed at 0.5.0
	    filter: function(fun, context){
	
	      var t = Object(this);
	      var len = t.length >>> 0;
	      if (typeof fun !== "function")
	        throw new TypeError();
	
	      var res = [];
	      for (var i = 0; i < len; i++)
	      {
	        if (i in t)
	        {
	          var val = t[i];
	          if (fun.call(context, val, i, t))
	            res.push(val);
	        }
	      }
	
	      return res;
	    }
	  });
	
	  // Function proto;
	  extend(Function.prototype, {
	    bind: function(context){
	      var fn = this;
	      var preArgs = slice.call(arguments, 1);
	      return function(){
	        var args = preArgs.concat(slice.call(arguments));
	        return fn.apply(context, args);
	      }
	    }
	  })
	  
	  // Array
	  extend(Array, {
	    isArray: function(arr){
	      return tstr.call(arr) === "[object Array]";
	    }
	  })
	}
	


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	// (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	// Backbone may be freely distributed under the MIT license.
	// For all details and documentation:
	// http://backbonejs.org
	
	// klass: a classical JS OOP façade
	// https://github.com/ded/klass
	// License MIT (c) Dustin Diaz 2014
	  
	// inspired by backbone's extend and klass
	var _ = __webpack_require__(18),
	  fnTest = /xy/.test(function(){"xy";}) ? /\bsupr\b/:/.*/,
	  isFn = function(o){return typeof o === "function"};
	
	
	function wrap(k, fn, supro) {
	  return function () {
	    var tmp = this.supr;
	    this.supr = supro[k];
	    var ret = fn.apply(this, arguments);
	    this.supr = tmp;
	    return ret;
	  }
	}
	
	function process( what, o, supro ) {
	  for ( var k in o ) {
	    if (o.hasOwnProperty(k)) {
	
	      what[k] = isFn( o[k] ) && isFn( supro[k] ) && 
	        fnTest.test( o[k] ) ? wrap(k, o[k], supro) : o[k];
	    }
	  }
	}
	
	// if the property is ["events", "data", "computed"] , we should merge them
	var merged = ["events", "data", "computed"], mlen = merged.length;
	module.exports = function extend(o){
	  o = o || {};
	  var supr = this, proto,
	    supro = supr && supr.prototype || {};
	
	  if(typeof o === 'function'){
	    proto = o.prototype;
	    o.implement = implement;
	    o.extend = extend;
	    return o;
	  } 
	  
	  function fn() {
	    supr.apply(this, arguments);
	  }
	
	  proto = _.createProto(fn, supro);
	
	  function implement(o){
	    // we need merge the merged property
	    var len = mlen;
	    for(;len--;){
	      var prop = merged[len];
	      if(o.hasOwnProperty(prop) && proto.hasOwnProperty(prop)){
	        _.extend(proto[prop], o[prop], true) 
	        delete o[prop];
	      }
	    }
	
	
	    process(proto, o, supro); 
	    return this;
	  }
	
	
	
	  fn.implement = implement
	  fn.implement(o)
	  if(supr.__after__) supr.__after__.call(fn, supr, o);
	  fn.extend = extend;
	  return fn;
	}
	


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(18);
	
	function simpleDiff(now, old){
	  var nlen = now.length;
	  var olen = old.length;
	  if(nlen !== olen){
	    return true;
	  }
	  for(var i = 0; i < nlen ; i++){
	    if(now[i] !== old[i]) return  true;
	  }
	  return false
	
	}
	
	function equals(a,b){
	  return a === b;
	}
	
	// array1 - old array
	// array2 - new array
	function ld(array1, array2, equalFn){
	  var n = array1.length;
	  var m = array2.length;
	  var equalFn = equalFn || equals;
	  var matrix = [];
	  for(var i = 0; i <= n; i++){
	    matrix.push([i]);
	  }
	  for(var j=1;j<=m;j++){
	    matrix[0][j]=j;
	  }
	  for(var i = 1; i <= n; i++){
	    for(var j = 1; j <= m; j++){
	      if(equalFn(array1[i-1], array2[j-1])){
	        matrix[i][j] = matrix[i-1][j-1];
	      }else{
	        matrix[i][j] = Math.min(
	          matrix[i-1][j]+1, //delete
	          matrix[i][j-1]+1//add
	          )
	      }
	    }
	  }
	  return matrix;
	}
	// arr2 - new array
	// arr1 - old array
	function diffArray(arr2, arr1, diff, diffFn) {
	  if(!diff) return simpleDiff(arr2, arr1);
	  var matrix = ld(arr1, arr2, diffFn)
	  var n = arr1.length;
	  var i = n;
	  var m = arr2.length;
	  var j = m;
	  var edits = [];
	  var current = matrix[i][j];
	  while(i>0 || j>0){
	  // the last line
	    if (i === 0) {
	      edits.unshift(3);
	      j--;
	      continue;
	    }
	    // the last col
	    if (j === 0) {
	      edits.unshift(2);
	      i--;
	      continue;
	    }
	    var northWest = matrix[i - 1][j - 1];
	    var west = matrix[i - 1][j];
	    var north = matrix[i][j - 1];
	
	    var min = Math.min(north, west, northWest);
	
	    if (min === west) {
	      edits.unshift(2); //delete
	      i--;
	      current = west;
	    } else if (min === northWest ) {
	      if (northWest === current) {
	        edits.unshift(0); //no change
	      } else {
	        edits.unshift(1); //update
	        current = northWest;
	      }
	      i--;
	      j--;
	    } else {
	      edits.unshift(3); //add
	      j--;
	      current = north;
	    }
	  }
	  var LEAVE = 0;
	  var ADD = 3;
	  var DELELE = 2;
	  var UPDATE = 1;
	  var n = 0;m=0;
	  var steps = [];
	  var step = {index: null, add:0, removed:[]};
	
	  for(var i=0;i<edits.length;i++){
	    if(edits[i] > 0 ){ // NOT LEAVE
	      if(step.index === null){
	        step.index = m;
	      }
	    } else { //LEAVE
	      if(step.index != null){
	        steps.push(step)
	        step = {index: null, add:0, removed:[]};
	      }
	    }
	    switch(edits[i]){
	      case LEAVE:
	        n++;
	        m++;
	        break;
	      case ADD:
	        step.add++;
	        m++;
	        break;
	      case DELELE:
	        step.removed.push(arr1[n])
	        n++;
	        break;
	      case UPDATE:
	        step.add++;
	        step.removed.push(arr1[n])
	        n++;
	        m++;
	        break;
	    }
	  }
	  if(step.index != null){
	    steps.push(step)
	  }
	  return steps
	}
	
	
	
	// diffObject
	// ----
	// test if obj1 deepEqual obj2
	function diffObject( now, last, diff ){
	
	
	  if(!diff){
	
	    for( var j in now ){
	      if( last[j] !== now[j] ) return true
	    }
	
	    for( var n in last ){
	      if(last[n] !== now[n]) return true;
	    }
	
	  }else{
	
	    var nKeys = _.keys(now);
	    var lKeys = _.keys(last);
	
	    /**
	     * [description]
	     * @param  {[type]} a    [description]
	     * @param  {[type]} b){                   return now[b] [description]
	     * @return {[type]}      [description]
	     */
	    return diffArray(nKeys, lKeys, diff, function(a, b){
	      return now[b] === last[a];
	    });
	
	  }
	
	  return false;
	
	
	}
	
	module.exports = {
	  diffArray: diffArray,
	  diffObject: diffObject
	}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// simplest event emitter 60 lines
	// ===============================
	var slice = [].slice, _ = __webpack_require__(18);
	var API = {
	  $on: function(event, fn) {
	    if(typeof event === "object"){
	      for (var i in event) {
	        this.$on(i, event[i]);
	      }
	    }else{
	      // @patch: for list
	      var context = this;
	      var handles = context._handles || (context._handles = {}),
	        calls = handles[event] || (handles[event] = []);
	      calls.push(fn);
	    }
	    return this;
	  },
	  $off: function(event, fn) {
	    var context = this;
	    if(!context._handles) return;
	    if(!event) this._handles = {};
	    var handles = context._handles,
	      calls;
	
	    if (calls = handles[event]) {
	      if (!fn) {
	        handles[event] = [];
	        return context;
	      }
	      for (var i = 0, len = calls.length; i < len; i++) {
	        if (fn === calls[i]) {
	          calls.splice(i, 1);
	          return context;
	        }
	      }
	    }
	    return context;
	  },
	  // bubble event
	  $emit: function(event){
	    // @patch: for list
	    var context = this;
	    var handles = context._handles, calls, args, type;
	    if(!event) return;
	    var args = slice.call(arguments, 1);
	    var type = event;
	
	    if(!handles) return context;
	    if(calls = handles[type.slice(1)]){
	      for (var j = 0, len = calls.length; j < len; j++) {
	        calls[j].apply(context, args)
	      }
	    }
	    if (!(calls = handles[type])) return context;
	    for (var i = 0, len = calls.length; i < len; i++) {
	      calls[i].apply(context, args)
	    }
	    // if(calls.length) context.$update();
	    return context;
	  },
	  // capture  event
	  $one: function(){
	    
	}
	}
	// container class
	function Event() {}
	_.extend(Event.prototype, API)
	
	Event.mixTo = function(obj){
	  obj = typeof obj === "function" ? obj.prototype : obj;
	  _.extend(obj, API)
	}
	module.exports = Event;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// server side rendering for regularjs
	
	
	var _ = __webpack_require__(18);
	var parser = __webpack_require__(21);
	var diffArray = __webpack_require__(24).diffArray;
	
	
	
	
	// hogan
	// https://github.com/twitter/hogan.js
	// MIT
	var escape = (function(){
	  var rAmp = /&/g,
	      rLt = /</g,
	      rGt = />/g,
	      rApos = /\'/g,
	      rQuot = /\"/g,
	      hChars = /[&<>\"\']/;
	
	  function ignoreNullVal(val) {
	    return String((val === undefined || val == null) ? '' : val);
	  }
	
	  return function (str) {
	    str = ignoreNullVal(str);
	    return hChars.test(str) ?
	      str
	        .replace(rAmp, '&amp;')
	        .replace(rLt, '&lt;')
	        .replace(rGt, '&gt;')
	        .replace(rApos, '&#39;')
	        .replace(rQuot, '&quot;') :
	      str;
	  }
	
	})();
	
	/**
	 * [compile description]
	 * @param  {[type]} ast     [description]
	 * @param  {[type]} options [description]
	 */
	
	
	
	
	function SSR (Component, definition){
	
	  definition = definition || {};
	
	  this.Component = Component;
	  var context = this.context = Object.create(Component.prototype)
	
	
	  context.extra = definition.extra;
	  definition.data = definition.data || {};
	  definition.computed = definition.computed || {};
	  if(context.data) _.extend(definition.data, context.data);
	  if(context.computed) _.extend(definition.computed, context.computed);
	
	  _.extend(context, definition, true);
	
	  context.config( context.data = context.data || {} );
	  
	
	}
	
	
	var ssr = _.extend(SSR.prototype, {});
	
	
	ssr.render = function(){
	
	  var self = this;
	  return this.compile(this.context.template);
	
	}
	
	ssr.compile = function(ast){
	
	  if(typeof ast === 'string'){
	    ast = parser.parse(ast);
	  }
	  return this.walk(ast)
	}
	
	
	ssr.walk = function(ast, options){
	
	  var type = ast.type; 
	
	  if(Array.isArray(ast)){
	
	    return ast.map(function(item){
	
	      return this.walk(item, options)
	
	    }.bind(this)).join('');
	
	  }
	
	  return this[ast.type](ast, options)
	
	}
	
	
	ssr.element = function(ast ){
	
	  var children = ast.children,
	    attrs = ast.attrs,
	    tag = ast.tag;
	
	  if( tag === 'r-component' ){
	    attrs.some(function(attr){
	      if(attr.name === 'is'){
	        tag = attr.value;
	        if( _.isExpr(attr.value)) tag = this.get(attr.value);
	        return true;
	      }
	    }.bind(this))
	  }
	
	  var Component = this.Component.component(tag);
	
	  if(ast.tag === 'r-component' && !Component){
	    throw Error('r-component with unregister component ' + tag)
	  }
	
	  if( Component ) return this.component( ast, { 
	    Component: Component 
	  } );
	
	
	  var attrStr = this.attrs(attrs);
	  var body = (children && children.length? this.compile(children): "")
	
	  return "<" + tag + (attrStr? " " + attrStr: ""  ) + ">" +  
	        body +
	    "</" + tag + ">"
	
	}
	
	
	
	ssr.component = function(ast, options){
	
	  var children = ast.children,
	    attrs = ast.attrs,
	    data = {},
	    Component = options.Component, body;
	
	  if(children && children.length){
	    body = function(){
	      return this.compile(children)
	    }.bind(this)
	  }
	
	  attrs.forEach(function(attr){
	    if(!_.eventReg.test(attr.name)){
	      data[attr.name] = _.isExpr(attr.value)? this.get(attr.value): attr.value
	    }
	  }.bind(this))
	
	
	  return SSR.render(Component, {
	    $body: body,
	    data: data,
	    extra: this.extra
	  })
	}
	
	
	
	ssr.list = function(ast){
	
	  var 
	    alternate = ast.alternate,
	    variable = ast.variable,
	    indexName = variable + '_index',
	    keyName = variable + '_key',
	    body = ast.body,
	    context = this.context,
	    self = this,
	    prevExtra = context.extra;
	
	  var sequence = this.get(ast.sequence);
	  var keys, list; 
	
	  var type = _.typeOf(sequence);
	
	  if( type === 'object'){
	
	    keys = Object.keys(list);
	    list = keys.map(function(key){return sequence[key]})
	
	  }else{
	
	    list = sequence || [];
	
	  }
	
	  return list.map(function(item, item_index){
	
	    var sectionData = {};
	    sectionData[variable] = item;
	    sectionData[indexName] = item_index;
	    if(keys) sectionData[keyName] = sequence[item_index];
	    context.extra = _.extend(
	      prevExtra? Object.create(prevExtra): {}, sectionData );
	    var section =  this.compile( body );
	    context.extra = prevExtra;
	    return section;
	
	  }.bind(this)).join('');
	
	}
	
	
	
	
	// {#include } or {#inc template}
	ssr.template = function(ast, options){
	  var content = this.get(ast.content);
	  var type = typeof content;
	
	
	  if(!content) return '';
	  if(type === 'function' ){
	    return content();
	  }else{
	    return this.compile(type !== 'object'? String(content): content)
	  }
	
	};
	
	ssr.if = function(ast, options){
	  var test = this.get(ast.test);  
	  if(test){
	    if(ast.consequent){
	      return this.compile( ast.consequent );
	    }
	  }else{
	    if(ast.alternate){
	      return this.compile( ast.alternate );
	    }
	  }
	
	}
	
	
	ssr.expression = function(ast, options){
	  var str = this.get(ast);
	  return escape(str);
	}
	
	ssr.text = function(ast, options){
	  return escape(ast.text) 
	}
	
	
	
	ssr.attrs = function(attrs){
	  return attrs.map(function(attr){
	    return this.attr(attr);
	  }.bind(this)).join("").replace(/\s+$/,"");
	}
	
	ssr.attr = function(attr){
	
	  var name = attr.name, 
	    value = attr.value || "",
	    Component = this.Component,
	    directive = Component.directive(name);
	
	  
	
	  if( directive ){
	    if(directive.ssr){
	
	      // @TODO: 应该提供hook可以控制节点内部  ,比如r-html
	      return directive.ssr( name, _.isExpr(value)? this.get(value): '' );
	    }
	  }else{
	    // @TODO 对于boolean 值
	    if(_.isExpr(value)) value = this.get(value); 
	    if(_.isBooleanAttr(name) || value === undefined || value === null){
	      return name + " ";
	    }else{
	      return name + '="' + escape(value) + '" ';
	    }
	  }
	}
	
	ssr.get = function(expr){
	
	  var rawget, 
	    self = this,
	    context = this.context,
	    touched = {};
	
	  if(expr.get) return expr.get(context);
	  else {
	    var rawget = new Function(_.ctxName, _.extName , _.prefix+ "return (" + expr.body + ")")
	    expr.get = function(context){
	      return rawget(context, context.extra)
	    }
	    return expr.get(this.context)
	  }
	
	}
	
	SSR.render = function(Component, options){
	
	  return new SSR(Component, options).render();
	
	}
	
	module.exports = SSR;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, Buffer) {(function (global, module) {
	
	  var exports = module.exports;
	
	  /**
	   * Exports.
	   */
	
	  module.exports = expect;
	  expect.Assertion = Assertion;
	
	  /**
	   * Exports version.
	   */
	
	  expect.version = '0.3.1';
	
	  /**
	   * Possible assertion flags.
	   */
	
	  var flags = {
	      not: ['to', 'be', 'have', 'include', 'only']
	    , to: ['be', 'have', 'include', 'only', 'not']
	    , only: ['have']
	    , have: ['own']
	    , be: ['an']
	  };
	
	  function expect (obj) {
	    return new Assertion(obj);
	  }
	
	  /**
	   * Constructor
	   *
	   * @api private
	   */
	
	  function Assertion (obj, flag, parent) {
	    this.obj = obj;
	    this.flags = {};
	
	    if (undefined != parent) {
	      this.flags[flag] = true;
	
	      for (var i in parent.flags) {
	        if (parent.flags.hasOwnProperty(i)) {
	          this.flags[i] = true;
	        }
	      }
	    }
	
	    var $flags = flag ? flags[flag] : keys(flags)
	      , self = this;
	
	    if ($flags) {
	      for (var i = 0, l = $flags.length; i < l; i++) {
	        // avoid recursion
	        if (this.flags[$flags[i]]) continue;
	
	        var name = $flags[i]
	          , assertion = new Assertion(this.obj, name, this)
	
	        if ('function' == typeof Assertion.prototype[name]) {
	          // clone the function, make sure we dont touch the prot reference
	          var old = this[name];
	          this[name] = function () {
	            return old.apply(self, arguments);
	          };
	
	          for (var fn in Assertion.prototype) {
	            if (Assertion.prototype.hasOwnProperty(fn) && fn != name) {
	              this[name][fn] = bind(assertion[fn], assertion);
	            }
	          }
	        } else {
	          this[name] = assertion;
	        }
	      }
	    }
	  }
	
	  /**
	   * Performs an assertion
	   *
	   * @api private
	   */
	
	  Assertion.prototype.assert = function (truth, msg, error, expected) {
	    var msg = this.flags.not ? error : msg
	      , ok = this.flags.not ? !truth : truth
	      , err;
	
	    if (!ok) {
	      err = new Error(msg.call(this));
	      if (arguments.length > 3) {
	        err.actual = this.obj;
	        err.expected = expected;
	        err.showDiff = true;
	      }
	      throw err;
	    }
	
	    this.and = new Assertion(this.obj);
	  };
	
	  /**
	   * Check if the value is truthy
	   *
	   * @api public
	   */
	
	  Assertion.prototype.ok = function () {
	    this.assert(
	        !!this.obj
	      , function(){ return 'expected ' + i(this.obj) + ' to be truthy' }
	      , function(){ return 'expected ' + i(this.obj) + ' to be falsy' });
	  };
	
	  /**
	   * Creates an anonymous function which calls fn with arguments.
	   *
	   * @api public
	   */
	
	  Assertion.prototype.withArgs = function() {
	    expect(this.obj).to.be.a('function');
	    var fn = this.obj;
	    var args = Array.prototype.slice.call(arguments);
	    return expect(function() { fn.apply(null, args); });
	  };
	
	  /**
	   * Assert that the function throws.
	   *
	   * @param {Function|RegExp} callback, or regexp to match error string against
	   * @api public
	   */
	
	  Assertion.prototype.throwError =
	  Assertion.prototype.throwException = function (fn) {
	    expect(this.obj).to.be.a('function');
	
	    var thrown = false
	      , not = this.flags.not;
	
	    try {
	      this.obj();
	    } catch (e) {
	      if (isRegExp(fn)) {
	        var subject = 'string' == typeof e ? e : e.message;
	        if (not) {
	          expect(subject).to.not.match(fn);
	        } else {
	          expect(subject).to.match(fn);
	        }
	      } else if ('function' == typeof fn) {
	        fn(e);
	      }
	      thrown = true;
	    }
	
	    if (isRegExp(fn) && not) {
	      // in the presence of a matcher, ensure the `not` only applies to
	      // the matching.
	      this.flags.not = false;
	    }
	
	    var name = this.obj.name || 'fn';
	    this.assert(
	        thrown
	      , function(){ return 'expected ' + name + ' to throw an exception' }
	      , function(){ return 'expected ' + name + ' not to throw an exception' });
	  };
	
	  /**
	   * Checks if the array is empty.
	   *
	   * @api public
	   */
	
	  Assertion.prototype.empty = function () {
	    var expectation;
	
	    if ('object' == typeof this.obj && null !== this.obj && !isArray(this.obj)) {
	      if ('number' == typeof this.obj.length) {
	        expectation = !this.obj.length;
	      } else {
	        expectation = !keys(this.obj).length;
	      }
	    } else {
	      if ('string' != typeof this.obj) {
	        expect(this.obj).to.be.an('object');
	      }
	
	      expect(this.obj).to.have.property('length');
	      expectation = !this.obj.length;
	    }
	
	    this.assert(
	        expectation
	      , function(){ return 'expected ' + i(this.obj) + ' to be empty' }
	      , function(){ return 'expected ' + i(this.obj) + ' to not be empty' });
	    return this;
	  };
	
	  /**
	   * Checks if the obj exactly equals another.
	   *
	   * @api public
	   */
	
	  Assertion.prototype.be =
	  Assertion.prototype.equal = function (obj) {
	    this.assert(
	        obj === this.obj
	      , function(){ return 'expected ' + i(this.obj) + ' to equal ' + i(obj) }
	      , function(){ return 'expected ' + i(this.obj) + ' to not equal ' + i(obj) });
	    return this;
	  };
	
	  /**
	   * Checks if the obj sortof equals another.
	   *
	   * @api public
	   */
	
	  Assertion.prototype.eql = function (obj) {
	    this.assert(
	        expect.eql(this.obj, obj)
	      , function(){ return 'expected ' + i(this.obj) + ' to sort of equal ' + i(obj) }
	      , function(){ return 'expected ' + i(this.obj) + ' to sort of not equal ' + i(obj) }
	      , obj);
	    return this;
	  };
	
	  /**
	   * Assert within start to finish (inclusive).
	   *
	   * @param {Number} start
	   * @param {Number} finish
	   * @api public
	   */
	
	  Assertion.prototype.within = function (start, finish) {
	    var range = start + '..' + finish;
	    this.assert(
	        this.obj >= start && this.obj <= finish
	      , function(){ return 'expected ' + i(this.obj) + ' to be within ' + range }
	      , function(){ return 'expected ' + i(this.obj) + ' to not be within ' + range });
	    return this;
	  };
	
	  /**
	   * Assert typeof / instance of
	   *
	   * @api public
	   */
	
	  Assertion.prototype.a =
	  Assertion.prototype.an = function (type) {
	    if ('string' == typeof type) {
	      // proper english in error msg
	      var n = /^[aeiou]/.test(type) ? 'n' : '';
	
	      // typeof with support for 'array'
	      this.assert(
	          'array' == type ? isArray(this.obj) :
	            'regexp' == type ? isRegExp(this.obj) :
	              'object' == type
	                ? 'object' == typeof this.obj && null !== this.obj
	                : type == typeof this.obj
	        , function(){ return 'expected ' + i(this.obj) + ' to be a' + n + ' ' + type }
	        , function(){ return 'expected ' + i(this.obj) + ' not to be a' + n + ' ' + type });
	    } else {
	      // instanceof
	      var name = type.name || 'supplied constructor';
	      this.assert(
	          this.obj instanceof type
	        , function(){ return 'expected ' + i(this.obj) + ' to be an instance of ' + name }
	        , function(){ return 'expected ' + i(this.obj) + ' not to be an instance of ' + name });
	    }
	
	    return this;
	  };
	
	  /**
	   * Assert numeric value above _n_.
	   *
	   * @param {Number} n
	   * @api public
	   */
	
	  Assertion.prototype.greaterThan =
	  Assertion.prototype.above = function (n) {
	    this.assert(
	        this.obj > n
	      , function(){ return 'expected ' + i(this.obj) + ' to be above ' + n }
	      , function(){ return 'expected ' + i(this.obj) + ' to be below ' + n });
	    return this;
	  };
	
	  /**
	   * Assert numeric value below _n_.
	   *
	   * @param {Number} n
	   * @api public
	   */
	
	  Assertion.prototype.lessThan =
	  Assertion.prototype.below = function (n) {
	    this.assert(
	        this.obj < n
	      , function(){ return 'expected ' + i(this.obj) + ' to be below ' + n }
	      , function(){ return 'expected ' + i(this.obj) + ' to be above ' + n });
	    return this;
	  };
	
	  /**
	   * Assert string value matches _regexp_.
	   *
	   * @param {RegExp} regexp
	   * @api public
	   */
	
	  Assertion.prototype.match = function (regexp) {
	    this.assert(
	        regexp.exec(this.obj)
	      , function(){ return 'expected ' + i(this.obj) + ' to match ' + regexp }
	      , function(){ return 'expected ' + i(this.obj) + ' not to match ' + regexp });
	    return this;
	  };
	
	  /**
	   * Assert property "length" exists and has value of _n_.
	   *
	   * @param {Number} n
	   * @api public
	   */
	
	  Assertion.prototype.length = function (n) {
	    expect(this.obj).to.have.property('length');
	    var len = this.obj.length;
	    this.assert(
	        n == len
	      , function(){ return 'expected ' + i(this.obj) + ' to have a length of ' + n + ' but got ' + len }
	      , function(){ return 'expected ' + i(this.obj) + ' to not have a length of ' + len });
	    return this;
	  };
	
	  /**
	   * Assert property _name_ exists, with optional _val_.
	   *
	   * @param {String} name
	   * @param {Mixed} val
	   * @api public
	   */
	
	  Assertion.prototype.property = function (name, val) {
	    if (this.flags.own) {
	      this.assert(
	          Object.prototype.hasOwnProperty.call(this.obj, name)
	        , function(){ return 'expected ' + i(this.obj) + ' to have own property ' + i(name) }
	        , function(){ return 'expected ' + i(this.obj) + ' to not have own property ' + i(name) });
	      return this;
	    }
	
	    if (this.flags.not && undefined !== val) {
	      if (undefined === this.obj[name]) {
	        throw new Error(i(this.obj) + ' has no property ' + i(name));
	      }
	    } else {
	      var hasProp;
	      try {
	        hasProp = name in this.obj
	      } catch (e) {
	        hasProp = undefined !== this.obj[name]
	      }
	
	      this.assert(
	          hasProp
	        , function(){ return 'expected ' + i(this.obj) + ' to have a property ' + i(name) }
	        , function(){ return 'expected ' + i(this.obj) + ' to not have a property ' + i(name) });
	    }
	
	    if (undefined !== val) {
	      this.assert(
	          val === this.obj[name]
	        , function(){ return 'expected ' + i(this.obj) + ' to have a property ' + i(name)
	          + ' of ' + i(val) + ', but got ' + i(this.obj[name]) }
	        , function(){ return 'expected ' + i(this.obj) + ' to not have a property ' + i(name)
	          + ' of ' + i(val) });
	    }
	
	    this.obj = this.obj[name];
	    return this;
	  };
	
	  /**
	   * Assert that the array contains _obj_ or string contains _obj_.
	   *
	   * @param {Mixed} obj|string
	   * @api public
	   */
	
	  Assertion.prototype.string =
	  Assertion.prototype.contain = function (obj) {
	    if ('string' == typeof this.obj) {
	      this.assert(
	          ~this.obj.indexOf(obj)
	        , function(){ return 'expected ' + i(this.obj) + ' to contain ' + i(obj) }
	        , function(){ return 'expected ' + i(this.obj) + ' to not contain ' + i(obj) });
	    } else {
	      this.assert(
	          ~indexOf(this.obj, obj)
	        , function(){ return 'expected ' + i(this.obj) + ' to contain ' + i(obj) }
	        , function(){ return 'expected ' + i(this.obj) + ' to not contain ' + i(obj) });
	    }
	    return this;
	  };
	
	  /**
	   * Assert exact keys or inclusion of keys by using
	   * the `.own` modifier.
	   *
	   * @param {Array|String ...} keys
	   * @api public
	   */
	
	  Assertion.prototype.key =
	  Assertion.prototype.keys = function ($keys) {
	    var str
	      , ok = true;
	
	    $keys = isArray($keys)
	      ? $keys
	      : Array.prototype.slice.call(arguments);
	
	    if (!$keys.length) throw new Error('keys required');
	
	    var actual = keys(this.obj)
	      , len = $keys.length;
	
	    // Inclusion
	    ok = every($keys, function (key) {
	      return ~indexOf(actual, key);
	    });
	
	    // Strict
	    if (!this.flags.not && this.flags.only) {
	      ok = ok && $keys.length == actual.length;
	    }
	
	    // Key string
	    if (len > 1) {
	      $keys = map($keys, function (key) {
	        return i(key);
	      });
	      var last = $keys.pop();
	      str = $keys.join(', ') + ', and ' + last;
	    } else {
	      str = i($keys[0]);
	    }
	
	    // Form
	    str = (len > 1 ? 'keys ' : 'key ') + str;
	
	    // Have / include
	    str = (!this.flags.only ? 'include ' : 'only have ') + str;
	
	    // Assertion
	    this.assert(
	        ok
	      , function(){ return 'expected ' + i(this.obj) + ' to ' + str }
	      , function(){ return 'expected ' + i(this.obj) + ' to not ' + str });
	
	    return this;
	  };
	
	  /**
	   * Assert a failure.
	   *
	   * @param {String ...} custom message
	   * @api public
	   */
	  Assertion.prototype.fail = function (msg) {
	    var error = function() { return msg || "explicit failure"; }
	    this.assert(false, error, error);
	    return this;
	  };
	
	  /**
	   * Function bind implementation.
	   */
	
	  function bind (fn, scope) {
	    return function () {
	      return fn.apply(scope, arguments);
	    }
	  }
	
	  /**
	   * Array every compatibility
	   *
	   * @see bit.ly/5Fq1N2
	   * @api public
	   */
	
	  function every (arr, fn, thisObj) {
	    var scope = thisObj || global;
	    for (var i = 0, j = arr.length; i < j; ++i) {
	      if (!fn.call(scope, arr[i], i, arr)) {
	        return false;
	      }
	    }
	    return true;
	  }
	
	  /**
	   * Array indexOf compatibility.
	   *
	   * @see bit.ly/a5Dxa2
	   * @api public
	   */
	
	  function indexOf (arr, o, i) {
	    if (Array.prototype.indexOf) {
	      return Array.prototype.indexOf.call(arr, o, i);
	    }
	
	    if (arr.length === undefined) {
	      return -1;
	    }
	
	    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0
	        ; i < j && arr[i] !== o; i++);
	
	    return j <= i ? -1 : i;
	  }
	
	  // https://gist.github.com/1044128/
	  var getOuterHTML = function(element) {
	    if ('outerHTML' in element) return element.outerHTML;
	    var ns = "http://www.w3.org/1999/xhtml";
	    var container = document.createElementNS(ns, '_');
	    var xmlSerializer = new XMLSerializer();
	    var html;
	    if (document.xmlVersion) {
	      return xmlSerializer.serializeToString(element);
	    } else {
	      container.appendChild(element.cloneNode(false));
	      html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
	      container.innerHTML = '';
	      return html;
	    }
	  };
	
	  // Returns true if object is a DOM element.
	  var isDOMElement = function (object) {
	    if (typeof HTMLElement === 'object') {
	      return object instanceof HTMLElement;
	    } else {
	      return object &&
	        typeof object === 'object' &&
	        object.nodeType === 1 &&
	        typeof object.nodeName === 'string';
	    }
	  };
	
	  /**
	   * Inspects an object.
	   *
	   * @see taken from node.js `util` module (copyright Joyent, MIT license)
	   * @api private
	   */
	
	  function i (obj, showHidden, depth) {
	    var seen = [];
	
	    function stylize (str) {
	      return str;
	    }
	
	    function format (value, recurseTimes) {
	      // Provide a hook for user-specified inspect functions.
	      // Check that value is an object with an inspect function on it
	      if (value && typeof value.inspect === 'function' &&
	          // Filter out the util module, it's inspect function is special
	          value !== exports &&
	          // Also filter out any prototype objects using the circular check.
	          !(value.constructor && value.constructor.prototype === value)) {
	        return value.inspect(recurseTimes);
	      }
	
	      // Primitive types cannot have properties
	      switch (typeof value) {
	        case 'undefined':
	          return stylize('undefined', 'undefined');
	
	        case 'string':
	          var simple = '\'' + json.stringify(value).replace(/^"|"$/g, '')
	                                                   .replace(/'/g, "\\'")
	                                                   .replace(/\\"/g, '"') + '\'';
	          return stylize(simple, 'string');
	
	        case 'number':
	          return stylize('' + value, 'number');
	
	        case 'boolean':
	          return stylize('' + value, 'boolean');
	      }
	      // For some reason typeof null is "object", so special case here.
	      if (value === null) {
	        return stylize('null', 'null');
	      }
	
	      if (isDOMElement(value)) {
	        return getOuterHTML(value);
	      }
	
	      // Look up the keys of the object.
	      var visible_keys = keys(value);
	      var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;
	
	      // Functions without properties can be shortcutted.
	      if (typeof value === 'function' && $keys.length === 0) {
	        if (isRegExp(value)) {
	          return stylize('' + value, 'regexp');
	        } else {
	          var name = value.name ? ': ' + value.name : '';
	          return stylize('[Function' + name + ']', 'special');
	        }
	      }
	
	      // Dates without properties can be shortcutted
	      if (isDate(value) && $keys.length === 0) {
	        return stylize(value.toUTCString(), 'date');
	      }
	      
	      // Error objects can be shortcutted
	      if (value instanceof Error) {
	        return stylize("["+value.toString()+"]", 'Error');
	      }
	
	      var base, type, braces;
	      // Determine the object type
	      if (isArray(value)) {
	        type = 'Array';
	        braces = ['[', ']'];
	      } else {
	        type = 'Object';
	        braces = ['{', '}'];
	      }
	
	      // Make functions say that they are functions
	      if (typeof value === 'function') {
	        var n = value.name ? ': ' + value.name : '';
	        base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
	      } else {
	        base = '';
	      }
	
	      // Make dates with properties first say the date
	      if (isDate(value)) {
	        base = ' ' + value.toUTCString();
	      }
	
	      if ($keys.length === 0) {
	        return braces[0] + base + braces[1];
	      }
	
	      if (recurseTimes < 0) {
	        if (isRegExp(value)) {
	          return stylize('' + value, 'regexp');
	        } else {
	          return stylize('[Object]', 'special');
	        }
	      }
	
	      seen.push(value);
	
	      var output = map($keys, function (key) {
	        var name, str;
	        if (value.__lookupGetter__) {
	          if (value.__lookupGetter__(key)) {
	            if (value.__lookupSetter__(key)) {
	              str = stylize('[Getter/Setter]', 'special');
	            } else {
	              str = stylize('[Getter]', 'special');
	            }
	          } else {
	            if (value.__lookupSetter__(key)) {
	              str = stylize('[Setter]', 'special');
	            }
	          }
	        }
	        if (indexOf(visible_keys, key) < 0) {
	          name = '[' + key + ']';
	        }
	        if (!str) {
	          if (indexOf(seen, value[key]) < 0) {
	            if (recurseTimes === null) {
	              str = format(value[key]);
	            } else {
	              str = format(value[key], recurseTimes - 1);
	            }
	            if (str.indexOf('\n') > -1) {
	              if (isArray(value)) {
	                str = map(str.split('\n'), function (line) {
	                  return '  ' + line;
	                }).join('\n').substr(2);
	              } else {
	                str = '\n' + map(str.split('\n'), function (line) {
	                  return '   ' + line;
	                }).join('\n');
	              }
	            }
	          } else {
	            str = stylize('[Circular]', 'special');
	          }
	        }
	        if (typeof name === 'undefined') {
	          if (type === 'Array' && key.match(/^\d+$/)) {
	            return str;
	          }
	          name = json.stringify('' + key);
	          if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	            name = name.substr(1, name.length - 2);
	            name = stylize(name, 'name');
	          } else {
	            name = name.replace(/'/g, "\\'")
	                       .replace(/\\"/g, '"')
	                       .replace(/(^"|"$)/g, "'");
	            name = stylize(name, 'string');
	          }
	        }
	
	        return name + ': ' + str;
	      });
	
	      seen.pop();
	
	      var numLinesEst = 0;
	      var length = reduce(output, function (prev, cur) {
	        numLinesEst++;
	        if (indexOf(cur, '\n') >= 0) numLinesEst++;
	        return prev + cur.length + 1;
	      }, 0);
	
	      if (length > 50) {
	        output = braces[0] +
	                 (base === '' ? '' : base + '\n ') +
	                 ' ' +
	                 output.join(',\n  ') +
	                 ' ' +
	                 braces[1];
	
	      } else {
	        output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	      }
	
	      return output;
	    }
	    return format(obj, (typeof depth === 'undefined' ? 2 : depth));
	  }
	
	  expect.stringify = i;
	
	  function isArray (ar) {
	    return Object.prototype.toString.call(ar) === '[object Array]';
	  }
	
	  function isRegExp(re) {
	    var s;
	    try {
	      s = '' + re;
	    } catch (e) {
	      return false;
	    }
	
	    return re instanceof RegExp || // easy case
	           // duck-type for context-switching evalcx case
	           typeof(re) === 'function' &&
	           re.constructor.name === 'RegExp' &&
	           re.compile &&
	           re.test &&
	           re.exec &&
	           s.match(/^\/.*\/[gim]{0,3}$/);
	  }
	
	  function isDate(d) {
	    return d instanceof Date;
	  }
	
	  function keys (obj) {
	    if (Object.keys) {
	      return Object.keys(obj);
	    }
	
	    var keys = [];
	
	    for (var i in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, i)) {
	        keys.push(i);
	      }
	    }
	
	    return keys;
	  }
	
	  function map (arr, mapper, that) {
	    if (Array.prototype.map) {
	      return Array.prototype.map.call(arr, mapper, that);
	    }
	
	    var other= new Array(arr.length);
	
	    for (var i= 0, n = arr.length; i<n; i++)
	      if (i in arr)
	        other[i] = mapper.call(that, arr[i], i, arr);
	
	    return other;
	  }
	
	  function reduce (arr, fun) {
	    if (Array.prototype.reduce) {
	      return Array.prototype.reduce.apply(
	          arr
	        , Array.prototype.slice.call(arguments, 1)
	      );
	    }
	
	    var len = +this.length;
	
	    if (typeof fun !== "function")
	      throw new TypeError();
	
	    // no value to return if no initial value and an empty array
	    if (len === 0 && arguments.length === 1)
	      throw new TypeError();
	
	    var i = 0;
	    if (arguments.length >= 2) {
	      var rv = arguments[1];
	    } else {
	      do {
	        if (i in this) {
	          rv = this[i++];
	          break;
	        }
	
	        // if array contains no values, no initial value to return
	        if (++i >= len)
	          throw new TypeError();
	      } while (true);
	    }
	
	    for (; i < len; i++) {
	      if (i in this)
	        rv = fun.call(null, rv, this[i], i, this);
	    }
	
	    return rv;
	  }
	
	  /**
	   * Asserts deep equality
	   *
	   * @see taken from node.js `assert` module (copyright Joyent, MIT license)
	   * @api private
	   */
	
	  expect.eql = function eql(actual, expected) {
	    // 7.1. All identical values are equivalent, as determined by ===.
	    if (actual === expected) {
	      return true;
	    } else if ('undefined' != typeof Buffer
	      && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
	      if (actual.length != expected.length) return false;
	
	      for (var i = 0; i < actual.length; i++) {
	        if (actual[i] !== expected[i]) return false;
	      }
	
	      return true;
	
	      // 7.2. If the expected value is a Date object, the actual value is
	      // equivalent if it is also a Date object that refers to the same time.
	    } else if (actual instanceof Date && expected instanceof Date) {
	      return actual.getTime() === expected.getTime();
	
	      // 7.3. Other pairs that do not both pass typeof value == "object",
	      // equivalence is determined by ==.
	    } else if (typeof actual != 'object' && typeof expected != 'object') {
	      return actual == expected;
	    // If both are regular expression use the special `regExpEquiv` method
	    // to determine equivalence.
	    } else if (isRegExp(actual) && isRegExp(expected)) {
	      return regExpEquiv(actual, expected);
	    // 7.4. For all other Object pairs, including Array objects, equivalence is
	    // determined by having the same number of owned properties (as verified
	    // with Object.prototype.hasOwnProperty.call), the same set of keys
	    // (although not necessarily the same order), equivalent values for every
	    // corresponding key, and an identical "prototype" property. Note: this
	    // accounts for both named and indexed properties on Arrays.
	    } else {
	      return objEquiv(actual, expected);
	    }
	  };
	
	  function isUndefinedOrNull (value) {
	    return value === null || value === undefined;
	  }
	
	  function isArguments (object) {
	    return Object.prototype.toString.call(object) == '[object Arguments]';
	  }
	
	  function regExpEquiv (a, b) {
	    return a.source === b.source && a.global === b.global &&
	           a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
	  }
	
	  function objEquiv (a, b) {
	    if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
	      return false;
	    // an identical "prototype" property.
	    if (a.prototype !== b.prototype) return false;
	    //~~~I've managed to break Object.keys through screwy arguments passing.
	    //   Converting to array solves the problem.
	    if (isArguments(a)) {
	      if (!isArguments(b)) {
	        return false;
	      }
	      a = pSlice.call(a);
	      b = pSlice.call(b);
	      return expect.eql(a, b);
	    }
	    try{
	      var ka = keys(a),
	        kb = keys(b),
	        key, i;
	    } catch (e) {//happens when one is a string literal and the other isn't
	      return false;
	    }
	    // having the same number of owned properties (keys incorporates hasOwnProperty)
	    if (ka.length != kb.length)
	      return false;
	    //the same set of keys (although not necessarily the same order),
	    ka.sort();
	    kb.sort();
	    //~~~cheap key test
	    for (i = ka.length - 1; i >= 0; i--) {
	      if (ka[i] != kb[i])
	        return false;
	    }
	    //equivalent values for every corresponding key, and
	    //~~~possibly expensive deep test
	    for (i = ka.length - 1; i >= 0; i--) {
	      key = ka[i];
	      if (!expect.eql(a[key], b[key]))
	         return false;
	    }
	    return true;
	  }
	
	  var json = (function () {
	    "use strict";
	
	    if ('object' == typeof JSON && JSON.parse && JSON.stringify) {
	      return {
	          parse: nativeJSON.parse
	        , stringify: nativeJSON.stringify
	      }
	    }
	
	    var JSON = {};
	
	    function f(n) {
	        // Format integers to have at least two digits.
	        return n < 10 ? '0' + n : n;
	    }
	
	    function date(d, key) {
	      return isFinite(d.valueOf()) ?
	          d.getUTCFullYear()     + '-' +
	          f(d.getUTCMonth() + 1) + '-' +
	          f(d.getUTCDate())      + 'T' +
	          f(d.getUTCHours())     + ':' +
	          f(d.getUTCMinutes())   + ':' +
	          f(d.getUTCSeconds())   + 'Z' : null;
	    }
	
	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        gap,
	        indent,
	        meta = {    // table of character substitutions
	            '\b': '\\b',
	            '\t': '\\t',
	            '\n': '\\n',
	            '\f': '\\f',
	            '\r': '\\r',
	            '"' : '\\"',
	            '\\': '\\\\'
	        },
	        rep;
	
	
	    function quote(string) {
	
	  // If the string contains no control characters, no quote characters, and no
	  // backslash characters, then we can safely slap some quotes around it.
	  // Otherwise we must also replace the offending characters with safe escape
	  // sequences.
	
	        escapable.lastIndex = 0;
	        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	            var c = meta[a];
	            return typeof c === 'string' ? c :
	                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	        }) + '"' : '"' + string + '"';
	    }
	
	
	    function str(key, holder) {
	
	  // Produce a string from holder[key].
	
	        var i,          // The loop counter.
	            k,          // The member key.
	            v,          // The member value.
	            length,
	            mind = gap,
	            partial,
	            value = holder[key];
	
	  // If the value has a toJSON method, call it to obtain a replacement value.
	
	        if (value instanceof Date) {
	            value = date(key);
	        }
	
	  // If we were called with a replacer function, then call the replacer to
	  // obtain a replacement value.
	
	        if (typeof rep === 'function') {
	            value = rep.call(holder, key, value);
	        }
	
	  // What happens next depends on the value's type.
	
	        switch (typeof value) {
	        case 'string':
	            return quote(value);
	
	        case 'number':
	
	  // JSON numbers must be finite. Encode non-finite numbers as null.
	
	            return isFinite(value) ? String(value) : 'null';
	
	        case 'boolean':
	        case 'null':
	
	  // If the value is a boolean or null, convert it to a string. Note:
	  // typeof null does not produce 'null'. The case is included here in
	  // the remote chance that this gets fixed someday.
	
	            return String(value);
	
	  // If the type is 'object', we might be dealing with an object or an array or
	  // null.
	
	        case 'object':
	
	  // Due to a specification blunder in ECMAScript, typeof null is 'object',
	  // so watch out for that case.
	
	            if (!value) {
	                return 'null';
	            }
	
	  // Make an array to hold the partial results of stringifying this object value.
	
	            gap += indent;
	            partial = [];
	
	  // Is the value an array?
	
	            if (Object.prototype.toString.apply(value) === '[object Array]') {
	
	  // The value is an array. Stringify every element. Use null as a placeholder
	  // for non-JSON values.
	
	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                    partial[i] = str(i, value) || 'null';
	                }
	
	  // Join all of the elements together, separated with commas, and wrap them in
	  // brackets.
	
	                v = partial.length === 0 ? '[]' : gap ?
	                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
	                    '[' + partial.join(',') + ']';
	                gap = mind;
	                return v;
	            }
	
	  // If the replacer is an array, use it to select the members to be stringified.
	
	            if (rep && typeof rep === 'object') {
	                length = rep.length;
	                for (i = 0; i < length; i += 1) {
	                    if (typeof rep[i] === 'string') {
	                        k = rep[i];
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            } else {
	
	  // Otherwise, iterate through all of the keys in the object.
	
	                for (k in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, k)) {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            }
	
	  // Join all of the member texts together, separated with commas,
	  // and wrap them in braces.
	
	            v = partial.length === 0 ? '{}' : gap ?
	                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
	                '{' + partial.join(',') + '}';
	            gap = mind;
	            return v;
	        }
	    }
	
	  // If the JSON object does not yet have a stringify method, give it one.
	
	    JSON.stringify = function (value, replacer, space) {
	
	  // The stringify method takes a value and an optional replacer, and an optional
	  // space parameter, and returns a JSON text. The replacer can be a function
	  // that can replace values, or an array of strings that will select the keys.
	  // A default replacer method can be provided. Use of the space parameter can
	  // produce text that is more easily readable.
	
	        var i;
	        gap = '';
	        indent = '';
	
	  // If the space parameter is a number, make an indent string containing that
	  // many spaces.
	
	        if (typeof space === 'number') {
	            for (i = 0; i < space; i += 1) {
	                indent += ' ';
	            }
	
	  // If the space parameter is a string, it will be used as the indent string.
	
	        } else if (typeof space === 'string') {
	            indent = space;
	        }
	
	  // If there is a replacer, it must be a function or an array.
	  // Otherwise, throw an error.
	
	        rep = replacer;
	        if (replacer && typeof replacer !== 'function' &&
	                (typeof replacer !== 'object' ||
	                typeof replacer.length !== 'number')) {
	            throw new Error('JSON.stringify');
	        }
	
	  // Make a fake root object containing our value under the key of ''.
	  // Return the result of stringifying the value.
	
	        return str('', {'': value});
	    };
	
	  // If the JSON object does not yet have a parse method, give it one.
	
	    JSON.parse = function (text, reviver) {
	    // The parse method takes a text and an optional reviver function, and returns
	    // a JavaScript value if the text is a valid JSON text.
	
	        var j;
	
	        function walk(holder, key) {
	
	    // The walk method is used to recursively walk the resulting structure so
	    // that modifications can be made.
	
	            var k, v, value = holder[key];
	            if (value && typeof value === 'object') {
	                for (k in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, k)) {
	                        v = walk(value, k);
	                        if (v !== undefined) {
	                            value[k] = v;
	                        } else {
	                            delete value[k];
	                        }
	                    }
	                }
	            }
	            return reviver.call(holder, key, value);
	        }
	
	
	    // Parsing happens in four stages. In the first stage, we replace certain
	    // Unicode characters with escape sequences. JavaScript handles many characters
	    // incorrectly, either silently deleting them, or treating them as line endings.
	
	        text = String(text);
	        cx.lastIndex = 0;
	        if (cx.test(text)) {
	            text = text.replace(cx, function (a) {
	                return '\\u' +
	                    ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	            });
	        }
	
	    // In the second stage, we run the text against regular expressions that look
	    // for non-JSON patterns. We are especially concerned with '()' and 'new'
	    // because they can cause invocation, and '=' because it can cause mutation.
	    // But just to be safe, we want to reject all unexpected forms.
	
	    // We split the second stage into 4 regexp operations in order to work around
	    // crippling inefficiencies in IE's and Safari's regexp engines. First we
	    // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
	    // replace all simple value tokens with ']' characters. Third, we delete all
	    // open brackets that follow a colon or comma or that begin the text. Finally,
	    // we look to see that the remaining characters are only whitespace or ']' or
	    // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
	
	        if (/^[\],:{}\s]*$/
	                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
	                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
	                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
	
	    // In the third stage we use the eval function to compile the text into a
	    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
	    // in JavaScript: it can begin a block or an object literal. We wrap the text
	    // in parens to eliminate the ambiguity.
	
	            j = eval('(' + text + ')');
	
	    // In the optional fourth stage, we recursively walk the new structure, passing
	    // each name/value pair to a reviver function for possible transformation.
	
	            return typeof reviver === 'function' ?
	                walk({'': j}, '') : j;
	        }
	
	    // If the text is not JSON parseable, then a SyntaxError is thrown.
	
	        throw new SyntaxError('JSON.parse');
	    };
	
	    return JSON;
	  })();
	
	  if ('undefined' != typeof window) {
	    window.expect = module.exports;
	  }
	
	})(
	    this
	  , true ? module : {exports: {}}
	);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(47)(module), __webpack_require__(46).Buffer))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// some fixture test;
	// ---------------
	var _ = __webpack_require__(18);
	exports.svg = (function(){
	  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
	})();
	
	
	exports.browser = typeof document !== "undefined" && document.nodeType;
	// whether have component in initializing
	exports.exprCache = _.cache(1000);
	exports.node = typeof process !== "undefined" && ( '' + process ) === '[object process]';
	exports.isRunning = false;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(48)))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = {
	  'BEGIN': '{',
	  'END': '}'
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * render for component in browsers
	 */
	
	var env = __webpack_require__(28);
	var Lexer = __webpack_require__(37);
	var Parser = __webpack_require__(36);
	var config = __webpack_require__(29);
	var _ = __webpack_require__(18);
	var extend = __webpack_require__(23);
	var combine = {};
	if(env.browser){
	  var dom = __webpack_require__(17);
	  var walkers = __webpack_require__(38);
	  var Group = __webpack_require__(39);
	  var doc = dom.doc;
	  combine = __webpack_require__(20);
	}
	var events = __webpack_require__(25);
	var Watcher = __webpack_require__(40);
	var parse = __webpack_require__(21);
	var filter = __webpack_require__(41);
	var ERROR = __webpack_require__(42).ERROR;
	var nodeCursor = __webpack_require__(31);
	
	
	/**
	* `Regular` is regularjs's NameSpace and BaseClass. Every Component is inherited from it
	* 
	* @class Regular
	* @module Regular
	* @constructor
	* @param {Object} options specification of the component
	*/
	var Regular = function(definition, options){
	  var prevRunning = env.isRunning;
	  env.isRunning = true;
	  var node, template, cursor;
	
	  definition = definition || {};
	  options = options || {};
	
	  var mountNode = definition.mountNode;
	  if(typeof mountNode === 'string'){
	    mountNode = dom.find( mountNode );
	    if(!mountNode) throw Error('mountNode ' + mountNode + ' is not found')
	  } 
	
	  if(mountNode){
	    cursor = nodeCursor(mountNode.firstChild)
	    delete definition.mountNode
	  }else{
	    cursor = options.cursor
	  }
	
	  definition.data = definition.data || {};
	  definition.computed = definition.computed || {};
	  definition.events = definition.events || {};
	  if(this.data) _.extend(definition.data, this.data);
	  if(this.computed) _.extend(definition.computed, this.computed);
	  if(this.events) _.extend(definition.events, this.events);
	
	  _.extend(this, definition, true);
	  if(this.$parent){
	     this.$parent._append(this);
	  }
	  this._children = [];
	  this.$refs = {};
	
	  template = this.template;
	
	
	  // template is a string (len < 16). we will find it container first
	  if((typeof template === 'string' && template.length < 16) && (node = dom.find(template))) {
	    template = node.innerHTML;
	  }
	  // if template is a xml
	  if(template && template.nodeType) template = template.innerHTML;
	  if(typeof template === 'string') this.template = new Parser(template).parse();
	
	  this.computed = handleComputed(this.computed);
	  this.$root = this.$root || this;
	  // if have events
	  if(this.events){
	    this.$on(this.events);
	  }
	  this.$emit("$config");
	  this.config && this.config(this.data);
	
	  var body = this._body;
	  this._body = null;
	
	  if(body && body.ast && body.ast.length){
	    this.$body = _.getCompileFn(body.ast, body.ctx , {
	      outer: this,
	      namespace: options.namespace,
	      extra: options.extra,
	      record: true
	    })
	  }
	  // handle computed
	  if(template){
	    this.group = this.$compile(this.template, {
	      namespace: options.namespace,
	      cursor: cursor
	    });
	    combine.node(this);
	  }
	
	
	  if(!this.$parent) this.$update();
	  this.$ready = true;
	  this.$emit("$init");
	  if( this.init ) this.init(this.data);
	
	  // @TODO: remove, maybe , there is no need to update after init; 
	  // if(this.$root === this) this.$update();
	  env.isRunning = prevRunning;
	
	  // children is not required;
	}
	
	
	walkers && (walkers.Regular = Regular);
	
	
	// description
	// -------------------------
	// 1. Regular and derived Class use same filter
	_.extend(Regular, {
	  // private data stuff
	  _directives: { __regexp__:[] },
	  _plugins: {},
	  _protoInheritCache: [ 'directive', 'use'] ,
	  __after__: function(supr, o) {
	
	    var template;
	    this.__after__ = supr.__after__;
	
	    // use name make the component global.
	    if(o.name) Regular.component(o.name, this);
	    // this.prototype.template = dom.initTemplate(o)
	    if(template = o.template){
	      var node, name;
	      if( typeof template === 'string' && template.length < 16 && ( node = dom.find( template )) ){
	        template = node.innerHTML;
	        if(name = dom.attr(node, 'name')) Regular.component(name, this);
	      }
	
	      if(template.nodeType) template = template.innerHTML;
	
	      if(typeof template === 'string'){
	        this.prototype.template = new Parser(template).parse();
	      }
	    }
	
	    if(o.computed) this.prototype.computed = handleComputed(o.computed);
	    // inherit directive and other config from supr
	    Regular._inheritConfig(this, supr);
	
	  },
	  /**
	   * Define a directive
	   *
	   * @method directive
	   * @return {Object} Copy of ...
	   */  
	  directive: function(name, cfg){
	
	    if(_.typeOf(name) === "object"){
	      for(var k in name){
	        if(name.hasOwnProperty(k)) this.directive(k, name[k]);
	      }
	      return this;
	    }
	    var type = _.typeOf(name);
	    var directives = this._directives, directive;
	    if(cfg == null){
	      if( type === "string" && (directive = directives[name]) ) return directive;
	      else{
	        var regexp = directives.__regexp__;
	        for(var i = 0, len = regexp.length; i < len ; i++){
	          directive = regexp[i];
	          var test = directive.regexp.test(name);
	          if(test) return directive;
	        }
	      }
	      return undefined;
	    }
	    if(typeof cfg === 'function') cfg = { link: cfg } 
	    if(type === 'string') directives[name] = cfg;
	    else if(type === 'regexp'){
	      cfg.regexp = name;
	      directives.__regexp__.push(cfg)
	    }
	    return this
	  },
	  plugin: function(name, fn){
	    var plugins = this._plugins;
	    if(fn == null) return plugins[name];
	    plugins[name] = fn;
	    return this;
	  },
	  use: function(fn){
	    if(typeof fn === "string") fn = Regular.plugin(fn);
	    if(typeof fn !== "function") return this;
	    fn(this, Regular);
	    return this;
	  },
	  // config the Regularjs's global
	  config: function(name, value){
	    var needGenLexer = false;
	    if(typeof name === "object"){
	      for(var i in name){
	        // if you config
	        if( i ==="END" || i==='BEGIN' )  needGenLexer = true;
	        config[i] = name[i];
	      }
	    }
	    if(needGenLexer) Lexer.setup();
	  },
	  expression: parse.expression,
	  Parser: Parser,
	  Lexer: Lexer,
	  _addProtoInheritCache: function(name, transform){
	    if( Array.isArray( name ) ){
	      return name.forEach(Regular._addProtoInheritCache);
	    }
	    var cacheKey = "_" + name + "s"
	    Regular._protoInheritCache.push(name)
	    Regular[cacheKey] = {};
	    if(Regular[name]) return;
	    Regular[name] = function(key, cfg){
	      var cache = this[cacheKey];
	
	      if(typeof key === "object"){
	        for(var i in key){
	          if(key.hasOwnProperty(i)) this[name](i, key[i]);
	        }
	        return this;
	      }
	      if(cfg == null) return cache[key];
	      cache[key] = transform? transform(cfg) : cfg;
	      return this;
	    }
	  },
	  _inheritConfig: function(self, supr){
	
	    // prototype inherit some Regular property
	    // so every Component will have own container to serve directive, filter etc..
	    var defs = Regular._protoInheritCache;
	    var keys = _.slice(defs);
	    keys.forEach(function(key){
	      self[key] = supr[key];
	      var cacheKey = '_' + key + 's';
	      if(supr[cacheKey]) self[cacheKey] = _.createObject(supr[cacheKey]);
	    })
	    return self;
	  }
	
	});
	
	extend(Regular);
	
	Regular._addProtoInheritCache("component")
	
	Regular._addProtoInheritCache("filter", function(cfg){
	  return typeof cfg === "function"? {get: cfg}: cfg;
	})
	
	
	events.mixTo(Regular);
	Watcher.mixTo(Regular);
	
	Regular.implement({
	  init: function(){},
	  config: function(){},
	  destroy: function(){
	    // destroy event wont propgation;
	    this.$emit("$destroy");
	    this.group && this.group.destroy(true);
	    this.group = null;
	    this.parentNode = null;
	    this._watchers = null;
	    this._children = [];
	    var parent = this.$parent;
	    if(parent){
	      var index = parent._children.indexOf(this);
	      parent._children.splice(index,1);
	    }
	    this.$parent = null;
	    this.$root = null;
	    this._handles = null;
	    this.$refs = null;
	    this.$phase = "destroyed";
	  },
	
	  /**
	   * compile a block ast ; return a group;
	   * @param  {Array} parsed ast
	   * @param  {[type]} record
	   * @return {[type]}
	   */
	  $compile: function(ast, options){
	    options = options || {};
	    if(typeof ast === 'string'){
	      ast = new Parser(ast).parse()
	    }
	    var preExt = this.__ext__,
	      record = options.record, 
	      records;
	
	    if(options.extra) this.__ext__ = options.extra;
	
	
	    if(record) this._record();
	    var group = this._walk(ast, options);
	    if(record){
	      records = this._release();
	      var self = this;
	      if(records.length){
	        // auto destroy all wather;
	        group.ondestroy = function(){ self.$unwatch(records); }
	      }
	    }
	    if(options.extra) this.__ext__ = preExt;
	    return group;
	  },
	
	
	  /**
	   * create two-way binding with another component;
	   * *warn*: 
	   *   expr1 and expr2 must can operate set&get, for example: the 'a.b' or 'a[b + 1]' is set-able, but 'a.b + 1' is not, 
	   *   beacuse Regular dont know how to inverse set through the expression;
	   *   
	   *   if before $bind, two component's state is not sync, the component(passed param) will sync with the called component;
	   *
	   * *example: *
	   *
	   * ```javascript
	   * // in this example, we need to link two pager component
	   * var pager = new Pager({}) // pager compoennt
	   * var pager2 = new Pager({}) // another pager component
	   * pager.$bind(pager2, 'current'); // two way bind throw two component
	   * pager.$bind(pager2, 'total');   // 
	   * // or just
	   * pager.$bind(pager2, {"current": "current", "total": "total"}) 
	   * ```
	   * 
	   * @param  {Regular} component the
	   * @param  {String|Expression} expr1     required, self expr1 to operate binding
	   * @param  {String|Expression} expr2     optional, other component's expr to bind with, if not passed, the expr2 will use the expr1;
	   * @return          this;
	   */
	  $bind: function(component, expr1, expr2){
	    var type = _.typeOf(expr1);
	    if( expr1.type === 'expression' || type === 'string' ){
	      this._bind(component, expr1, expr2)
	    }else if( type === "array" ){ // multiply same path binding through array
	      for(var i = 0, len = expr1.length; i < len; i++){
	        this._bind(component, expr1[i]);
	      }
	    }else if(type === "object"){
	      for(var i in expr1) if(expr1.hasOwnProperty(i)){
	        this._bind(component, i, expr1[i]);
	      }
	    }
	    // digest
	    component.$update();
	    return this;
	  },
	  /**
	   * unbind one component( see $bind also)
	   *
	   * unbind will unbind all relation between two component
	   * 
	   * @param  {Regular} component [descriptionegular
	   * @return {This}    this
	   */
	  $unbind: function(){
	    // todo
	  },
	  $inject: combine.inject,
	  $mute: function(isMute){
	
	    isMute = !!isMute;
	
	    var needupdate = isMute === false && this._mute;
	
	    this._mute = !!isMute;
	
	    if(needupdate) this.$update();
	    return this;
	  },
	  // private bind logic
	  _bind: function(component, expr1, expr2){
	
	    var self = this;
	    // basic binding
	
	    if(!component || !(component instanceof Regular)) throw "$bind() should pass Regular component as first argument";
	    if(!expr1) throw "$bind() should  pass as least one expression to bind";
	
	    if(!expr2) expr2 = expr1;
	
	    expr1 = parse.expression( expr1 );
	    expr2 = parse.expression( expr2 );
	
	    // set is need to operate setting ;
	    if(expr2.set){
	      var wid1 = this.$watch( expr1, function(value){
	        component.$update(expr2, value)
	      });
	      component.$on('$destroy', function(){
	        self.$unwatch(wid1)
	      })
	    }
	    if(expr1.set){
	      var wid2 = component.$watch(expr2, function(value){
	        self.$update(expr1, value)
	      });
	      // when brother destroy, we unlink this watcher
	      this.$on('$destroy', component.$unwatch.bind(component,wid2))
	    }
	    // sync the component's state to called's state
	    expr2.set(component, expr1.get(this));
	  },
	  _walk: function(ast, options){
	    if( _.typeOf(ast) === 'array' ){
	      var res = [];
	
	      for(var i = 0, len = ast.length; i < len; i++){
	        var ret = this._walk(ast[i], options);
	        if(ret && ret.code === ERROR.UNMATCHED_AST){
	          ast.splice(i, 1);
	          i--;
	          len--;
	        }else res.push( ret );
	      }
	
	      return new Group(res);
	    }
	    if(typeof ast === 'string') return doc.createTextNode(ast)
	    return walkers[ast.type || "default"].call(this, ast, options);
	  },
	  _append: function(component){
	    this._children.push(component);
	    component.$parent = this;
	  },
	  _handleEvent: function(elem, type, value, attrs){
	    var Component = this.constructor,
	      fire = typeof value !== "function"? _.handleEvent.call( this, value, type ) : value,
	      handler = Component.event(type), destroy;
	
	    if ( handler ) {
	      destroy = handler.call(this, elem, fire, attrs);
	    } else {
	      dom.on(elem, type, fire);
	    }
	    return handler ? destroy : function() {
	      dom.off(elem, type, fire);
	    }
	  },
	  // 1. 用来处理exprBody -> Function
	  // 2. list里的循环
	  _touchExpr: function(expr){
	    var  rawget, ext = this.__ext__, touched = {};
	    if(expr.type !== 'expression' || expr.touched) return expr;
	    rawget = expr.get || (expr.get = new Function(_.ctxName, _.extName , _.prefix+ "return (" + expr.body + ")"));
	    touched.get = !ext? rawget: function(context){
	      return rawget(context, ext)
	    }
	
	    if(expr.setbody && !expr.set){
	      var setbody = expr.setbody;
	      expr.set = function(ctx, value, ext){
	        expr.set = new Function(_.ctxName, _.setName , _.extName, _.prefix + setbody);          
	        return expr.set(ctx, value, ext);
	      }
	      expr.setbody = null;
	    }
	    if(expr.set){
	      touched.set = !ext? expr.set : function(ctx, value){
	        return expr.set(ctx, value, ext);
	      }
	    }
	    _.extend(touched, {
	      type: 'expression',
	      touched: true,
	      once: expr.once || expr.constant
	    })
	    return touched
	  },
	  // find filter
	  _f_: function(name){
	    var Component = this.constructor;
	    var filter = Component.filter(name);
	    if(!filter) throw Error('filter ' + name + ' is undefined');
	    return filter;
	  },
	  // simple accessor get
	  _sg_:function(path, defaults, ext){
	    if(typeof ext !== 'undefined'){
	      // if(path === "demos")  debugger
	      var computed = this.computed,
	        computedProperty = computed[path];
	      if(computedProperty){
	        if(computedProperty.type==='expression' && !computedProperty.get) this._touchExpr(computedProperty);
	        if(computedProperty.get)  return computedProperty.get(this);
	        else _.log("the computed '" + path + "' don't define the get function,  get data."+path + " altnately", "warn")
	      }
	    }
	    if(typeof defaults === "undefined" || typeof path == "undefined" ){
	      return undefined;
	    }
	    return (ext && typeof ext[path] !== 'undefined')? ext[path]: defaults[path];
	
	  },
	  // simple accessor set
	  _ss_:function(path, value, data , op, computed){
	    var computed = this.computed,
	      op = op || "=", prev, 
	      computedProperty = computed? computed[path]:null;
	
	    if(op !== '='){
	      prev = computedProperty? computedProperty.get(this): data[path];
	      switch(op){
	        case "+=":
	          value = prev + value;
	          break;
	        case "-=":
	          value = prev - value;
	          break;
	        case "*=":
	          value = prev * value;
	          break;
	        case "/=":
	          value = prev / value;
	          break;
	        case "%=":
	          value = prev % value;
	          break;
	      }
	    }
	    if(computedProperty) {
	      if(computedProperty.set) return computedProperty.set(this, value);
	      else _.log("the computed '" + path + "' don't define the set function,  assign data."+path + " altnately", "warn" )
	    }
	    data[path] = value;
	    return value;
	  }
	});
	
	Regular.prototype.inject = function(){
	  _.log("use $inject instead of inject", "error");
	  return this.$inject.apply(this, arguments);
	}
	
	
	// only one builtin filter
	
	Regular.filter(filter);
	
	module.exports = Regular;
	
	
	
	var handleComputed = (function(){
	  // wrap the computed getter;
	  function wrapGet(get){
	    return function(context){
	      return get.call(context, context.data );
	    }
	  }
	  // wrap the computed setter;
	  function wrapSet(set){
	    return function(context, value){
	      set.call( context, value, context.data );
	      return value;
	    }
	  }
	
	  return function(computed){
	    if(!computed) return;
	    var parsedComputed = {}, handle, pair, type;
	    for(var i in computed){
	      handle = computed[i]
	      type = typeof handle;
	
	      if(handle.type === 'expression'){
	        parsedComputed[i] = handle;
	        continue;
	      }
	      if( type === "string" ){
	        parsedComputed[i] = parse.expression(handle)
	      }else{
	        pair = parsedComputed[i] = {type: 'expression'};
	        if(type === "function" ){
	          pair.get = wrapGet(handle);
	        }else{
	          if(handle.get) pair.get = wrapGet(handle.get);
	          if(handle.set) pair.set = wrapSet(handle.set);
	        }
	      } 
	    }
	    return parsedComputed;
	  }
	})();


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	function NodeCursor(node){
	  this.node = node;
	}
	
	
	var no = NodeCursor.prototype;
	
	no.next = function(){
	  this.node = this.node.nextSibling;
	  return this;
	}
	
	module.exports = function(n){ return new NodeCursor(n)}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// http://stackoverflow.com/questions/1354064/how-to-convert-characters-to-html-entities-using-plain-javascript
	var entities = {
	  'quot':34, 
	  'amp':38, 
	  'apos':39, 
	  'lt':60, 
	  'gt':62, 
	  'nbsp':160, 
	  'iexcl':161, 
	  'cent':162, 
	  'pound':163, 
	  'curren':164, 
	  'yen':165, 
	  'brvbar':166, 
	  'sect':167, 
	  'uml':168, 
	  'copy':169, 
	  'ordf':170, 
	  'laquo':171, 
	  'not':172, 
	  'shy':173, 
	  'reg':174, 
	  'macr':175, 
	  'deg':176, 
	  'plusmn':177, 
	  'sup2':178, 
	  'sup3':179, 
	  'acute':180, 
	  'micro':181, 
	  'para':182, 
	  'middot':183, 
	  'cedil':184, 
	  'sup1':185, 
	  'ordm':186, 
	  'raquo':187, 
	  'frac14':188, 
	  'frac12':189, 
	  'frac34':190, 
	  'iquest':191, 
	  'Agrave':192, 
	  'Aacute':193, 
	  'Acirc':194, 
	  'Atilde':195, 
	  'Auml':196, 
	  'Aring':197, 
	  'AElig':198, 
	  'Ccedil':199, 
	  'Egrave':200, 
	  'Eacute':201, 
	  'Ecirc':202, 
	  'Euml':203, 
	  'Igrave':204, 
	  'Iacute':205, 
	  'Icirc':206, 
	  'Iuml':207, 
	  'ETH':208, 
	  'Ntilde':209, 
	  'Ograve':210, 
	  'Oacute':211, 
	  'Ocirc':212, 
	  'Otilde':213, 
	  'Ouml':214, 
	  'times':215, 
	  'Oslash':216, 
	  'Ugrave':217, 
	  'Uacute':218, 
	  'Ucirc':219, 
	  'Uuml':220, 
	  'Yacute':221, 
	  'THORN':222, 
	  'szlig':223, 
	  'agrave':224, 
	  'aacute':225, 
	  'acirc':226, 
	  'atilde':227, 
	  'auml':228, 
	  'aring':229, 
	  'aelig':230, 
	  'ccedil':231, 
	  'egrave':232, 
	  'eacute':233, 
	  'ecirc':234, 
	  'euml':235, 
	  'igrave':236, 
	  'iacute':237, 
	  'icirc':238, 
	  'iuml':239, 
	  'eth':240, 
	  'ntilde':241, 
	  'ograve':242, 
	  'oacute':243, 
	  'ocirc':244, 
	  'otilde':245, 
	  'ouml':246, 
	  'divide':247, 
	  'oslash':248, 
	  'ugrave':249, 
	  'uacute':250, 
	  'ucirc':251, 
	  'uuml':252, 
	  'yacute':253, 
	  'thorn':254, 
	  'yuml':255, 
	  'fnof':402, 
	  'Alpha':913, 
	  'Beta':914, 
	  'Gamma':915, 
	  'Delta':916, 
	  'Epsilon':917, 
	  'Zeta':918, 
	  'Eta':919, 
	  'Theta':920, 
	  'Iota':921, 
	  'Kappa':922, 
	  'Lambda':923, 
	  'Mu':924, 
	  'Nu':925, 
	  'Xi':926, 
	  'Omicron':927, 
	  'Pi':928, 
	  'Rho':929, 
	  'Sigma':931, 
	  'Tau':932, 
	  'Upsilon':933, 
	  'Phi':934, 
	  'Chi':935, 
	  'Psi':936, 
	  'Omega':937, 
	  'alpha':945, 
	  'beta':946, 
	  'gamma':947, 
	  'delta':948, 
	  'epsilon':949, 
	  'zeta':950, 
	  'eta':951, 
	  'theta':952, 
	  'iota':953, 
	  'kappa':954, 
	  'lambda':955, 
	  'mu':956, 
	  'nu':957, 
	  'xi':958, 
	  'omicron':959, 
	  'pi':960, 
	  'rho':961, 
	  'sigmaf':962, 
	  'sigma':963, 
	  'tau':964, 
	  'upsilon':965, 
	  'phi':966, 
	  'chi':967, 
	  'psi':968, 
	  'omega':969, 
	  'thetasym':977, 
	  'upsih':978, 
	  'piv':982, 
	  'bull':8226, 
	  'hellip':8230, 
	  'prime':8242, 
	  'Prime':8243, 
	  'oline':8254, 
	  'frasl':8260, 
	  'weierp':8472, 
	  'image':8465, 
	  'real':8476, 
	  'trade':8482, 
	  'alefsym':8501, 
	  'larr':8592, 
	  'uarr':8593, 
	  'rarr':8594, 
	  'darr':8595, 
	  'harr':8596, 
	  'crarr':8629, 
	  'lArr':8656, 
	  'uArr':8657, 
	  'rArr':8658, 
	  'dArr':8659, 
	  'hArr':8660, 
	  'forall':8704, 
	  'part':8706, 
	  'exist':8707, 
	  'empty':8709, 
	  'nabla':8711, 
	  'isin':8712, 
	  'notin':8713, 
	  'ni':8715, 
	  'prod':8719, 
	  'sum':8721, 
	  'minus':8722, 
	  'lowast':8727, 
	  'radic':8730, 
	  'prop':8733, 
	  'infin':8734, 
	  'ang':8736, 
	  'and':8743, 
	  'or':8744, 
	  'cap':8745, 
	  'cup':8746, 
	  'int':8747, 
	  'there4':8756, 
	  'sim':8764, 
	  'cong':8773, 
	  'asymp':8776, 
	  'ne':8800, 
	  'equiv':8801, 
	  'le':8804, 
	  'ge':8805, 
	  'sub':8834, 
	  'sup':8835, 
	  'nsub':8836, 
	  'sube':8838, 
	  'supe':8839, 
	  'oplus':8853, 
	  'otimes':8855, 
	  'perp':8869, 
	  'sdot':8901, 
	  'lceil':8968, 
	  'rceil':8969, 
	  'lfloor':8970, 
	  'rfloor':8971, 
	  'lang':9001, 
	  'rang':9002, 
	  'loz':9674, 
	  'spades':9824, 
	  'clubs':9827, 
	  'hearts':9829, 
	  'diams':9830, 
	  'OElig':338, 
	  'oelig':339, 
	  'Scaron':352, 
	  'scaron':353, 
	  'Yuml':376, 
	  'circ':710, 
	  'tilde':732, 
	  'ensp':8194, 
	  'emsp':8195, 
	  'thinsp':8201, 
	  'zwnj':8204, 
	  'zwj':8205, 
	  'lrm':8206, 
	  'rlm':8207, 
	  'ndash':8211, 
	  'mdash':8212, 
	  'lsquo':8216, 
	  'rsquo':8217, 
	  'sbquo':8218, 
	  'ldquo':8220, 
	  'rdquo':8221, 
	  'bdquo':8222, 
	  'dagger':8224, 
	  'Dagger':8225, 
	  'permil':8240, 
	  'lsaquo':8249, 
	  'rsaquo':8250, 
	  'euro':8364
	}
	
	
	
	module.exports  = entities;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// Regular
	var _ = __webpack_require__(18);
	var dom = __webpack_require__(17);
	var animate = __webpack_require__(19);
	var Regular = __webpack_require__(30);
	var consts = __webpack_require__(42);
	
	
	
	__webpack_require__(43);
	__webpack_require__(44);
	
	
	module.exports = {
	// **warn**: class inteplation will override this directive 
	  'r-class': function(elem, value){
	    if(typeof value=== 'string'){
	      value = _.fixObjStr(value)
	    }
	    this.$watch(value, function(nvalue){
	      var className = ' '+ elem.className.replace(/\s+/g, ' ') +' ';
	      for(var i in nvalue) if(nvalue.hasOwnProperty(i)){
	        className = className.replace(' ' + i + ' ',' ');
	        if(nvalue[i] === true){
	          className += i+' ';
	        }
	      }
	      elem.className = className.trim();
	    },true);
	  },
	  // **warn**: style inteplation will override this directive 
	  'r-style': function(elem, value){
	    if(typeof value=== 'string'){
	      value = _.fixObjStr(value)
	    }
	    this.$watch(value, function(nvalue){
	      for(var i in nvalue) if(nvalue.hasOwnProperty(i)){
	        dom.css(elem, i, nvalue[i]);
	      }
	    },true);
	  },
	  // when expression is evaluate to true, the elem will add display:none
	  // Example: <div r-hide={{items.length > 0}}></div>
	  'r-hide': function(elem, value){
	    var preBool = null, compelete;
	    if( _.isExpr(value) || typeof value === "string"){
	      this.$watch(value, function(nvalue){
	        var bool = !!nvalue;
	        if(bool === preBool) return; 
	        preBool = bool;
	        if(bool){
	          if(elem.onleave){
	            compelete = elem.onleave(function(){
	              elem.style.display = "none"
	              compelete = null;
	            })
	          }else{
	            elem.style.display = "none"
	          }
	          
	        }else{
	          if(compelete) compelete();
	          elem.style.display = "";
	          if(elem.onenter){
	            elem.onenter();
	          }
	        }
	      });
	    }else if(!!value){
	      elem.style.display = "none";
	    }
	  },
	  'r-html': function(elem, value){
	    this.$watch(value, function(nvalue){
	      nvalue = nvalue || "";
	      dom.html(elem, nvalue)
	    }, {force: true});
	  },
	  'ref': {
	    accept: consts.COMPONENT_TYPE + consts.ELEMENT_TYPE,
	    link: function( elem, value ){
	      var refs = this.$refs || (this.$refs = {});
	      var cval;
	      if(_.isExpr(value)){
	        this.$watch(value, function(nval, oval){
	          cval = nval;
	          if(refs[oval] === elem) refs[oval] = null;
	          if(cval) refs[cval] = elem;
	        })
	      }else{
	        refs[cval = value] = elem;
	      }
	      return function(){
	        refs[cval] = null;
	      }
	    }
	  }
	}
	
	Regular.directive(module.exports);
	
	
	
	
	
	
	
	
	
	


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var // packages
	  _ = __webpack_require__(18),
	 animate = __webpack_require__(19),
	 dom = __webpack_require__(17),
	 Regular = __webpack_require__(30);
	
	
	var // variables
	  rClassName = /^[-\w]+(\s[-\w]+)*$/,
	  rCommaSep = /[\r\n\f ]*,[\r\n\f ]*(?=\w+\:)/, //  dont split comma in  Expression
	  rStyles = /^\{.*\}$/, //  for Simpilfy
	  rSpace = /\s+/, //  for Simpilfy
	  WHEN_COMMAND = "when",
	  EVENT_COMMAND = "on",
	  THEN_COMMAND = "then";
	
	/**
	 * Animation Plugin
	 * @param {Component} Component 
	 */
	
	
	function createSeed(type){
	
	  var steps = [], current = 0, callback = _.noop;
	  var key;
	
	  var out = {
	    type: type,
	    start: function(cb){
	      key = _.uid();
	      if(typeof cb === "function") callback = cb;
	      if(current> 0 ){
	        current = 0 ;
	      }else{
	        out.step();
	      }
	      return out.compelete;
	    },
	    compelete: function(){
	      key = null;
	      callback && callback();
	      callback = _.noop;
	      current = 0;
	    },
	    step: function(){
	      if(steps[current]) steps[current ]( out.done.bind(out, key) );
	    },
	    done: function(pkey){
	      if(pkey !== key) return; // means the loop is down
	      if( current < steps.length - 1 ) {
	        current++;
	        out.step();
	      }else{
	        out.compelete();
	      }
	    },
	    push: function(step){
	      steps.push(step)
	    }
	  }
	
	  return out;
	}
	
	Regular._addProtoInheritCache("animation")
	
	
	// builtin animation
	Regular.animation({
	  "wait": function( step ){
	    var timeout = parseInt( step.param ) || 0
	    return function(done){
	      // _.log("delay " + timeout)
	      setTimeout( done, timeout );
	    }
	  },
	  "class": function(step){
	    var tmp = step.param.split(","),
	      className = tmp[0] || "",
	      mode = parseInt(tmp[1]) || 1;
	
	    return function(done){
	      // _.log(className)
	      animate.startClassAnimate( step.element, className , done, mode );
	    }
	  },
	  "call": function(step){
	    var fn = this.$expression(step.param).get, self = this;
	    return function(done){
	      // _.log(step.param, 'call')
	      fn(self);
	      self.$update();
	      done()
	    }
	  },
	  "emit": function(step){
	    var param = step.param;
	    var tmp = param.split(","),
	      evt = tmp[0] || "",
	      args = tmp[1]? this.$expression(tmp[1]).get: null;
	
	    if(!evt) throw Error("you shoud specified a eventname in emit command");
	
	    var self = this;
	    return function(done){
	      self.$emit(evt, args? args(self) : undefined);
	      done();
	    }
	  },
	  // style: left {10}px,
	  style: function(step){
	    var styles = {}, 
	      param = step.param,
	      pairs = param.split(","), valid;
	    pairs.forEach(function(pair){
	      pair = pair.trim();
	      if(pair){
	        var tmp = pair.split( rSpace ),
	          name = tmp.shift(),
	          value = tmp.join(" ");
	
	        if( !name || !value ) throw Error("invalid style in command: style");
	        styles[name] = value;
	        valid = true;
	      }
	    })
	
	    return function(done){
	      if(valid){
	        animate.startStyleAnimate(step.element, styles, done);
	      }else{
	        done();
	      }
	    }
	  }
	})
	
	
	
	// hancdle the r-animation directive
	// el : the element to process
	// value: the directive value
	function processAnimate( element, value ){
	  var Component = this.constructor;
	
	  if(_.isExpr(value)){
	    value = value.get(this);
	  }
	
	  value = value.trim();
	
	  var composites = value.split(";"), 
	    composite, context = this, seeds = [], seed, destroies = [], destroy,
	    command, param , current = 0, tmp, animator, self = this;
	
	  function reset( type ){
	    seed && seeds.push( seed )
	    seed = createSeed( type );
	  }
	
	  function whenCallback(start, value){
	    if( !!value ) start()
	  }
	
	  function animationDestroy(element){
	    return function(){
	      element.onenter = null;
	      element.onleave = null;
	    } 
	  }
	
	  for( var i = 0, len = composites.length; i < len; i++ ){
	
	    composite = composites[i];
	    tmp = composite.split(":");
	    command = tmp[0] && tmp[0].trim();
	    param = tmp[1] && tmp[1].trim();
	
	    if( !command ) continue;
	
	    if( command === WHEN_COMMAND ){
	      reset("when");
	      this.$watch(param, whenCallback.bind( this, seed.start ) );
	      continue;
	    }
	
	    if( command === EVENT_COMMAND){
	      reset(param);
	      if( param === "leave" ){
	        element.onleave = seed.start;
	        destroies.push( animationDestroy(element) );
	      }else if( param === "enter" ){
	        element.onenter = seed.start;
	        destroies.push( animationDestroy(element) );
	      }else{
	        if( ("on" + param) in element){ // if dom have the event , we use dom event
	          destroies.push(this._handleEvent( element, param, seed.start ));
	        }else{ // otherwise, we use component event
	          this.$on(param, seed.start);
	          destroies.push(this.$off.bind(this, param, seed.start));
	        }
	      }
	      continue;
	    }
	
	    var animator =  Component.animation(command) 
	    if( animator && seed ){
	      seed.push(
	        animator.call(this,{
	          element: element,
	          done: seed.done,
	          param: param 
	        })
	      )
	    }else{
	      throw Error( animator? "you should start with `on` or `event` in animation" : ("undefined animator 【" + command +"】" ));
	    }
	  }
	
	  if(destroies.length){
	    return function(){
	      destroies.forEach(function(destroy){
	        destroy();
	      })
	    }
	  }
	}
	
	
	Regular.directive( "r-animation", processAnimate)
	Regular.directive( "r-anim", processAnimate)
	


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var Regular = __webpack_require__(30);
	
	/**
	 * Timeout Module
	 * @param {Component} Component 
	 */
	function TimeoutModule(Component){
	
	  Component.implement({
	    /**
	     * just like setTimeout, but will enter digest automately
	     * @param  {Function} fn    
	     * @param  {Number}   delay 
	     * @return {Number}   timeoutid
	     */
	    $timeout: function(fn, delay){
	      delay = delay || 0;
	      return setTimeout(function(){
	        fn.call(this);
	        this.$update(); //enter digest
	      }.bind(this), delay);
	    },
	    /**
	     * just like setInterval, but will enter digest automately
	     * @param  {Function} fn    
	     * @param  {Number}   interval 
	     * @return {Number}   intervalid
	     */
	    $interval: function(fn, interval){
	      interval = interval || 1000/60;
	      return setInterval(function(){
	        fn.call(this);
	        this.$update(); //enter digest
	      }.bind(this), interval);
	    }
	  });
	}
	
	
	Regular.plugin('timeout', TimeoutModule);
	Regular.plugin('$timeout', TimeoutModule);

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(18);
	
	var config = __webpack_require__(29);
	var node = __webpack_require__(45);
	var Lexer = __webpack_require__(37);
	var varName = _.varName;
	var ctxName = _.ctxName;
	var extName = _.extName;
	var isPath = _.makePredicate("STRING IDENT NUMBER");
	var isKeyWord = _.makePredicate("true false undefined null this Array Date JSON Math NaN RegExp decodeURI decodeURIComponent encodeURI encodeURIComponent parseFloat parseInt Object");
	var isInvalidTag = _.makePredicate("script style");
	
	
	
	function Parser(input, opts){
	  opts = opts || {};
	
	  this.input = input;
	  this.tokens = new Lexer(input, opts).lex();
	  this.pos = 0;
	  this.length = this.tokens.length;
	}
	
	
	var op = Parser.prototype;
	
	
	op.parse = function(){
	  this.pos = 0;
	  var res= this.program();
	  if(this.ll().type === 'TAG_CLOSE'){
	    this.error("You may got a unclosed Tag")
	  }
	  return res;
	}
	
	op.ll =  function(k){
	  k = k || 1;
	  if(k < 0) k = k + 1;
	  var pos = this.pos + k - 1;
	  if(pos > this.length - 1){
	      return this.tokens[this.length-1];
	  }
	  return this.tokens[pos];
	}
	  // lookahead
	op.la = function(k){
	  return (this.ll(k) || '').type;
	}
	
	op.match = function(type, value){
	  var ll;
	  if(!(ll = this.eat(type, value))){
	    ll  = this.ll();
	    this.error('expect [' + type + (value == null? '':':'+ value) + ']" -> got "[' + ll.type + (value==null? '':':'+ll.value) + ']', ll.pos)
	  }else{
	    return ll;
	  }
	}
	
	op.error = function(msg, pos){
	  msg =  "\n【 parse failed 】 " + msg +  ':\n\n' + _.trackErrorPos(this.input, typeof pos === 'number'? pos: this.ll().pos||0);
	  throw new Error(msg);
	}
	
	op.next = function(k){
	  k = k || 1;
	  this.pos += k;
	}
	op.eat = function(type, value){
	  var ll = this.ll();
	  if(typeof type !== 'string'){
	    for(var len = type.length ; len--;){
	      if(ll.type === type[len]) {
	        this.next();
	        return ll;
	      }
	    }
	  }else{
	    if( ll.type === type && (typeof value === 'undefined' || ll.value === value) ){
	       this.next();
	       return ll;
	    }
	  }
	  return false;
	}
	
	// program
	//  :EOF
	//  | (statement)* EOF
	op.program = function(){
	  var statements = [],  ll = this.ll();
	  while(ll.type !== 'EOF' && ll.type !=='TAG_CLOSE'){
	
	    statements.push(this.statement());
	    ll = this.ll();
	  }
	  // if(ll.type === 'TAG_CLOSE') this.error("You may have unmatched Tag")
	  return statements;
	}
	
	// statement
	//  : xml
	//  | jst
	//  | text
	op.statement = function(){
	  var ll = this.ll();
	  switch(ll.type){
	    case 'NAME':
	    case 'TEXT':
	      var text = ll.value;
	      this.next();
	      while(ll = this.eat(['NAME', 'TEXT'])){
	        text += ll.value;
	      }
	      return node.text(text);
	    case 'TAG_OPEN':
	      return this.xml();
	    case 'OPEN': 
	      return this.directive();
	    case 'EXPR_OPEN':
	      return this.interplation();
	    default:
	      this.error('Unexpected token: '+ this.la())
	  }
	}
	
	// xml 
	// stag statement* TAG_CLOSE?(if self-closed tag)
	op.xml = function(){
	  var name, attrs, children, selfClosed;
	  name = this.match('TAG_OPEN').value;
	
	  if( isInvalidTag(name)){
	    this.error('Invalid Tag: ' + name);
	  }
	  attrs = this.attrs();
	  selfClosed = this.eat('/')
	  this.match('>');
	  if( !selfClosed && !_.isVoidTag(name) ){
	    children = this.program();
	    if(!this.eat('TAG_CLOSE', name)) this.error('expect </'+name+'> got'+ 'no matched closeTag')
	  }
	  return node.element(name, attrs, children);
	}
	
	// xentity
	//  -rule(wrap attribute)
	//  -attribute
	//
	// __example__
	//  name = 1 |  
	//  ng-hide |
	//  on-click={{}} | 
	//  {{#if name}}on-click={{xx}}{{#else}}on-tap={{}}{{/if}}
	
	op.xentity = function(ll){
	  var name = ll.value, value, modifier;
	  if(ll.type === 'NAME'){
	    //@ only for test
	    if(~name.indexOf('.')){
	      var tmp = name.split('.');
	      name = tmp[0];
	      modifier = tmp[1]
	
	    }
	    if( this.eat("=") ) value = this.attvalue(modifier);
	    return node.attribute( name, value, modifier );
	  }else{
	    if( name !== 'if') this.error("current version. ONLY RULE #if #else #elseif is valid in tag, the rule #" + name + ' is invalid');
	    return this['if'](true);
	  }
	
	}
	
	// stag     ::=    '<' Name (S attr)* S? '>'  
	// attr    ::=     Name Eq attvalue
	op.attrs = function(isAttribute){
	  var eat
	  if(!isAttribute){
	    eat = ["NAME", "OPEN"]
	  }else{
	    eat = ["NAME"]
	  }
	
	  var attrs = [], ll;
	  while (ll = this.eat(eat)){
	    attrs.push(this.xentity( ll ))
	  }
	  return attrs;
	}
	
	// attvalue
	//  : STRING  
	//  | NAME
	op.attvalue = function(mdf){
	  var ll = this.ll();
	  switch(ll.type){
	    case "NAME":
	    case "UNQ":
	    case "STRING":
	      this.next();
	      var value = ll.value;
	      return value;
	    case "EXPR_OPEN":
	      return this.interplation();
	    // case "OPEN":
	    //   if(ll.value === 'inc' || ll.value === 'include'){
	    //     this.next();
	    //     return this.inc();
	    //   }else{
	    //     this.error('attribute value only support inteplation and {#inc} statement')
	    //   }
	    //   break;
	    default:
	      this.error('Unexpected token: '+ this.la())
	  }
	}
	
	
	// {{#}}
	op.directive = function(){
	  var name = this.ll().value;
	  this.next();
	  if(typeof this[name] === 'function'){
	    return this[name]()
	  }else{
	    this.error('Undefined directive['+ name +']');
	  }
	}
	
	
	
	
	
	// {{}}
	op.interplation = function(){
	  this.match('EXPR_OPEN');
	  var res = this.expression(true);
	  this.match('END');
	  return res;
	}
	
	// {{~}}
	op.inc = op.include = function(){
	  var content = this.expression();
	  this.match('END');
	  return node.template(content);
	}
	
	// {{#if}}
	op["if"] = function(tag){
	  var test = this.expression();
	  var consequent = [], alternate=[];
	
	  var container = consequent;
	  var statement = !tag? "statement" : "attrs";
	
	  this.match('END');
	
	  var ll, close;
	  while( ! (close = this.eat('CLOSE')) ){
	    ll = this.ll();
	    if( ll.type === 'OPEN' ){
	      switch( ll.value ){
	        case 'else':
	          container = alternate;
	          this.next();
	          this.match( 'END' );
	          break;
	        case 'elseif':
	          this.next();
	          alternate.push( this["if"](tag) );
	          return node['if']( test, consequent, alternate );
	        default:
	          container.push( this[statement](true) );
	      }
	    }else{
	      container.push(this[statement](true));
	    }
	  }
	  // if statement not matched
	  if(close.value !== "if") this.error('Unmatched if directive')
	  return node["if"](test, consequent, alternate);
	}
	
	
	// @mark   mustache syntax have natrure dis, canot with expression
	// {{#list}}
	op.list = function(){
	  // sequence can be a list or hash
	  var sequence = this.expression(), variable, ll, track;
	  var consequent = [], alternate=[];
	  var container = consequent;
	
	  this.match('IDENT', 'as');
	
	  variable = this.match('IDENT').value;
	
	  if(this.eat('IDENT', 'by')){
	    if(this.eat('IDENT',variable + '_index')){
	      track = true;
	    }else{
	      track = this.expression();
	      if(track.constant){
	        // true is means constant, we handle it just like xxx_index.
	        track = true;
	      }
	    }
	  }
	
	  this.match('END');
	
	  while( !(ll = this.eat('CLOSE')) ){
	    if(this.eat('OPEN', 'else')){
	      container =  alternate;
	      this.match('END');
	    }else{
	      container.push(this.statement());
	    }
	  }
	  
	  if(ll.value !== 'list') this.error('expect ' + 'list got ' + '/' + ll.value + ' ', ll.pos );
	  return node.list(sequence, variable, consequent, alternate, track);
	}
	
	
	op.expression = function(){
	  var expression;
	  if(this.eat('@(')){ //once bind
	    expression = this.expr();
	    expression.once = true;
	    this.match(')')
	  }else{
	    expression = this.expr();
	  }
	  return expression;
	}
	
	op.expr = function(){
	  this.depend = [];
	
	  var buffer = this.filter()
	
	  var body = buffer.get || buffer;
	  var setbody = buffer.set;
	  return node.expression(body, setbody, !this.depend.length);
	}
	
	
	// filter
	// assign ('|' filtername[':' args]) * 
	op.filter = function(){
	  var left = this.assign();
	  var ll = this.eat('|');
	  var buffer = [], setBuffer, prefix,
	    attr = "t", 
	    set = left.set, get, 
	    tmp = "";
	
	  if(ll){
	    if(set) setBuffer = [];
	
	    prefix = "(function(" + attr + "){";
	
	    do{
	      tmp = attr + " = " + ctxName + "._f_('" + this.match('IDENT').value+ "' ).get.call( "+_.ctxName +"," + attr ;
	      if(this.eat(':')){
	        tmp +=", "+ this.arguments("|").join(",") + ");"
	      }else{
	        tmp += ');'
	      }
	      buffer.push(tmp);
	      setBuffer && setBuffer.unshift( tmp.replace(" ).get.call", " ).set.call") );
	
	    }while(ll = this.eat('|'));
	    buffer.push("return " + attr );
	    setBuffer && setBuffer.push("return " + attr);
	
	    get =  prefix + buffer.join("") + "})("+left.get+")";
	    // we call back to value.
	    if(setBuffer){
	      // change _ss__(name, _p_) to _s__(name, filterFn(_p_));
	      set = set.replace(_.setName, 
	        prefix + setBuffer.join("") + "})("+　_.setName　+")" );
	
	    }
	    // the set function is depend on the filter definition. if it have set method, the set will work
	    return this.getset(get, set);
	  }
	  return left;
	}
	
	// assign
	// left-hand-expr = condition
	op.assign = function(){
	  var left = this.condition(), ll;
	  if(ll = this.eat(['=', '+=', '-=', '*=', '/=', '%='])){
	    if(!left.set) this.error('invalid lefthand expression in assignment expression');
	    return this.getset( left.set.replace( "," + _.setName, "," + this.condition().get ).replace("'='", "'"+ll.type+"'"), left.set);
	    // return this.getset('(' + left.get + ll.type  + this.condition().get + ')', left.set);
	  }
	  return left;
	}
	
	// or
	// or ? assign : assign
	op.condition = function(){
	
	  var test = this.or();
	  if(this.eat('?')){
	    return this.getset([test.get + "?", 
	      this.assign().get, 
	      this.match(":").type, 
	      this.assign().get].join(""));
	  }
	
	  return test;
	}
	
	// and
	// and && or
	op.or = function(){
	
	  var left = this.and();
	
	  if(this.eat('||')){
	    return this.getset(left.get + '||' + this.or().get);
	  }
	
	  return left;
	}
	// equal
	// equal && and
	op.and = function(){
	
	  var left = this.equal();
	
	  if(this.eat('&&')){
	    return this.getset(left.get + '&&' + this.and().get);
	  }
	  return left;
	}
	// relation
	// 
	// equal == relation
	// equal != relation
	// equal === relation
	// equal !== relation
	op.equal = function(){
	  var left = this.relation(), ll;
	  // @perf;
	  if( ll = this.eat(['==','!=', '===', '!=='])){
	    return this.getset(left.get + ll.type + this.equal().get);
	  }
	  return left
	}
	// relation < additive
	// relation > additive
	// relation <= additive
	// relation >= additive
	// relation in additive
	op.relation = function(){
	  var left = this.additive(), ll;
	  // @perf
	  if(ll = (this.eat(['<', '>', '>=', '<=']) || this.eat('IDENT', 'in') )){
	    return this.getset(left.get + ll.value + this.relation().get);
	  }
	  return left
	}
	// additive :
	// multive
	// additive + multive
	// additive - multive
	op.additive = function(){
	  var left = this.multive() ,ll;
	  if(ll= this.eat(['+','-']) ){
	    return this.getset(left.get + ll.value + this.additive().get);
	  }
	  return left
	}
	// multive :
	// unary
	// multive * unary
	// multive / unary
	// multive % unary
	op.multive = function(){
	  var left = this.range() ,ll;
	  if( ll = this.eat(['*', '/' ,'%']) ){
	    return this.getset(left.get + ll.type + this.multive().get);
	  }
	  return left;
	}
	
	op.range = function(){
	  var left = this.unary(), ll, right;
	
	  if(ll = this.eat('..')){
	    right = this.unary();
	    var body = 
	      "(function(start,end){var res = [],step=end>start?1:-1; for(var i = start; end>start?i <= end: i>=end; i=i+step){res.push(i); } return res })("+left.get+","+right.get+")"
	    return this.getset(body);
	  }
	
	  return left;
	}
	
	
	
	// lefthand
	// + unary
	// - unary
	// ~ unary
	// ! unary
	op.unary = function(){
	  var ll;
	  if(ll = this.eat(['+','-','~', '!'])){
	    return this.getset('(' + ll.type + this.unary().get + ')') ;
	  }else{
	    return this.member()
	  }
	}
	
	// call[lefthand] :
	// member args
	// member [ expression ]
	// member . ident  
	
	op.member = function(base, last, pathes, prevBase){
	  var ll, path, extValue;
	
	
	  var onlySimpleAccessor = false;
	  if(!base){ //first
	    path = this.primary();
	    var type = typeof path;
	    if(type === 'string'){ 
	      pathes = [];
	      pathes.push( path );
	      last = path;
	      extValue = extName + "." + path
	      base = ctxName + "._sg_('" + path + "', " + varName + ", " + extName + ")";
	      onlySimpleAccessor = true;
	    }else{ //Primative Type
	      if(path.get === 'this'){
	        base = ctxName;
	        pathes = ['this'];
	      }else{
	        pathes = null;
	        base = path.get;
	      }
	    }
	  }else{ // not first enter
	    if(typeof last === 'string' && isPath( last) ){ // is valid path
	      pathes.push(last);
	    }else{
	      if(pathes && pathes.length) this.depend.push(pathes);
	      pathes = null;
	    }
	  }
	  if(ll = this.eat(['[', '.', '('])){
	    switch(ll.type){
	      case '.':
	          // member(object, property, computed)
	        var tmpName = this.match('IDENT').value;
	        prevBase = base;
	        if( this.la() !== "(" ){ 
	          base = ctxName + "._sg_('" + tmpName + "', " + base + ")";
	        }else{
	          base += "['" + tmpName + "']";
	        }
	        return this.member( base, tmpName, pathes,  prevBase);
	      case '[':
	          // member(object, property, computed)
	        path = this.assign();
	        prevBase = base;
	        if( this.la() !== "(" ){ 
	        // means function call, we need throw undefined error when call function
	        // and confirm that the function call wont lose its context
	          base = ctxName + "._sg_(" + path.get + ", " + base + ")";
	        }else{
	          base += "[" + path.get + "]";
	        }
	        this.match(']')
	        return this.member(base, path, pathes, prevBase);
	      case '(':
	        // call(callee, args)
	        var args = this.arguments().join(',');
	        base =  base+"(" + args +")";
	        this.match(')')
	        return this.member(base, null, pathes);
	    }
	  }
	  if( pathes && pathes.length ) this.depend.push( pathes );
	  var res =  {get: base};
	  if(last){
	    res.set = ctxName + "._ss_(" + 
	        (last.get? last.get : "'"+ last + "'") + 
	        ","+ _.setName + ","+ 
	        (prevBase?prevBase:_.varName) + 
	        ", '=', "+ ( onlySimpleAccessor? 1 : 0 ) + ")";
	  
	  }
	  return res;
	}
	
	/**
	 * 
	 */
	op.arguments = function(end){
	  end = end || ')'
	  var args = [];
	  do{
	    if(this.la() !== end){
	      args.push(this.assign().get)
	    }
	  }while( this.eat(','));
	  return args
	}
	
	
	// primary :
	// this 
	// ident
	// literal
	// array
	// object
	// ( expression )
	
	op.primary = function(){
	  var ll = this.ll();
	  switch(ll.type){
	    case "{":
	      return this.object();
	    case "[":
	      return this.array();
	    case "(":
	      return this.paren();
	    // literal or ident
	    case 'STRING':
	      this.next();
	      return this.getset("'" + ll.value + "'")
	    case 'NUMBER':
	      this.next();
	      return this.getset(""+ll.value);
	    case "IDENT":
	      this.next();
	      if(isKeyWord(ll.value)){
	        return this.getset( ll.value );
	      }
	      return ll.value;
	    default: 
	      this.error('Unexpected Token: ' + ll.type);
	  }
	}
	
	// object
	//  {propAssign [, propAssign] * [,]}
	
	// propAssign
	//  prop : assign
	
	// prop
	//  STRING
	//  IDENT
	//  NUMBER
	
	op.object = function(){
	  var code = [this.match('{').type];
	
	  var ll = this.eat( ['STRING', 'IDENT', 'NUMBER'] );
	  while(ll){
	    code.push("'" + ll.value + "'" + this.match(':').type);
	    var get = this.assign().get;
	    code.push(get);
	    ll = null;
	    if(this.eat(",") && (ll = this.eat(['STRING', 'IDENT', 'NUMBER'])) ) code.push(",");
	  }
	  code.push(this.match('}').type);
	  return {get: code.join("")}
	}
	
	// array
	// [ assign[,assign]*]
	op.array = function(){
	  var code = [this.match('[').type], item;
	  if( this.eat("]") ){
	
	     code.push("]");
	  } else {
	    while(item = this.assign()){
	      code.push(item.get);
	      if(this.eat(',')) code.push(",");
	      else break;
	    }
	    code.push(this.match(']').type);
	  }
	  return {get: code.join("")};
	}
	
	// '(' expression ')'
	op.paren = function(){
	  this.match('(');
	  var res = this.filter()
	  res.get = '(' + res.get + ')';
	  this.match(')');
	  return res;
	}
	
	op.getset = function(get, set){
	  return {
	    get: get,
	    set: set
	  }
	}
	
	
	
	module.exports = Parser;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(18);
	var config = __webpack_require__(29);
	
	// some custom tag  will conflict with the Lexer progress
	var conflictTag = {"}": "{", "]": "["}, map1, map2;
	// some macro for lexer
	var macro = {
	  'NAME': /(?:[:_A-Za-z][-\.:_0-9A-Za-z]*)/,
	  'IDENT': /[\$_A-Za-z][_0-9A-Za-z\$]*/,
	  'SPACE': /[\r\n\t\f ]/
	}
	
	
	var test = /a|(b)/.exec("a");
	var testSubCapure = test && test[1] === undefined? 
	  function(str){ return str !== undefined }
	  :function(str){return !!str};
	
	function wrapHander(handler){
	  return function(all){
	    return {type: handler, value: all }
	  }
	}
	
	function Lexer(input, opts){
	  if(conflictTag[config.END]){
	    this.markStart = conflictTag[config.END];
	    this.markEnd = config.END;
	  }
	
	  this.input = (input||"").trim();
	  this.opts = opts || {};
	  this.map = this.opts.mode !== 2?  map1: map2;
	  this.states = ["INIT"];
	  if(opts && opts.expression){
	     this.states.push("JST");
	     this.expression = true;
	  }
	}
	
	var lo = Lexer.prototype
	
	
	lo.lex = function(str){
	  str = (str || this.input).trim();
	  var tokens = [], split, test,mlen, token, state;
	  this.input = str, 
	  this.marks = 0;
	  // init the pos index
	  this.index=0;
	  var i = 0;
	  while(str){
	    i++
	    state = this.state();
	    split = this.map[state] 
	    test = split.TRUNK.exec(str);
	    if(!test){
	      this.error('Unrecoginized Token');
	    }
	    mlen = test[0].length;
	    str = str.slice(mlen)
	    token = this._process.call(this, test, split, str)
	    if(token) tokens.push(token)
	    this.index += mlen;
	    // if(state == 'TAG' || state == 'JST') str = this.skipspace(str);
	  }
	
	  tokens.push({type: 'EOF'});
	
	  return tokens;
	}
	
	lo.error = function(msg){
	  throw  Error("Parse Error: " + msg +  ':\n' + _.trackErrorPos(this.input, this.index));
	}
	
	lo._process = function(args, split,str){
	  // console.log(args.join(","), this.state())
	  var links = split.links, marched = false, token;
	
	  for(var len = links.length, i=0;i<len ;i++){
	    var link = links[i],
	      handler = link[2],
	      index = link[0];
	    // if(args[6] === '>' && index === 6) console.log('haha')
	    if(testSubCapure(args[index])) {
	      marched = true;
	      if(handler){
	        token = handler.apply(this, args.slice(index, index + link[1]))
	        if(token)  token.pos = this.index;
	      }
	      break;
	    }
	  }
	  if(!marched){ // in ie lt8 . sub capture is "" but ont 
	    switch(str.charAt(0)){
	      case "<":
	        this.enter("TAG");
	        break;
	      default:
	        this.enter("JST");
	        break;
	    }
	  }
	  return token;
	}
	lo.enter = function(state){
	  this.states.push(state)
	  return this;
	}
	
	lo.state = function(){
	  var states = this.states;
	  return states[states.length-1];
	}
	
	lo.leave = function(state){
	  var states = this.states;
	  if(!state || states[states.length-1] === state) states.pop()
	}
	
	
	Lexer.setup = function(){
	  macro.END = config.END;
	  macro.BEGIN = config.BEGIN;
	  
	  // living template lexer
	  map1 = genMap([
	    // INIT
	    rules.ENTER_JST,
	    rules.ENTER_TAG,
	    rules.TEXT,
	
	    //TAG
	    rules.TAG_NAME,
	    rules.TAG_OPEN,
	    rules.TAG_CLOSE,
	    rules.TAG_PUNCHOR,
	    rules.TAG_ENTER_JST,
	    rules.TAG_UNQ_VALUE,
	    rules.TAG_STRING,
	    rules.TAG_SPACE,
	    rules.TAG_COMMENT,
	
	    // JST
	    rules.JST_OPEN,
	    rules.JST_CLOSE,
	    rules.JST_COMMENT,
	    rules.JST_EXPR_OPEN,
	    rules.JST_IDENT,
	    rules.JST_SPACE,
	    rules.JST_LEAVE,
	    rules.JST_NUMBER,
	    rules.JST_PUNCHOR,
	    rules.JST_STRING,
	    rules.JST_COMMENT
	    ])
	
	  // ignored the tag-relative token
	  map2 = genMap([
	    // INIT no < restrict
	    rules.ENTER_JST2,
	    rules.TEXT,
	    // JST
	    rules.JST_COMMENT,
	    rules.JST_OPEN,
	    rules.JST_CLOSE,
	    rules.JST_EXPR_OPEN,
	    rules.JST_IDENT,
	    rules.JST_SPACE,
	    rules.JST_LEAVE,
	    rules.JST_NUMBER,
	    rules.JST_PUNCHOR,
	    rules.JST_STRING,
	    rules.JST_COMMENT
	    ])
	}
	
	
	function genMap(rules){
	  var rule, map = {}, sign;
	  for(var i = 0, len = rules.length; i < len ; i++){
	    rule = rules[i];
	    sign = rule[2] || 'INIT';
	    ( map[sign] || (map[sign] = {rules:[], links:[]}) ).rules.push(rule);
	  }
	  return setup(map);
	}
	
	function setup(map){
	  var split, rules, trunks, handler, reg, retain, rule;
	  function replaceFn(all, one){
	    return typeof macro[one] === 'string'? 
	      _.escapeRegExp(macro[one]) 
	      : String(macro[one]).slice(1,-1);
	  }
	
	  for(var i in map){
	
	    split = map[i];
	    split.curIndex = 1;
	    rules = split.rules;
	    trunks = [];
	
	    for(var j = 0,len = rules.length; j<len; j++){
	      rule = rules[j]; 
	      reg = rule[0];
	      handler = rule[1];
	
	      if(typeof handler === 'string'){
	        handler = wrapHander(handler);
	      }
	      if(_.typeOf(reg) === 'regexp') reg = reg.toString().slice(1, -1);
	
	      reg = reg.replace(/\{(\w+)\}/g, replaceFn)
	      retain = _.findSubCapture(reg) + 1; 
	      split.links.push([split.curIndex, retain, handler]); 
	      split.curIndex += retain;
	      trunks.push(reg);
	    }
	    split.TRUNK = new RegExp("^(?:(" + trunks.join(")|(") + "))")
	  }
	  return map;
	}
	
	var rules = {
	
	  // 1. INIT
	  // ---------------
	
	  // mode1's JST ENTER RULE
	  ENTER_JST: [/[^\x00<]*?(?={BEGIN})/, function(all){
	    this.enter('JST');
	    if(all) return {type: 'TEXT', value: all}
	  }],
	
	  // mode2's JST ENTER RULE
	  ENTER_JST2: [/[^\x00]*?(?={BEGIN})/, function(all){
	    this.enter('JST');
	    if(all) return {type: 'TEXT', value: all}
	  }],
	
	  ENTER_TAG: [/[^\x00]*?(?=<[\w\/\!])/, function(all){ 
	    this.enter('TAG');
	    if(all) return {type: 'TEXT', value: all}
	  }],
	
	  TEXT: [/[^\x00]+/, 'TEXT' ],
	
	  // 2. TAG
	  // --------------------
	  TAG_NAME: [/{NAME}/, 'NAME', 'TAG'],
	  TAG_UNQ_VALUE: [/[^\{}&"'=><`\r\n\f\t ]+/, 'UNQ', 'TAG'],
	
	  TAG_OPEN: [/<({NAME})\s*/, function(all, one){ //"
	    return {type: 'TAG_OPEN', value: one}
	  }, 'TAG'],
	  TAG_CLOSE: [/<\/({NAME})[\r\n\f\t ]*>/, function(all, one){
	    this.leave();
	    return {type: 'TAG_CLOSE', value: one }
	  }, 'TAG'],
	
	    // mode2's JST ENTER RULE
	  TAG_ENTER_JST: [/(?={BEGIN})/, function(){
	    this.enter('JST');
	  }, 'TAG'],
	
	
	  TAG_PUNCHOR: [/[\>\/=&]/, function(all){
	    if(all === '>') this.leave();
	    return {type: all, value: all }
	  }, 'TAG'],
	  TAG_STRING:  [ /'([^']*)'|"([^"]*)\"/, /*'*/  function(all, one, two){ 
	    var value = one || two || "";
	
	    return {type: 'STRING', value: value}
	  }, 'TAG'],
	
	  TAG_SPACE: [/{SPACE}+/, null, 'TAG'],
	  TAG_COMMENT: [/<\!--([^\x00]*?)--\>/, function(all){
	    this.leave()
	    // this.leave('TAG')
	  } ,'TAG'],
	
	  // 3. JST
	  // -------------------
	
	  JST_OPEN: ['{BEGIN}#{SPACE}*({IDENT})', function(all, name){
	    return {
	      type: 'OPEN',
	      value: name
	    }
	  }, 'JST'],
	  JST_LEAVE: [/{END}/, function(all){
	    if(this.markEnd === all && this.expression) return {type: this.markEnd, value: this.markEnd};
	    if(!this.markEnd || !this.marks ){
	      this.firstEnterStart = false;
	      this.leave('JST');
	      return {type: 'END'}
	    }else{
	      this.marks--;
	      return {type: this.markEnd, value: this.markEnd}
	    }
	  }, 'JST'],
	  JST_CLOSE: [/{BEGIN}\s*\/({IDENT})\s*{END}/, function(all, one){
	    this.leave('JST');
	    return {
	      type: 'CLOSE',
	      value: one
	    }
	  }, 'JST'],
	  JST_COMMENT: [/{BEGIN}\!([^\x00]*?)\!{END}/, function(){
	    this.leave();
	  }, 'JST'],
	  JST_EXPR_OPEN: ['{BEGIN}',function(all, one){
	    if(all === this.markStart){
	      if(this.expression) return { type: this.markStart, value: this.markStart };
	      if(this.firstEnterStart || this.marks){
	        this.marks++
	        this.firstEnterStart = false;
	        return { type: this.markStart, value: this.markStart };
	      }else{
	        this.firstEnterStart = true;
	      }
	    }
	    return {
	      type: 'EXPR_OPEN',
	      escape: false
	    }
	
	  }, 'JST'],
	  JST_IDENT: ['{IDENT}', 'IDENT', 'JST'],
	  JST_SPACE: [/[ \r\n\f]+/, null, 'JST'],
	  JST_PUNCHOR: [/[=!]?==|[-=><+*\/%\!]?\=|\|\||&&|\@\(|\.\.|[<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!,]/, function(all){
	    return { type: all, value: all }
	  },'JST'],
	
	  JST_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
	    return {type: 'STRING', value: one || two || ""}
	  }, 'JST'],
	  JST_NUMBER: [/(?:[0-9]*\.[0-9]+|[0-9]+)(e\d+)?/, function(all){
	    return {type: 'NUMBER', value: parseFloat(all, 10)};
	  }, 'JST']
	}
	
	
	// setup when first config
	Lexer.setup();
	
	
	
	module.exports = Lexer;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var diffArray = __webpack_require__(24).diffArray;
	var combine = __webpack_require__(20);
	var animate = __webpack_require__(19);
	var Parser = __webpack_require__(36);
	var node = __webpack_require__(45);
	var Group = __webpack_require__(39);
	var dom = __webpack_require__(17);
	var _ = __webpack_require__(18);
	var consts =   __webpack_require__(42)
	var ERROR = consts.ERROR;
	var MSG = consts.MSG;
	var nodeCursor = __webpack_require__(31);
	var config = __webpack_require__(29)
	
	
	
	var walkers = module.exports = {};
	
	walkers.list = function(ast, options){
	
	  var Regular = walkers.Regular;  
	  var placeholder = document.createComment("Regular list"),
	    namespace = options.namespace,
	    extra = options.extra;
	
	  var self = this;
	  var group = new Group([placeholder]);
	  var indexName = ast.variable + '_index';
	  var keyName = ast.variable + '_key';
	  var variable = ast.variable;
	  var alternate = ast.alternate;
	  var track = ast.track, keyOf, extraObj;
	  var cursor = options.cursor;
	
	  if( track && track !== true ){
	    track = this._touchExpr(track);
	    extraObj = _.createObject(extra);
	    keyOf = function( item, index ){
	      extraObj[ variable ] = item;
	      extraObj[ indexName ] = index;
	      // @FIX keyName
	      return track.get( self, extraObj );
	    }
	  }
	
	  function removeRange(index, rlen){
	    for(var j = 0; j< rlen; j++){ //removed
	      var removed = group.children.splice( index + 1, 1)[0];
	      if(removed) removed.destroy(true);
	    }
	  }
	
	  function addRange(index, end, newList, rawNewValue){
	    for(var o = index; o < end; o++){ //add
	      // prototype inherit
	      var item = newList[o];
	      var data = {};
	      updateTarget(data, o, item, rawNewValue);
	
	      data = _.createObject(extra, data);
	      var curOptions = {
	        extra: data,
	        namespace:namespace,
	        record: true,
	        outer: options.outer,
	        cursor: cursor
	      }
	      var section = self.$compile(ast.body, curOptions);
	      section.data = data;
	      // autolink
	      var insert =  combine.last(group.get(o));
	      if(insert.parentNode && !(cursor && cursor.node) ){
	        animate.inject(combine.node(section),insert, 'after');
	      }
	      // insert.parentNode.insertBefore(combine.node(section), insert.nextSibling);
	      group.children.splice( o + 1 , 0, section);
	    }
	  }
	
	  function updateTarget(target, index, item, rawNewValue){
	
	      target[ indexName ] = index;
	      if( rawNewValue ){
	        target[ keyName ] = item;
	        target[ variable ] = rawNewValue[ item ];
	      }else{
	        target[ variable ] = item;
	        target[keyName] = null
	      }
	  }
	
	
	  function updateRange(start, end, newList, rawNewValue){
	    for(var k = start; k < end; k++){ // no change
	      var sect = group.get( k + 1 ), item = newList[ k ];
	      updateTarget(sect.data, k, item, rawNewValue);
	    }
	  }
	
	  function updateLD(newList, oldList, splices , rawNewValue ){
	
	    var cur = placeholder;
	    var m = 0, len = newList.length;
	
	    if(!splices && (len !==0 || oldList.length !==0)  ){
	      splices = diffArray(newList, oldList, true);
	    }
	
	    if(!splices || !splices.length) return;
	      
	    for(var i = 0; i < splices.length; i++){ //init
	      var splice = splices[i];
	      var index = splice.index; // beacuse we use a comment for placeholder
	      var removed = splice.removed;
	      var add = splice.add;
	      var rlen = removed.length;
	      // for track
	      if( track && rlen && add ){
	        var minar = Math.min(rlen, add);
	        var tIndex = 0;
	        while(tIndex < minar){
	          if( keyOf(newList[index], index) !== keyOf( removed[0], index ) ){
	            removeRange(index, 1)
	            addRange(index, index+1, newList, rawNewValue)
	          }
	          removed.shift();
	          add--;
	          index++;
	          tIndex++;
	        }
	        rlen = removed.length;
	      }
	      // update
	      updateRange(m, index, newList, rawNewValue);
	
	      removeRange( index ,rlen)
	
	      addRange(index, index+add, newList, rawNewValue)
	
	      m = index + add - rlen;
	      m  = m < 0? 0 : m;
	
	    }
	    if(m < len){
	      for(var i = m; i < len; i++){
	        var pair = group.get(i + 1);
	        pair.data[indexName] = i;
	        // @TODO fix keys
	      }
	    }
	  }
	
	  // if the track is constant test.
	  function updateSimple(newList, oldList, rawNewValue ){
	
	    var nlen = newList.length;
	    var olen = oldList.length;
	    var mlen = Math.min(nlen, olen);
	
	    updateRange(0, mlen, newList, rawNewValue)
	    if(nlen < olen){ //need add
	      removeRange(nlen, olen-nlen);
	    }else if(nlen > olen){
	      addRange(olen, nlen, newList, rawNewValue);
	    }
	  }
	
	  function update(newValue, oldValue, splices){
	
	    var nType = _.typeOf( newValue );
	    var oType = _.typeOf( oldValue );
	
	    var newList = getListFromValue( newValue, nType );
	    var oldList = getListFromValue( oldValue, oType );
	
	    var rawNewValue;
	
	
	    var nlen = newList && newList.length;
	    var olen = oldList && oldList.length;
	
	    // if previous list has , we need to remove the altnated section.
	    if( !olen && nlen && group.get(1) ){
	      var altGroup = group.children.pop();
	      if(altGroup.destroy)  altGroup.destroy(true);
	    }
	
	    if( nType === 'object' ) rawNewValue = newValue;
	
	    if(track === true){
	      updateSimple( newList, oldList,  rawNewValue );
	    }else{
	      updateLD( newList, oldList, splices, rawNewValue );
	    }
	
	    // @ {#list} {#else}
	    if( !nlen && alternate && alternate.length){
	      var section = self.$compile(alternate, {
	        extra: extra,
	        record: true,
	        outer: options.outer,
	        namespace: namespace
	      })
	      group.children.push(section);
	      if(placeholder.parentNode){
	        animate.inject(combine.node(section), placeholder, 'after');
	      }
	    }
	  }
	
	  this.$watch(ast.sequence, update, { 
	    init: true, 
	    diff: track !== true ,
	    deep: true
	  });
	  //@FIXIT, beacuse it is sync process, we can 
	  cursor = null;
	  return group;
	}
	
	
	
	
	// {#include } or {#inc template}
	walkers.template = function(ast, options){
	  var content = ast.content, compiled;
	  var placeholder = document.createComment('inlcude');
	  var compiled, namespace = options.namespace, extra = options.extra;
	  var group = new Group([placeholder]);
	  var cursor = options.cursor;
	
	  if(content){
	    var self = this;
	    this.$watch(content, function(value){
	      var removed = group.get(1), type= typeof value;
	      if( removed){
	        removed.destroy(true); 
	        group.children.pop();
	      }
	      if(!value) return;
	
	      group.push( compiled = type === 'function' ? value(cursor? {cursor: cursor}: null): self.$compile( type !== 'object'? String(value): value, {
	        record: true,
	        outer: options.outer,
	        namespace: namespace,
	        cursor: cursor,
	        extra: extra}) ); 
	      if(placeholder.parentNode) {
	        compiled.$inject(placeholder, 'before')
	      }
	    }, {
	      init: true
	    });
	  }
	  return group;
	};
	
	function getListFromValue(value, type){
	  return type === 'object'? _.keys(value): (
	      type === 'array'? value: []
	    )
	}
	
	
	// how to resolve this problem
	var ii = 0;
	walkers['if'] = function(ast, options){
	  var self = this, consequent, alternate, extra = options.extra;
	  if(options && options.element){ // attribute inteplation
	    var update = function(nvalue){
	      if(!!nvalue){
	        if(alternate) combine.destroy(alternate)
	        if(ast.consequent) consequent = self.$compile(ast.consequent, {
	          record: true, 
	          element: options.element , 
	          extra:extra
	        });
	      }else{
	        if( consequent ) combine.destroy(consequent)
	        if( ast.alternate ) alternate = self.$compile(ast.alternate, {record: true, element: options.element, extra: extra});
	      }
	    }
	    this.$watch(ast.test, update, { force: true });
	    return {
	      destroy: function(){
	        if(consequent) combine.destroy(consequent);
	        else if(alternate) combine.destroy(alternate);
	      }
	    }
	  }
	
	  var test, node;
	  var placeholder = document.createComment("Regular if" + ii++);
	  var group = new Group();
	  group.push(placeholder);
	  var preValue = null, namespace= options.namespace;
	  var cursor = options.cursor;
	  if(cursor && cursor.node){
	    dom.inject( placeholder , cursor.node,'before')
	  }
	
	
	  var update = function (nvalue, old){
	    var value = !!nvalue, compiledSection;
	    if(value === preValue) return;
	    preValue = value;
	    if(group.children[1]){
	      group.children[1].destroy(true);
	      group.children.pop();
	    }
	    var curOptions = {
	      record: true, 
	      outer: options.outer,
	      namespace: namespace, 
	      extra: extra,
	      cursor: cursor
	    }
	    if(value){ //true
	
	      if(ast.consequent && ast.consequent.length){ 
	        compiledSection = self.$compile( ast.consequent , curOptions );
	      }
	    }else{ //false
	      if(ast.alternate && ast.alternate.length){
	        compiledSection = self.$compile(ast.alternate, curOptions);
	      }
	    }
	    // placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
	    if(compiledSection){
	      group.push(compiledSection);
	      if(placeholder.parentNode){
	        animate.inject(combine.node(compiledSection), placeholder, 'before');
	      }
	    }
	    cursor = null;
	    // after first mount , we need clear this flat;
	  }
	  this.$watch(ast.test, update, {force: true, init: true});
	
	  return group;
	}
	
	
	walkers._handleMountText = function(cursor, astText){
	    var node, mountNode = cursor.node;
	    // fix unused black in astText;
	    var nodeText = dom.text(mountNode);
	
	    if( nodeText === astText ){
	      node = mountNode;
	      cursor.next();
	    }else{
	      // maybe have some redundancy  blank
	      var index = nodeText.indexOf(astText);
	      if(~index){
	        node = document.createTextNode(astText);
	        dom.text( mountNode, nodeText.slice(index + astText.length) );
	      } else {
	        // if( _.blankReg.test( astText ) ){ }
	        throw Error( MSG[ERROR.UNMATCHED_AST]);
	      }
	    }
	
	    return node;
	}
	
	
	walkers.expression = function(ast, options){
	
	  var cursor = options.cursor, node,
	    mountNode = cursor && cursor.node;
	
	  if(mountNode){
	    //@BUG: if server render &gt; in Expression will cause error
	    var astText = _.toText( this.$get(ast) );
	
	    node = walkers._handleMountText(cursor, astText);
	
	  }else{
	    node = document.createTextNode("");
	  }
	
	  this.$watch(ast, function(newval){
	
	    dom.text(node, _.toText(newval) );
	
	  },{ init: true })
	
	  return node;
	
	}
	
	
	walkers.text = function(ast, options){
	  var cursor = options.cursor , node;
	  var astText = _.convertEntity( ast.text );
	
	  if(cursor && cursor.node) { 
	    var mountNode = cursor.node;
	    // maybe regularjs parser have some difference with html builtin parser when process  empty text
	    // @todo error report
	    if(mountNode.nodeType !== 3 ){
	
	      if( _.blankReg.test(astText) ) return {
	        code:  ERROR.UNMATCHED_AST
	      }
	
	    }else{
	      node = walkers._handleMountText( cursor, astText )
	    } 
	  }
	      
	
	  return node || document.createTextNode( astText );
	}
	
	
	
	
	/**
	 * walkers element (contains component)
	 */
	walkers.element = function(ast, options){
	
	  var attrs = ast.attrs, self = this,
	    Constructor = this.constructor,
	    children = ast.children,
	    namespace = options.namespace, 
	    extra = options.extra,
	    cursor = options.cursor,
	    tag = ast.tag,
	    Component = Constructor.component(tag),
	    ref, group, element, mountNode;
	
	  // if inititalized with mount mode, sometime, 
	  // browser will ignore the whitespace between node, and sometimes it won't
	  if(cursor){
	    // textCOntent with Empty text
	    if(cursor.node && cursor.node.nodeType === 3){
	      if(_.blankReg.test(dom.text(cursor.node) ) ) cursor.next();
	      else throw Error(MSG[ERROR.UNMATCHED_AST]);
	    }
	  }
	
	  if(cursor) mountNode = cursor.node;
	
	  if( tag === 'r-content' ){
	    _.log('r-content is deprecated, use {#inc this.$body} instead (`{#include}` as same)', 'warn');
	    return this.$body && this.$body(cursor? {cursor: cursor}: null);
	  } 
	
	  if(Component || tag === 'r-component'){
	    options.Component = Component;
	    return walkers.component.call(this, ast, options)
	  }
	
	  if(tag === 'svg') namespace = "svg";
	  // @Deprecated: may be removed in next version, use {#inc } instead
	  
	  if( children && children.length ){
	
	    var subMountNode = mountNode? mountNode.firstChild: null;
	    group = this.$compile(children, {
	      extra: extra ,
	      outer: options.outer,
	      namespace: namespace, 
	      cursor:  subMountNode? nodeCursor(subMountNode): null
	    });
	  }
	
	
	  if(mountNode){
	    element = mountNode
	    cursor.next();
	  }else{
	    element = dom.create( tag, namespace, attrs);
	  }
	  
	
	  if(group && !_.isVoidTag(tag) ){ // if not init with mount mode
	    animate.inject( combine.node(group) , element)
	  }
	
	  // sort before
	  if(!ast.touched){
	    attrs.sort(function(a1, a2){
	      var d1 = Constructor.directive(a1.name),
	        d2 = Constructor.directive(a2.name);
	      if( d1 && d2 ) return (d2.priority || 1) - (d1.priority || 1);
	      if(d1) return 1;
	      if(d2) return -1;
	      if(a2.name === "type") return 1;
	      return -1;
	    })
	    ast.touched = true;
	  }
	  // may distinct with if else
	  var destroies = walkAttributes.call(this, attrs, element, extra);
	
	  return {
	    type: "element",
	    group: group,
	    node: function(){
	      return element;
	    },
	    last: function(){
	      return element;
	    },
	    destroy: function(first){
	      if( first ){
	        animate.remove( element, group? group.destroy.bind( group ): _.noop );
	      }else if(group) {
	        group.destroy();
	      }
	      // destroy ref
	      if( destroies.length ) {
	        destroies.forEach(function( destroy ){
	          if( destroy ){
	            if( typeof destroy.destroy === 'function' ){
	              destroy.destroy()
	            }else{
	              destroy();
	            }
	          }
	        })
	      }
	    }
	  }
	}
	
	walkers.component = function(ast, options){
	  var attrs = ast.attrs, 
	    Component = options.Component,
	    cursor = options.cursor,
	    Constructor = this.constructor,
	    isolate, 
	    extra = options.extra,
	    namespace = options.namespace,
	    ref, self = this, is;
	
	  var data = {}, events;
	
	  for(var i = 0, len = attrs.length; i < len; i++){
	    var attr = attrs[i];
	    // consider disabled   equlasto  disabled={true}
	    var value = this._touchExpr(attr.value === undefined? true: attr.value);
	    if(value.constant) value = attr.value = value.get(this);
	    if(attr.value && attr.value.constant === true){
	      value = value.get(this);
	    }
	    var name = attr.name;
	    if(!attr.event){
	      var etest = name.match(_.eventReg);
	      // event: 'nav'
	      if(etest) attr.event = etest[1];
	    }
	
	    // @compile modifier
	    if(attr.mdf === 'cmpl'){
	      value = _.getCompileFn(value, this, {
	        record: true, 
	        namespace:namespace, 
	        extra: extra, 
	        outer: options.outer
	      })
	    }
	    
	    // @if is r-component . we need to find the target Component
	    if(name === 'is' && !Component){
	      is = value;
	      var componentName = this.$get(value, true);
	      Component = Constructor.component(componentName)
	      if(typeof Component !== 'function') throw new Error("component " + componentName + " has not registed!");
	    }
	    // bind event proxy
	    var eventName;
	    if(eventName = attr.event){
	      events = events || {};
	      events[eventName] = _.handleEvent.call(this, value, eventName);
	      continue;
	    }else {
	      name = attr.name = _.camelCase(name);
	    }
	
	    if(value.type !== 'expression'){
	      data[name] = value;
	    }else{
	      data[name] = value.get(self); 
	    }
	    if( name === 'ref'  && value != null){
	      ref = value
	    }
	    if( name === 'isolate'){
	      // 1: stop: composite -> parent
	      // 2. stop: composite <- parent
	      // 3. stop 1 and 2: composite <-> parent
	      // 0. stop nothing (defualt)
	      isolate = value.type === 'expression'? value.get(self): parseInt(value === true? 3: value, 10);
	      data.isolate = isolate;
	    }
	  }
	
	  var definition = { 
	    data: data, 
	    events: events, 
	    $parent: (isolate & 2)? null: this,
	    $root: this.$root,
	    $outer: options.outer,
	    _body: {
	      ctx: this,
	      ast: ast.children
	    }
	  }
	  var options = {
	    namespace: namespace, 
	    cursor: cursor,
	    extra: options.extra
	  }
	
	
	  var component = new Component(definition, options), reflink;
	
	
	  if(ref && this.$refs){
	    reflink = Component.directive('ref').link
	    this.$on('$destroy', reflink.call(this, component, ref) )
	  }
	  if(ref &&  self.$refs) self.$refs[ref] = component;
	  for(var i = 0, len = attrs.length; i < len; i++){
	    var attr = attrs[i];
	    var value = attr.value||true;
	    var name = attr.name;
	    // need compiled
	    if(value.type === 'expression' && !attr.event){
	      value = self._touchExpr(value);
	      // use bit operate to control scope
	      if( !(isolate & 2) ) 
	        this.$watch(value, (function(name, val){
	          this.data[name] = val;
	        }).bind(component, name))
	      if( value.set && !(isolate & 1 ) ) 
	        // sync the data. it force the component don't trigger attr.name's first dirty echeck
	        component.$watch(name, self.$update.bind(self, value), {sync: true});
	    }
	  }
	  if(is && is.type === 'expression'  ){
	    var group = new Group();
	    group.push(component);
	    this.$watch(is, function(value){
	      // found the new component
	      var Component = Constructor.component(value);
	      if(!Component) throw new Error("component " + value + " has not registed!");
	      var ncomponent = new Component(definition);
	      var component = group.children.pop();
	      group.push(ncomponent);
	      ncomponent.$inject(combine.last(component), 'after')
	      component.destroy();
	      // @TODO  if component changed , we need update ref
	      if(ref){
	        self.$refs[ref] = ncomponent;
	      }
	    }, {sync: true})
	    return group;
	  }
	  return component;
	}
	
	function walkAttributes(attrs, element, extra){
	  var bindings = []
	  for(var i = 0, len = attrs.length; i < len; i++){
	    var binding = this._walk(attrs[i], {element: element, fromElement: true, attrs: attrs, extra: extra})
	    if(binding) bindings.push(binding);
	  }
	  return bindings;
	}
	
	
	walkers.attribute = function(ast ,options){
	
	  var attr = ast;
	  var Component = this.constructor;
	  var name = attr.name;
	  var directive = Component.directive(name);
	
	  prepareAttr(ast, directive);
	
	  var value = attr.value || "";
	  var constant = value.constant;
	  var element = options.element;
	  var self = this;
	
	
	
	  value = this._touchExpr(value);
	
	  if(constant) value = value.get(this);
	
	  if(directive && directive.link){
	    var binding = directive.link.call(self, element, value, name, options.attrs);
	    if(typeof binding === 'function') binding = {destroy: binding}; 
	    return binding;
	  } else{
	    if(value.type === 'expression' ){
	      this.$watch(value, function(nvalue, old){
	        dom.attr(element, name, nvalue);
	      }, {init: true});
	    }else{
	      if(_.isBooleanAttr(name)){
	        dom.attr(element, name, true);
	      }else{
	        dom.attr(element, name, value);
	      }
	    }
	    if(!options.fromElement){
	      return {
	        destroy: function(){
	          dom.attr(element, name, null);
	        }
	      }
	    }
	  }
	
	}
	
	function prepareAttr( ast ,directive){
	  if(ast.parsed ) return ast;
	  var value = ast.value;
	  var name=  ast.name, body, constant;
	  if(typeof value === 'string' && ~value.indexOf(config.BEGIN) && ~value.indexOf(config.END) ){
	    if( !directive || !directive.nps ) {
	      var parsed = new Parser(value, { mode: 2 }).parse();
	      if(parsed.length === 1 && parsed[0].type === 'expression'){ 
	        body = parsed[0];
	      } else{
	        constant = true;
	        body = [];
	        parsed.forEach(function(item){
	          if(!item.constant) constant=false;
	          // silent the mutiple inteplation
	            body.push(item.body || "'" + item.text.replace(/'/g, "\\'") + "'");        
	        });
	        body = node.expression("[" + body.join(",") + "].join('')", null, constant);
	      }
	      ast.value = body;
	    }
	  }
	  ast.parsed = true;
	  return ast;
	}
	
	
	


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(18);
	var combine = __webpack_require__(20)
	
	function Group(list){
	  this.children = list || [];
	}
	
	
	var o = _.extend(Group.prototype, {
	  destroy: function(first){
	    combine.destroy(this.children, first);
	    if(this.ondestroy) this.ondestroy();
	    this.children = null;
	  },
	  get: function(i){
	    return this.children[i]
	  },
	  push: function(item){
	    this.children.push( item );
	  }
	})
	o.inject = o.$inject = combine.inject
	
	
	
	module.exports = Group;
	
	


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(18);
	var parseExpression = __webpack_require__(21).expression;
	var diff = __webpack_require__(24);
	var diffArray = diff.diffArray;
	var diffObject = diff.diffObject;
	
	function Watcher(){}
	
	var methods = {
	  $watch: function(expr, fn, options){
	    var get, once, test, rlen, extra = this.__ext__; //records length
	    if(!this._watchers) this._watchers = [];
	
	    options = options || {};
	    if(options === true){
	       options = { deep: true }
	    }
	    var uid = _.uid('w_');
	    if(Array.isArray(expr)){
	      var tests = [];
	      for(var i = 0,len = expr.length; i < len; i++){
	          tests.push(this.$expression(expr[i]).get)
	      }
	      var prev = [];
	      test = function(context){
	        var equal = true;
	        for(var i =0, len = tests.length; i < len; i++){
	          var splice = tests[i](context, extra);
	          if(!_.equals(splice, prev[i])){
	             equal = false;
	             prev[i] = _.clone(splice);
	          }
	        }
	        return equal? false: prev;
	      }
	    }else{
	      if(typeof expr === 'function'){
	        get = expr.bind(this);      
	      }else{
	        expr = this._touchExpr( parseExpression(expr) );
	        get = expr.get;
	        once = expr.once;
	      }
	    }
	
	    var watcher = {
	      id: uid, 
	      get: get, 
	      fn: fn, 
	      once: once, 
	      force: options.force,
	      // don't use ld to resolve array diff
	      diff: options.diff,
	      test: test,
	      deep: options.deep,
	      last: options.sync? get(this): options.last
	    }
	    
	    this._watchers.push( watcher );
	
	    rlen = this._records && this._records.length;
	    if(rlen) this._records[rlen-1].push(uid)
	    // init state.
	    if(options.init === true){
	      var prephase = this.$phase;
	      this.$phase = 'digest';
	      this._checkSingleWatch( watcher, this._watchers.length-1 );
	      this.$phase = prephase;
	    }
	    return watcher;
	  },
	  $unwatch: function(uid){
	    uid = uid.uid || uid;
	    if(!this._watchers) this._watchers = [];
	    if(Array.isArray(uid)){
	      for(var i =0, len = uid.length; i < len; i++){
	        this.$unwatch(uid[i]);
	      }
	    }else{
	      var watchers = this._watchers, watcher, wlen;
	      if(!uid || !watchers || !(wlen = watchers.length)) return;
	      for(;wlen--;){
	        watcher = watchers[wlen];
	        if(watcher && watcher.id === uid ){
	          watchers.splice(wlen, 1);
	        }
	      }
	    }
	  },
	  $expression: function(value){
	    return this._touchExpr(parseExpression(value))
	  },
	  /**
	   * the whole digest loop ,just like angular, it just a dirty-check loop;
	   * @param  {String} path  now regular process a pure dirty-check loop, but in parse phase, 
	   *                  Regular's parser extract the dependencies, in future maybe it will change to dirty-check combine with path-aware update;
	   * @return {Void}   
	   */
	
	  $digest: function(){
	    if(this.$phase === 'digest' || this._mute) return;
	    this.$phase = 'digest';
	    var dirty = false, n =0;
	    while(dirty = this._digest()){
	
	      if((++n) > 20){ // max loop
	        throw Error('there may a circular dependencies reaches')
	      }
	    }
	    if( n > 0 && this.$emit) this.$emit("$update");
	    this.$phase = null;
	  },
	  // private digest logic
	  _digest: function(){
	
	    var watchers = this._watchers;
	    var dirty = false, children, watcher, watcherDirty;
	    if(watchers && watchers.length){
	      for(var i = 0, len = watchers.length;i < len; i++){
	        watcher = watchers[i];
	        watcherDirty = this._checkSingleWatch(watcher, i);
	        if(watcherDirty) dirty = true;
	      }
	    }
	    // check children's dirty.
	    children = this._children;
	    if(children && children.length){
	      for(var m = 0, mlen = children.length; m < mlen; m++){
	        var child = children[m];
	        
	        if(child && child._digest()) dirty = true;
	      }
	    }
	    return dirty;
	  },
	  // check a single one watcher 
	  _checkSingleWatch: function(watcher, i){
	    var dirty = false;
	    if(!watcher) return;
	
	    var now, last, tlast, tnow,  eq, diff;
	
	    if(!watcher.test){
	
	      now = watcher.get(this);
	      last = watcher.last;
	      tlast = _.typeOf(last);
	      tnow = _.typeOf(now);
	      eq = true, diff;
	
	      // !Object
	      if( !(tnow === 'object' && tlast==='object' && watcher.deep) ){
	        // Array
	        if( tnow === 'array' && ( tlast=='undefined' || tlast === 'array') ){
	          diff = diffArray(now, watcher.last || [], watcher.diff)
	          if( tlast !== 'array' || diff === true || diff.length ) dirty = true;
	        }else{
	          eq = _.equals( now, last );
	          if( !eq || watcher.force ){
	            watcher.force = null;
	            dirty = true; 
	          }
	        }
	      }else{
	        diff =  diffObject( now, last, watcher.diff );
	        if( diff === true || diff.length ) dirty = true;
	      }
	    } else{
	      // @TODO 是否把多重改掉
	      var result = watcher.test(this);
	      if(result){
	        dirty = true;
	        watcher.fn.apply(this, result)
	      }
	    }
	    if(dirty && !watcher.test){
	      if(tnow === 'object' && watcher.deep || tnow === 'array'){
	        watcher.last = _.clone(now);
	      }else{
	        watcher.last = now;
	      }
	      watcher.fn.call(this, now, last, diff)
	      if(watcher.once) this._watchers.splice(i, 1);
	    }
	
	    return dirty;
	  },
	
	  /**
	   * **tips**: whatever param you passed in $update, after the function called, dirty-check(digest) phase will enter;
	   * 
	   * @param  {Function|String|Expression} path  
	   * @param  {Whatever} value optional, when path is Function, the value is ignored
	   * @return {this}     this 
	   */
	  $set: function(path, value){
	    if(path != null){
	      var type = _.typeOf(path);
	      if( type === 'string' || path.type === 'expression' ){
	        path = this.$expression(path);
	        path.set(this, value);
	      }else if(type === 'function'){
	        path.call(this, this.data);
	      }else{
	        for(var i in path) {
	          this.$set(i, path[i])
	        }
	      }
	    }
	  },
	  // 1. expr canbe string or a Expression
	  // 2. detect: if true, if expr is a string will directly return;
	  $get: function(expr, detect)  {
	    if(detect && typeof expr === 'string') return expr;
	    return this.$expression(expr).get(this);
	  },
	  $update: function(){
	    var rootParent = this;
	    do{
	      if(rootParent.data.isolate || !rootParent.$parent) break;
	      rootParent = rootParent.$parent;
	    } while(rootParent)
	
	    var prephase =rootParent.$phase;
	    rootParent.$phase = 'digest'
	
	    this.$set.apply(this, arguments);
	
	    rootParent.$phase = prephase
	
	    rootParent.$digest();
	    return this;
	  },
	  // auto collect watchers for logic-control.
	  _record: function(){
	    if(!this._records) this._records = [];
	    this._records.push([]);
	  },
	  _release: function(){
	    return this._records.pop();
	  }
	}
	
	
	_.extend(Watcher.prototype, methods)
	
	
	Watcher.mixTo = function(obj){
	  obj = typeof obj === "function" ? obj.prototype : obj;
	  return _.extend(obj, methods)
	}
	
	module.exports = Watcher;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	
	var f = module.exports = {};
	
	// json:  two way 
	//  - get: JSON.stringify
	//  - set: JSON.parse
	//  - example: `{ title|json }`
	f.json = {
	  get: function( value ){
	    return typeof JSON !== 'undefined'? JSON.stringify(value): value;
	  },
	  set: function( value ){
	    return typeof JSON !== 'undefined'? JSON.parse(value) : value;
	  }
	}
	
	// last: one-way
	//  - get: return the last item in list
	//  - example: `{ list|last }`
	f.last = function(arr){
	  return arr && arr[arr.length - 1];
	}
	
	// average: one-way
	//  - get: copute the average of the list
	//  - example: `{ list| average: "score" }`
	f.average = function(array, key){
	  array = array || [];
	  return array.length? f.total(array, key)/ array.length : 0;
	}
	
	
	// total: one-way
	//  - get: copute the total of the list
	//  - example: `{ list| total: "score" }`
	f.total = function(array, key){
	  var total = 0;
	  if(!array) return;
	  array.forEach(function( item ){
	    total += key? item[key] : item;
	  })
	  return total;
	}
	
	// var basicSortFn = function(a, b){return b - a}
	
	// f.sort = function(array, key, reverse){
	//   var type = typeof key, sortFn; 
	//   switch(type){
	//     case 'function': sortFn = key; break;
	//     case 'string': sortFn = function(a, b){};break;
	//     default:
	//       sortFn = basicSortFn;
	//   }
	//   // need other refernce.
	//   return array.slice().sort(function(a,b){
	//     return reverse? -sortFn(a, b): sortFn(a, b);
	//   })
	//   return array
	// }
	
	


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  'COMPONENT_TYPE': 1,
	  'ELEMENT_TYPE': 2,
	  'ERROR': {
	    'UNMATCHED_AST': 101
	  },
	  "MSG": {
	    101: "Unmatched ast and mountNode, report issue at https://github.com/regularjs/regular/issues"
	  }
	}


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * event directive  bundle
	 *
	 */
	var _ = __webpack_require__(18);
	var dom = __webpack_require__(17);
	var Regular = __webpack_require__(30);
	
	Regular._addProtoInheritCache("event");
	
	Regular.directive( /^on-\w+$/, function( elem, value, name , attrs) {
	  if ( !name || !value ) return;
	  var type = name.split("-")[1];
	  return this._handleEvent( elem, type, value, attrs );
	});
	// TODO.
	/**
	- $('dx').delegate()
	*/
	Regular.directive( /^(delegate|de)-\w+$/, function( elem, value, name ) {
	  var root = this.$root;
	  var _delegates = root._delegates || ( root._delegates = {} );
	  if ( !name || !value ) return;
	  var type = name.split("-")[1];
	  var fire = _.handleEvent.call(this, value, type);
	
	  function delegateEvent(ev){
	    matchParent(ev, _delegates[type], root.parentNode);
	  }
	
	  if( !_delegates[type] ){
	    _delegates[type] = [];
	
	    if(root.parentNode){
	      dom.on(root.parentNode, type, delegateEvent);
	    }else{
	      root.$on( "$inject", function( node, position, preParent ){
	        var newParent = this.parentNode;
	        if( preParent ){
	          dom.off(preParent, type, delegateEvent);
	        }
	        if(newParent) dom.on(this.parentNode, type, delegateEvent);
	      })
	    }
	    root.$on("$destroy", function(){
	      if(root.parentNode) dom.off(root.parentNode, type, delegateEvent)
	      _delegates[type] = null;
	    })
	  }
	  var delegate = {
	    element: elem,
	    fire: fire
	  }
	  _delegates[type].push( delegate );
	
	  return function(){
	    var delegates = _delegates[type];
	    if(!delegates || !delegates.length) return;
	    for( var i = 0, len = delegates.length; i < len; i++ ){
	      if( delegates[i] === delegate ) delegates.splice(i, 1);
	    }
	  }
	
	});
	
	
	function matchParent(ev , delegates, stop){
	  if(!stop) return;
	  var target = ev.target, pair;
	  while(target && target !== stop){
	    for( var i = 0, len = delegates.length; i < len; i++ ){
	      pair = delegates[i];
	      if(pair && pair.element === target){
	        pair.fire(ev)
	      }
	    }
	    target = target.parentNode;
	  }
	}

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// Regular
	var _ = __webpack_require__(18);
	var dom = __webpack_require__(17);
	var Regular = __webpack_require__(30);
	
	var modelHandlers = {
	  "text": initText,
	  "select": initSelect,
	  "checkbox": initCheckBox,
	  "radio": initRadio
	}
	
	
	// @TODO
	
	
	// two-way binding with r-model
	// works on input, textarea, checkbox, radio, select
	
	Regular.directive("r-model", {
	  link: function(elem, value){
	    var tag = elem.tagName.toLowerCase();
	    var sign = tag;
	    if(sign === "input") sign = elem.type || "text";
	    else if(sign === "textarea") sign = "text";
	    if(typeof value === "string") value = this.$expression(value);
	
	    if( modelHandlers[sign] ) return modelHandlers[sign].call(this, elem, value);
	    else if(tag === "input"){
	      return modelHandlers.text.call(this, elem, value);
	    }
	  }
	  //@TODO
	  // ssr: function(name, value){
	  //   return value? "value=" + value: ""
	  // }
	});
	
	
	
	
	
	// binding <select>
	
	function initSelect( elem, parsed){
	  var self = this;
	  var wc =this.$watch(parsed, function(newValue){
	    var children = _.slice(elem.getElementsByTagName('option'))
	    children.forEach(function(node, index){
	      if(node.value == newValue){
	        elem.selectedIndex = index;
	      }
	    })
	  });
	
	  function handler(){
	    parsed.set(self, this.value);
	    wc.last = this.value;
	    self.$update();
	  }
	
	  dom.on(elem, "change", handler);
	  
	  if(parsed.get(self) === undefined && elem.value){
	     parsed.set(self, elem.value);
	  }
	  return function destroy(){
	    dom.off(elem, "change", handler);
	  }
	}
	
	// input,textarea binding
	
	function initText(elem, parsed){
	  var self = this;
	  var wc = this.$watch(parsed, function(newValue){
	    if(elem.value !== newValue) elem.value = newValue == null? "": "" + newValue;
	  });
	
	  // @TODO to fixed event
	  var handler = function (ev){
	    var that = this;
	    if(ev.type==='cut' || ev.type==='paste'){
	      _.nextTick(function(){
	        var value = that.value
	        parsed.set(self, value);
	        wc.last = value;
	        self.$update();
	      })
	    }else{
	        var value = that.value
	        parsed.set(self, value);
	        wc.last = value;
	        self.$update();
	    }
	  };
	
	  if(dom.msie !== 9 && "oninput" in dom.tNode ){
	    elem.addEventListener("input", handler );
	  }else{
	    dom.on(elem, "paste", handler)
	    dom.on(elem, "keyup", handler)
	    dom.on(elem, "cut", handler)
	    dom.on(elem, "change", handler)
	  }
	  if(parsed.get(self) === undefined && elem.value){
	     parsed.set(self, elem.value);
	  }
	  return function (){
	    if(dom.msie !== 9 && "oninput" in dom.tNode ){
	      elem.removeEventListener("input", handler );
	    }else{
	      dom.off(elem, "paste", handler)
	      dom.off(elem, "keyup", handler)
	      dom.off(elem, "cut", handler)
	      dom.off(elem, "change", handler)
	    }
	  }
	}
	
	
	// input:checkbox  binding
	
	function initCheckBox(elem, parsed){
	  var self = this;
	  var watcher = this.$watch(parsed, function(newValue){
	    dom.attr(elem, 'checked', !!newValue);
	  });
	
	  var handler = function handler(){
	    var value = this.checked;
	    parsed.set(self, value);
	    watcher.last = value;
	    self.$update();
	  }
	  if(parsed.set) dom.on(elem, "change", handler)
	
	  if(parsed.get(self) === undefined){
	    parsed.set(self, !!elem.checked);
	  }
	
	  return function destroy(){
	    if(parsed.set) dom.off(elem, "change", handler)
	  }
	}
	
	
	// input:radio binding
	
	function initRadio(elem, parsed){
	  var self = this;
	  var wc = this.$watch(parsed, function( newValue ){
	    if(newValue == elem.value) elem.checked = true;
	    else elem.checked = false;
	  });
	
	
	  var handler = function handler(){
	    var value = this.value;
	    parsed.set(self, value);
	    self.$update();
	  }
	  if(parsed.set) dom.on(elem, "change", handler)
	  // beacuse only after compile(init), the dom structrue is exsit. 
	  if(parsed.get(self) === undefined){
	    if(elem.checked) {
	      parsed.set(self, elem.value);
	    }
	  }
	
	  return function destroy(){
	    if(parsed.set) dom.off(elem, "change", handler)
	  }
	}


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  element: function(name, attrs, children){
	    return {
	      type: 'element',
	      tag: name,
	      attrs: attrs,
	      children: children
	    }
	  },
	  attribute: function(name, value, mdf){
	    return {
	      type: 'attribute',
	      name: name,
	      value: value,
	      mdf: mdf
	    }
	  },
	  "if": function(test, consequent, alternate){
	    return {
	      type: 'if',
	      test: test,
	      consequent: consequent,
	      alternate: alternate
	    }
	  },
	  list: function(sequence, variable, body, alternate, track){
	    return {
	      type: 'list',
	      sequence: sequence,
	      alternate: alternate,
	      variable: variable,
	      body: body,
	      track: track
	    }
	  },
	  expression: function( body, setbody, constant ){
	    return {
	      type: "expression",
	      body: body,
	      constant: constant || false,
	      setbody: setbody || false
	    }
	  },
	  text: function(text){
	    return {
	      type: "text",
	      text: text
	    }
	  },
	  template: function(template){
	    return {
	      type: 'template',
	      content: template
	    }
	  }
	}


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	
	var base64 = __webpack_require__(51)
	var ieee754 = __webpack_require__(50)
	var isArray = __webpack_require__(49)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = Buffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation
	
	var kMaxLength = 0x3fffffff
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Note:
	 *
	 * - Implementation must support adding new properties to `Uint8Array` instances.
	 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
	 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *    incorrect length in some situations.
	 *
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
	 * get the Object implementation, which is slower but will work correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = (function () {
	  try {
	    var buf = new ArrayBuffer(0)
	    var arr = new Uint8Array(buf)
	    arr.foo = function () { return 42 }
	    return 42 === arr.foo() && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	})()
	
	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (subject, encoding, noZero) {
	  if (!(this instanceof Buffer))
	    return new Buffer(subject, encoding, noZero)
	
	  var type = typeof subject
	
	  // Find the length
	  var length
	  if (type === 'number')
	    length = subject > 0 ? subject >>> 0 : 0
	  else if (type === 'string') {
	    if (encoding === 'base64')
	      subject = base64clean(subject)
	    length = Buffer.byteLength(subject, encoding)
	  } else if (type === 'object' && subject !== null) { // assume object is array-like
	    if (subject.type === 'Buffer' && isArray(subject.data))
	      subject = subject.data
	    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
	  } else
	    throw new TypeError('must start with number, buffer, array or string')
	
	  if (this.length > kMaxLength)
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	      'size: 0x' + kMaxLength.toString(16) + ' bytes')
	
	  var buf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Preferred: Return an augmented `Uint8Array` instance for best performance
	    buf = Buffer._augment(new Uint8Array(length))
	  } else {
	    // Fallback: Return THIS instance of Buffer (created by `new`)
	    buf = this
	    buf.length = length
	    buf._isBuffer = true
	  }
	
	  var i
	  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
	    // Speed optimization -- use set if we're copying from a typed array
	    buf._set(subject)
	  } else if (isArrayish(subject)) {
	    // Treat array-ish objects as a byte array
	    if (Buffer.isBuffer(subject)) {
	      for (i = 0; i < length; i++)
	        buf[i] = subject.readUInt8(i)
	    } else {
	      for (i = 0; i < length; i++)
	        buf[i] = ((subject[i] % 256) + 256) % 256
	    }
	  } else if (type === 'string') {
	    buf.write(subject, 0, encoding)
	  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
	    for (i = 0; i < length; i++) {
	      buf[i] = 0
	    }
	  }
	
	  return buf
	}
	
	Buffer.isBuffer = function (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
	    throw new TypeError('Arguments must be Buffers')
	
	  var x = a.length
	  var y = b.length
	  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function (list, totalLength) {
	  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')
	
	  if (list.length === 0) {
	    return new Buffer(0)
	  } else if (list.length === 1) {
	    return list[0]
	  }
	
	  var i
	  if (totalLength === undefined) {
	    totalLength = 0
	    for (i = 0; i < list.length; i++) {
	      totalLength += list[i].length
	    }
	  }
	
	  var buf = new Buffer(totalLength)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}
	
	Buffer.byteLength = function (str, encoding) {
	  var ret
	  str = str + ''
	  switch (encoding || 'utf8') {
	    case 'ascii':
	    case 'binary':
	    case 'raw':
	      ret = str.length
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = str.length * 2
	      break
	    case 'hex':
	      ret = str.length >>> 1
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8ToBytes(str).length
	      break
	    case 'base64':
	      ret = base64ToBytes(str).length
	      break
	    default:
	      ret = str.length
	  }
	  return ret
	}
	
	// pre-set for values that may exist in the future
	Buffer.prototype.length = undefined
	Buffer.prototype.parent = undefined
	
	// toString(encoding, start=0, end=buffer.length)
	Buffer.prototype.toString = function (encoding, start, end) {
	  var loweredCase = false
	
	  start = start >>> 0
	  end = end === undefined || end === Infinity ? this.length : end >>> 0
	
	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'binary':
	        return binarySlice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase)
	          throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.equals = function (b) {
	  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max)
	      str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  return Buffer.compare(this, b)
	}
	
	// `get` will be removed in Node 0.13+
	Buffer.prototype.get = function (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}
	
	// `set` will be removed in Node 0.13+
	Buffer.prototype.set = function (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var byte = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(byte)) throw new Error('Invalid hex string')
	    buf[offset + i] = byte
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
	  return charsWritten
	}
	
	function asciiWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
	  return charsWritten
	}
	
	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
	  return charsWritten
	}
	
	function utf16leWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
	  return charsWritten
	}
	
	Buffer.prototype.write = function (string, offset, length, encoding) {
	  // Support both (string, offset, length, encoding)
	  // and the legacy (string, encoding, offset, length)
	  if (isFinite(offset)) {
	    if (!isFinite(length)) {
	      encoding = length
	      length = undefined
	    }
	  } else {  // legacy
	    var swap = encoding
	    encoding = offset
	    offset = length
	    length = swap
	  }
	
	  offset = Number(offset) || 0
	  var remaining = this.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	  encoding = String(encoding || 'utf8').toLowerCase()
	
	  var ret
	  switch (encoding) {
	    case 'hex':
	      ret = hexWrite(this, string, offset, length)
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8Write(this, string, offset, length)
	      break
	    case 'ascii':
	      ret = asciiWrite(this, string, offset, length)
	      break
	    case 'binary':
	      ret = binaryWrite(this, string, offset, length)
	      break
	    case 'base64':
	      ret = base64Write(this, string, offset, length)
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = utf16leWrite(this, string, offset, length)
	      break
	    default:
	      throw new TypeError('Unknown encoding: ' + encoding)
	  }
	  return ret
	}
	
	Buffer.prototype.toJSON = function () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  var res = ''
	  var tmp = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    if (buf[i] <= 0x7F) {
	      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
	      tmp = ''
	    } else {
	      tmp += '%' + buf[i].toString(16)
	    }
	  }
	
	  return res + decodeUtf8Char(tmp)
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function binarySlice (buf, start, end) {
	  return asciiSlice(buf, start, end)
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len;
	    if (start < 0)
	      start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0)
	      end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start)
	    end = start
	
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    return Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    var newBuf = new Buffer(sliceLen, undefined, true)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	    return newBuf
	  }
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0)
	    throw new RangeError('offset is not uint')
	  if (offset + ext > length)
	    throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUInt8 = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	      ((this[offset + 1] << 16) |
	      (this[offset + 2] << 8) |
	      this[offset + 3])
	}
	
	Buffer.prototype.readInt8 = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80))
	    return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16) |
	      (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	      (this[offset + 1] << 16) |
	      (this[offset + 2] << 8) |
	      (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function (offset, noAssert) {
	  if (!noAssert)
	    checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new TypeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new TypeError('index out of range')
	}
	
	Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = value
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else objectWriteUInt16(this, value, offset, true)
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else objectWriteUInt16(this, value, offset, false)
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = value
	  } else objectWriteUInt32(this, value, offset, true)
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else objectWriteUInt32(this, value, offset, false)
	  return offset + 4
	}
	
	Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = value
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else objectWriteUInt16(this, value, offset, true)
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else objectWriteUInt16(this, value, offset, false)
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else objectWriteUInt32(this, value, offset, true)
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert)
	    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else objectWriteUInt32(this, value, offset, false)
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new TypeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new TypeError('index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert)
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert)
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function (target, target_start, start, end) {
	  var source = this
	
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (!target_start) target_start = 0
	
	  // Copy 0 bytes; we're done
	  if (end === start) return
	  if (target.length === 0 || source.length === 0) return
	
	  // Fatal error conditions
	  if (end < start) throw new TypeError('sourceEnd < sourceStart')
	  if (target_start < 0 || target_start >= target.length)
	    throw new TypeError('targetStart out of bounds')
	  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
	  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length)
	    end = this.length
	  if (target.length - target_start < end - start)
	    end = target.length - target_start + start
	
	  var len = end - start
	
	  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < len; i++) {
	      target[i + target_start] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), target_start)
	  }
	}
	
	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length
	
	  if (end < start) throw new TypeError('end < start')
	
	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return
	
	  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')
	
	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var BP = Buffer.prototype
	
	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true
	
	  // save reference to original Uint8Array get/set methods before overwriting
	  arr._get = arr.get
	  arr._set = arr.set
	
	  // deprecated, will be removed in node 0.13+
	  arr.get = BP.get
	  arr.set = BP.set
	
	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer
	
	  return arr
	}
	
	var INVALID_BASE64_RE = /[^+\/0-9A-z]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function isArrayish (subject) {
	  return isArray(subject) || Buffer.isBuffer(subject) ||
	      subject && typeof subject === 'object' &&
	      typeof subject.length === 'number'
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    var b = str.charCodeAt(i)
	    if (b <= 0x7F) {
	      byteArray.push(b)
	    } else {
	      var start = i
	      if (b >= 0xD800 && b <= 0xDFFF) i++
	      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
	      for (var j = 0; j < h.length; j++) {
	        byteArray.push(parseInt(h[j], 16))
	      }
	    }
	  }
	  return byteArray
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(str)
	}
	
	function blitBuffer (src, dst, offset, length, unitSize) {
	  if (unitSize) length -= length % unitSize;
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length))
	      break
	    dst[i + offset] = src[i]
	  }
	  return i
	}
	
	function decodeUtf8Char (str) {
	  try {
	    return decodeURIComponent(str)
	  } catch (err) {
	    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(46).Buffer))

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser
	
	var process = module.exports = {};
	
	process.nextTick = (function () {
	    var canSetImmediate = typeof window !== 'undefined'
	    && window.setImmediate;
	    var canMutationObserver = typeof window !== 'undefined'
	    && window.MutationObserver;
	    var canPost = typeof window !== 'undefined'
	    && window.postMessage && window.addEventListener
	    ;
	
	    if (canSetImmediate) {
	        return function (f) { return window.setImmediate(f) };
	    }
	
	    var queue = [];
	
	    if (canMutationObserver) {
	        var hiddenDiv = document.createElement("div");
	        var observer = new MutationObserver(function () {
	            var queueList = queue.slice();
	            queue.length = 0;
	            queueList.forEach(function (fn) {
	                fn();
	            });
	        });
	
	        observer.observe(hiddenDiv, { attributes: true });
	
	        return function nextTick(fn) {
	            if (!queue.length) {
	                hiddenDiv.setAttribute('yes', 'no');
	            }
	            queue.push(fn);
	        };
	    }
	
	    if (canPost) {
	        window.addEventListener('message', function (ev) {
	            var source = ev.source;
	            if ((source === window || source === null) && ev.data === 'process-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);
	
	        return function nextTick(fn) {
	            queue.push(fn);
	            window.postMessage('process-tick', '*');
	        };
	    }
	
	    return function nextTick(fn) {
	        setTimeout(fn, 0);
	    };
	})();
	
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * isArray
	 */
	
	var isArray = Array.isArray;
	
	/**
	 * toString
	 */
	
	var str = Object.prototype.toString;
	
	/**
	 * Whether or not the given `val`
	 * is an array.
	 *
	 * example:
	 *
	 *        isArray([]);
	 *        // > true
	 *        isArray(arguments);
	 *        // > false
	 *        isArray('');
	 *        // > false
	 *
	 * @param {mixed} val
	 * @return {bool}
	 */
	
	module.exports = isArray || function (val) {
	  return !! val && '[object Array]' == str.call(val);
	};


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	exports.read = function(buffer, offset, isLE, mLen, nBytes) {
	  var e, m,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      nBits = -7,
	      i = isLE ? (nBytes - 1) : 0,
	      d = isLE ? -1 : 1,
	      s = buffer[offset + i];
	
	  i += d;
	
	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);
	
	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);
	
	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity);
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
	};
	
	exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
	      i = isLE ? 0 : (nBytes - 1),
	      d = isLE ? 1 : -1,
	      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
	
	  value = Math.abs(value);
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);
	
	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);
	
	  buffer[offset + i - d] |= s * 128;
	};


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	
	;(function (exports) {
		'use strict';
	
	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array
	
		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
	
		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS)
				return 62 // '+'
			if (code === SLASH)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}
	
		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr
	
			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}
	
			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0
	
			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)
	
			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length
	
			var L = 0
	
			function push (v) {
				arr[L++] = v
			}
	
			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}
	
			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}
	
			return arr
		}
	
		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length
	
			function encode (num) {
				return lookup.charAt(num)
			}
	
			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}
	
			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}
	
			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}
	
			return output
		}
	
		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}(false ? (this.base64js = {}) : exports))


/***/ }
/******/ ])
//# sourceMappingURL=dom.bundle.js.map
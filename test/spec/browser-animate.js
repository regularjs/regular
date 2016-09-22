var Regular = require("../../src/index.js");
var animate = require("../../src/helper/animate.js");
var dom = require("../../src/dom.js");

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
      component.destroy();
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
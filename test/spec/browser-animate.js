void function(){
  var Regular = require_lib("index.js");
  var animate = require_lib("helper/animate.js");
  var dom = require_lib("dom.js");
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
      before(function(){
        document.body.appendChild( container );
      });
      after(function(){
        document.body.removeChild( container );
      });

      // it("animation can triggered by event", function(done){
      //   var component = new Regular({
      //     template: "<div r-animation='on:click; class: animated;'></div>"
      //   }).$inject(container);


      //   var node =  nes.one('div', container)

      //   dispatchMockEvent(nes.one('div', container), 'click');

      //   Regular.dom.nextReflow(function(){

      //     expect(node.className ).to.equal("animated");

      //     Regular.dom.nextReflow(function(){

      //       expect(node.className ).to.equal("");

      //       destroy(component, container);
      //       done();
      //     })
      //   })

      it("animate.inject", function(done){
        var div1 =document.createElement("div");
        var div2 =document.createElement("div");

        animate.inject(div1, div2, 'bottom', function(){
          expect(div2.getElementsByTagName("div")[0]).to.equal(div1);
          done()
        })

      })

      it("animate.inject%animate.remove with callback", function(done){
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

      // it("animation.event should bind emit", function(done){
      //   var component = new Component({
      //     template: "<div r-animation='on: tap; class: animated;'></div>"
      //   }).$inject(container);
      // })
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
          param: "bouceOut animated"})(function(){
          expect(element.className).to.equal("");
          done();
        })

        dom.nextReflow(function(){
          expect(element.className).to.equal("bouceOut animated");
        })
      })
      it("animator: class,2", function(done){
        var element = document.createElement("div");
        var klass = Regular.animation("class");

        klass({
          element: element,
          param: "bouceOut animated,2"})(function(){
          expect(element.className).to.equal("");
          done();
        })

        expect(element.className).to.equal("bouceOut animated");

        dom.nextReflow(function(){
          expect(dom.hasClass(element, "bouceOut-active")).to.equal(true);
          expect(dom.hasClass(element, "animated-active")).to.equal(true);
          expect(dom.hasClass(element, "bouceOut")).to.equal(true);
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
      it("animator: style", function(done){
        var element = document.createElement("div");
        var style = Regular.animation("style");
        style({
          element: element,
          param: "left 10px, right 20px"
        })(function(){
          done();
          expect(element.style.left).to.equal("10px");
          expect(element.style.right).to.equal("20px");
        })
        expect(element.style.left).to.equal("");
        expect(element.style.right).to.equal("");
        dom.nextReflow(function(){
          expect(element.style.left).to.equal("10px");
          expect(element.style.right).to.equal("20px");
        })
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
    })

  })
}()
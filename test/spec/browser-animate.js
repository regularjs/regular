void function(){
  var Regular = require_lib("index.js");
  var animate = require_lib("helper/animate.js");
  var dom = require_lib("dom.js");
  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }


  // insert a test css
  var sheet = (function() {
    // Create the <style> tag
    var style = document.createElement("style");

    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);

    return style.sheet;
  })();

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

      it("animation.event should bount emit", function(done){
        
      })
    })


//       // it("animation can be triggered by custom event", function(done){

//       //   var Component = Regular.extend()
//       //     .event("tap", function(elem, fire){
//       //       Regular.dom.on(elem, "click", fire)
//       //       return function(){
//       //         Regular.dom.off(elem, "click", fire);
//       //       }
//       //     })

//       //   var component = new Component({
//       //     template: "<div r-animation='on: tap; class: animated;'></div>"
//       //   }).$inject(container);

//       //   dispatchMockEvent(nes.one('div', container), 'click');

//       //   Regular.dom.nextReflow(function(){

//       //     expect(nes.one("div", container).className ).to.equal("animated");

//       //     Regular.dom.nextReflow(function(){

//       //       expect(nes.one("div", container).className ).to.equal("");

//       //       destroy(component, container);
//       //       done();
//       //     })
//       //   })

//       // })
//     });

//     describe("Class", function(){

//       var container = document.createElement("div");
//       before(function(){
//         document.body.appendChild( container );
//       });
//       after(function(){
//         document.body.removeChild( container );
//       });

//       // it("class should add then remove in next frame.", function(done){
//       //   var component = new Regular({
//       //     template: "<div r-animation='when:test; class: animated;'></div>"
//       //   }).$inject(container);

//       //   component.$update("test", true);
//       //   Regular.dom.nextReflow(function(){
//       //     expect(nes.one("div", container).className ).to.equal("animated");
//       //     Regular.dom.nextReflow(function(){
//       //       expect(nes.one("div", container).className ).to.equal("");
//       //       destroy(component, container);

//       //       done();
//       //     })
//       //   })
        
//       // })
//     })
//     describe("Style", function(){
//       var container = document.createElement("div");
//       before(function(){
//         document.body.appendChild( container );
//       });
//       after(function(){
//         document.body.removeChild( container );
//       });
//       it("style should add style in nextFrame", function(done){

//         var component = new Regular({
//           template: "<div r-animation='when:test; style: left 10px;'></div>"
//         }).$inject(container);

//         component.$update("test", true);
//         expect(nes.one("div", container).style.left).to.equal("");
//         Regular.dom.nextReflow(function(){
//           expect(nes.one("div", container).style.left ).to.equal("10px");
//           destroy(component, container);
//           done();
//         })
//       })

//       it("style can add mulity style in nextFrame", function(done){
//         var component = new Regular({
//           template: "<div r-animation='when:test; style: left 10px;'></div>"
//         }).$inject(container);

//         var node = nes.one("div", container);
//         component.$update("test", true);
//         expect(node.style.left).to.equal("");
//         Regular.dom.nextReflow(function(){
//           expect(node.style.left ).to.equal("10px");
//           destroy(component, container);

//           done();
//         })

//       })
//     })
  })
}()
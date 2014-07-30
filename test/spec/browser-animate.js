// void function(){
//   var Regular = require_lib("index.js")
//   function destroy(component, container){
//     component.destroy();
//     expect(container.innerHTML).to.equal('');
//   }

//   describe("Animation", function(){
//     var Component = Regular.extend();
//     describe("Basic", function(){
//       var container = document.createElement("div");
//       before(function(){
//         document.body.appendChild( container );
//       });
//       after(function(){
//         document.body.removeChild( container );
//       });
//       it("buildin Animation should available for SubComponent", function(){

//         var Component2 = Component.extend();

//         expect(Component2.animation("wait")).to.be.a("function");
//         expect(Component2.animation("class")).to.be.a("function");
//         expect(Component2.animation("call")).to.be.a("function");

//       })
//       it("extension is not available for Parent, but for SubComponent", function(){

//         function foo(){}

//         Component.animation("style3", foo);

//         var Component2 = Component.extend();

//         expect(Component2.animation("style3")).to.equal(foo);
//         expect(Regular.animation("style3")).to.equal(undefined);

//       })

//       // it("animation can triggered by event", function(done){
//       //   var component = new Regular({
//       //     template: "<div r-animation='on:click; class: animated;'></div>"
//       //   }).$inject(container);


//       //   var node =  nes.one('div', container)

//       //   dispatchMockEvent(nes.one('div', container), 'click');

//       //   Regular.dom.nextReflow(function(){

//       //     expect(node.className ).to.equal("animated");

//       //     Regular.dom.nextReflow(function(){

//       //       expect(node.className ).to.equal("");

//       //       destroy(component, container);
//       //       done();
//       //     })
//       //   })




//       // })

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
//   })
// }()
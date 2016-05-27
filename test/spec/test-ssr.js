var expect = require('expect.js');
var SSR = require('../../src/render/server');
var Regular = require('../../src/index');



var ao = expect.Assertion.prototype;

ao.typeEqual = function(list){
  if(typeof list == 'string') list = list.split(',')
  var types = this.obj.map(function(item){
    return item.type
  });
  this.assert(
      expect.eql(types, list) 
    , function(){ return 'expected ' + list + ' to equal ' + types }
    , function(){ return 'expected ' + list + ' to not equal ' + types });
  return this;
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
    var Namespace = Regular.extend()
  })

})
var expect = require('expect.js');
var _ = require("../../src/util.js");
var shim = require("../../src/helper/shim.js");
var extend = require("../../src/helper/extend.js");
var diff = require("../../src/helper/diff.js")
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

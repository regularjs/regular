var _ = require_lib("util.js");
var extend = require_lib('helper/extend.js');




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

    expect(_.extend(c, {b:1,c:2},["c"])).to.eql({a:1,c:2})
  })

  it('_.equals should works as expect', function(){
    expect(_.equals([], [1,2])).to.eql([
      {
        "index": 0,
        "add": 0,
        "removed": [
          1,
          2
        ]
      }
    ])
    expect(_.equals([1,2], [])).to.eql([
      { index: 0, add: 2, removed: [] } 
    ]);
    expect(_.equals([1,2,3], [2])).to.eql([
      { index: 0, add: 1, removed: [] },
      { index: 2, add: 1, removed: []} 
    ]);
    var a = [1,2,3];
    expect(_.equals(_.slice(a, 1),[])).to.eql([
      { index: 0, add: 2, removed: []} 
    ]);

    expect(_.equals(1,2)).to.eql(false)
    expect(_.equals(1,1)).to.eql(true)
    expect(_.equals(NaN,NaN)).to.eql(true)
    expect(_.equals(null,undefined)).to.eql(false)
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


  describe('Error Track should work as expected', function(){

    it("_.trackErrorPos should have no '...' prefix if not slice", function(){

      expect(_.trackErrorPos("abcdefghi", 1)).to.equal('1> abcdefghi\n    ^');
      expect(_.trackErrorPos("abcdefghi", 2)).to.equal('1> abcdefghi\n     ^');


    })
  })

  

})

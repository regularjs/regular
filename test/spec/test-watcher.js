
void function(){
  var Watcher = require_lib('helper/watcher');
  var parse = require_lib("helper/parse");
  describe("component.watcher", function(){
    var watcher = Watcher.mixTo({
      data: {
        str: 'hehe',
        obj: {},
        array: []
      }
    })

    it('it should watch once when have  ', function(){
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

    it("watch accept multi binding ", function(){
      watcher.$watch(["str", "array.length"], function(str, len){
        expect(str).to.equal("haha")
        expect(len).to.equal(2)
      })

      watcher.data.str = "haha";
      watcher.data.array = [1,2];
      watcher.$digest();
    })

    it("watch object deep should checked the key", function(){
      var watcher = Watcher.mixTo({
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
    })

  })

}()






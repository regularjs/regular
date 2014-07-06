var Event = require_lib("helper/event.js");

void function(){

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

}()
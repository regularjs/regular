
var Regular = require_lib("index.js");
void function(){

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

   var trunk = new RegExp(Object.keys(maps).join('|'),'g');
   
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

describe("Filter", function(){
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
  
})

}()

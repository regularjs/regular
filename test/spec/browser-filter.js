
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
      template: "<div>{{test|lowercase}}</div>",
      data: {test: "ABcD"}
    }).$inject(container);


    expect($("div",container).html()).to.equal('abcd');

    destroy(component, container);
  })

  it("filter should works with param", function(){
    var component = new Component({
      template: "<div>{{test|format: 'yyyy-MM-dd'}}</div>",
      data: {test: +new Date(1407908567273)}
    }).$inject(container);
    expect($("div",container).html()).to.equal('2014-08-13');

    destroy(component, container);

  })
  
})

}()

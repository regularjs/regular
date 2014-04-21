var Compiler1 = require_lib('compiler/Compiler1.js');
var Compiler2 = require_lib('compiler/Compiler2.js');

var c = function(str){
  return new Compiler1(str).compile();
}



describe("Compiler1 Test", function(){
  var input = 
    "<div ng-repeat='hello' hello={-hello} ng-class={= hello? 'name': 'go'}>\
        <div ng-if='test'>hello</div>\
     </div>"

   console.log(c(input));
  it("pure xml lex should return diff tokens under mode 1 and 2", function(){
   
  })

})

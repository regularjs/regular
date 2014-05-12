var Termin = require_lib('common.js');

var c = function(str,data){
  return new Termin(str,data);
}

describe("Compiler1 Test", function(){
  var input = 
    "<div ng-repeat='hello' hello={{1}} proxy={{ {'click .j-click' : go(1)} }} src={{hello}} t-class={{ hello? 'name': 'go' }}>\
      <div t-click='hello'> {{this.go()}} </div>\
      <input type='text' t-model={{dada}}/>\
      <textarea></textarea>\
    </div>";

  var input2 =
    "{{#list list as hello}}haah"+input+"dhadha{{/list}}";

  var Modal = Termin.derive({template: input, go:function(){return 1}})

  it("pure xml lex should return diff tokens under mode 1 and 2", function(){
    var tn = new Modal({go: function(){return 1}});
    // var tn2 = new Modal(input2, {list: ["1","2","3"]});
    window.tn = tn;
    // window.tn2 = tn2;

    // tn.set('hello', 20000000000000000);
  })
})



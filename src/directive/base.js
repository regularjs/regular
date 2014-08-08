// Regular
var _ = require("../util.js");
var dom = require("../dom.js");
var animate = require("../helper/animate.js");
var Regular = require("../Regular.js");



require("./event.js");
require("./form.js");


// **warn**: class inteplation will override this directive 

Regular.directive('r-class', function(elem, value){
  this.$watch(value, function(nvalue){
    var className = ' '+ elem.className.replace(/\s+/g, ' ') +' ';
    for(var i in nvalue) if(nvalue.hasOwnProperty(i)){
      className = className.replace(' ' + i + ' ',' ');
      if(nvalue[i] === true){
        className += i+' ';
      }
    }
    elem.className = className.trim();
  },true);

});

// **warn**: style inteplation will override this directive 

Regular.directive('r-style', function(elem, value){
  this.$watch(value, function(nvalue){
    for(var i in nvalue) if(nvalue.hasOwnProperty(i)){
      dom.css(elem, i, nvalue[i]);
    }
  },true);
});

// when expression is evaluate to true, the elem will add display:none
// Example: <div r-hide={{items.length > 0}}></div>

Regular.directive('r-hide', function(elem, value){
  var preBool = null, compelete;
  this.$watch(value, function(nvalue){
    var bool = !!nvalue;
    if(bool === preBool) return; 
    preBool = bool;
    if(bool){
      if(elem.onleave){
        compelete = elem.onleave(function(){
          elem.style.display = "none"
          compelete = null;
        })
      }else{
        elem.style.display = "none"
      }
      
    }else{
      if(compelete) compelete();
      elem.style.display = "";
      if(elem.onenter){
        elem.onenter();
      }
    }
  });

});

// unescaped inteplation. xss is not be protect
Regular.directive('r-html', function(elem, value){
  this.$watch(value, function(nvalue){
    nvalue = nvalue || "";
    dom.html(elem, nvalue)
  }, {force: true});
});










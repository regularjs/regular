// Regular
var _ = require("../util.js");
var dom = require("../dom.js");
var animate = require("../helper/animate.js");
var Regular = require("../Regular.js");
var consts = require("../const");



require("./event.js");
require("./form.js");


module.exports = {
// **warn**: class inteplation will override this directive 
  'r-class': function(elem, value){
    if(typeof value=== 'string'){
      value = _.fixObjStr(value)
    }
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
  },
  // **warn**: style inteplation will override this directive 
  'r-style': function(elem, value){
    if(typeof value=== 'string'){
      value = _.fixObjStr(value)
    }
    this.$watch(value, function(nvalue){
      for(var i in nvalue) if(nvalue.hasOwnProperty(i)){
        dom.css(elem, i, nvalue[i]);
      }
    },true);
  },
  // when expression is evaluate to true, the elem will add display:none
  // Example: <div r-hide={{items.length > 0}}></div>
  'r-hide': function(elem, value){
    var preBool = null, compelete;
    if( _.isExpr(value) || typeof value === "string"){
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
    }else if(!!value){
      elem.style.display = "none";
    }
  },
  'r-html': function(elem, value){
    this.$watch(value, function(nvalue){
      nvalue = nvalue || "";
      dom.html(elem, nvalue)
    }, {force: true});
  },
  'ref': {
    accept: consts.COMPONENT_TYPE + consts.ELEMENT_TYPE,
    link: function( elem, value ){
      var refs = this.$refs || (this.$refs = {});
      var cval;
      if(_.isExpr(value)){
        this.$watch(value, function(nval, oval){
          cval = nval;
          if(refs[oval] === elem) refs[oval] = null;
          if(cval) refs[cval] = elem;
        })
      }else{
        refs[cval = value] = elem;
      }
      return function(){
        refs[cval] = null;
      }
    }
  }
}

Regular.directive(module.exports);











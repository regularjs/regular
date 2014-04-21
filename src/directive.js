var dom = require('./dom');
var _directive = {};

exports.directive = function(name, cfg){
    if(!cfg){
      return decorateors[name];
    }
    if(typeof cfg == 'function'){
      tmp = {}; 
      tmp.priority = 10;
      tmp.type = 'E';
      tmp.link = cfg;
      cfg = tmp;
    }
    _decorateors[name] = cfg;
    return this;
}



exports.directive("tn-style", function(vm, el, attr){
  var watchid = vm.watch(attr.expression, function(newValue, oldValue){

  });
  return function(){
    vm.unwatch(watchid);
  }
});

exports.directive("tn-model", function(vm, el, attr){
  var watchid = vm.watch(attr.expression, function(newValue, oldValue){

  });
  return function(){
    vm.unwatch(watchid);
  }
});

exports.directive("tn-class", function(vm, el, attr){
  var watchid = vm.watch(attr.expression, function(newValue, oldValue){
    var type = typeof newValue;
    if(type === 'string'){
      el.addClass(newValue);
      if(oldValue) el.delClass(oldValue);
    }else if(type === 'object'){
      for(var i in newValue){
        if(newValue[i]) el.addClass(i)
        else el.delClass(i);
      }
    }
  });
  return function(){
    vm.unwatch(watchid);
  }
});


exports.directive(/^on-\w+$/, function(vm, el, attrs){
  var eventName = attr.name.split('-')[1].toLowerCase();
  function callback(){

  }
  vm.watch(attr.expression, function(newValue, oldValue){

  });
  return function(){
    dom.off(el, eventName, callback);
    vm.unwatch(watchid);
  }
})

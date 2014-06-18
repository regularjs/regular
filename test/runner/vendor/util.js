var ao = expect.Assertion.prototype;


ao.typeEqual = function(list){
  if(typeof list == 'string') list = list.split(',')
  var types = this.obj.map(function(item){
    return item.type
  });
  this.assert(
      expect.eql(types, list) 
    , function(){ return 'expected ' + list + ' to equal ' + types }
    , function(){ return 'expected ' + list + ' to not equal ' + types });
  return this;
}


expect.template = (function(){
  var cache = {};
  return {
    get: function(name){
      return cache[name];
    },
    set: function(fn){
      return (cache[fn.name] = fn.toString().match(/\/\*([\s\S]*)\*\//)[1].trim())
    }
  }
})()

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




var f = module.exports = {};

// json:  two way filter.
//  - get: JSON.stringify
//  - set: JSON.parse
//  - example: title | json
f.json = {
  get: function( value ){
    return typeof JSON !== 'undefined'? JSON.stringify(value): value;
  },
  set: function( value ){
    return typeof JSON !== 'undefined'? JSON.parse(value) : value;
  }
}
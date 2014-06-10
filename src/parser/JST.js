var _ = require('../util.js');
var Parser =  require('./parser.js');

function Template(str){
  str = str || "";
  if(typeof str === 'string') str = new Parser(str, {mode: 2}).parse();
}


_.extend(Template.prototype, {
  compile: function(){

  },
  _walk: function(){

  }
});

walkers = {
  list: function(){

  },
  text: function(){

  },
  interplation: function(){

  }
}


var Lexer = tn.Lexer;

var SLexer = function(str){
  Lexer.call(this);
}

SLexer.prototype = object.create(SLexer.prototype);


//{zen "div>span*5"/}
tn.rule('zen',  function(args, body){
  var parsed = selector.lex(express);
}, 1);
// {macro name=list} {/macro}
tn.rule('macro', function(){

})



var _  = module.exports;
var slice = [].slice;
var o2str = ({}).toString;

_.uid = (function(){
  var _uid=0;
  return function(){
    return _uid++;
  }
})();


_.slice = function(obj, start, end){
  return slice.call(obj, start, end);
}

_.typeOf = function (o) {
  return o == null ? String(o) : ({}).toString.call(o).slice(8, -1).toLowerCase();
}

_.extend = function( o1, o2, override ){

  for(var i in o2){
    if( typeof o1[i] === "undefined" || override ){
      o1[i] = o2[i]
    }
  }
  return o1;
}

// // form acorn.js
// // ---------------------
// _.makePredicate = function makePredicate(words, prefix) {
//     if (typeof words === "string") {
//         words = words.split(" ");
//     }
//     var f = "",
//     cats = [];
//     out: for (var i = 0; i < words.length; ++i) {
//         for (var j = 0; j < cats.length; ++j){
//           if (cats[j][0].length === words[i].length) {
//               cats[j].push(words[i]);
//               continue out;
//           }
//         }
//         cats.push([words[i]]);
//     }
//     function compareTo(arr) {
//         if (arr.length === 1) return f += "return str === "" + arr[0] + "";";
//         f += "switch(str){";
//         for (var i = 0; i < arr.length; ++i){
//            f += "case "" + arr[i] + "":";
//         }
//         f += "return true}return false;";
//     }

//     // When there are more than three length categories, an outer
//     // switch first dispatches on the lengths, to save on comparisons.
//     if (cats.length > 3) {
//         cats.sort(function(a, b) {
//             return b.length - a.length;
//         });
//         f += "var prefix = " + (prefix ? "true": "false") + ";if(prefix) str = str.replace(/^-(?:\\w+)-/,"");switch(str.length){";
//         for (var i = 0; i < cats.length; ++i) {
//             var cat = cats[i];
//             f += "case " + cat[0].length + ":";
//             compareTo(cat);
//         }
//         f += "}";

//         // Otherwise, simply generate a flat `switch` statement.
//     } else {
//         compareTo(words);
//     }
//     return new Function("str", f);
// }

// linebreak
var lb = /\r\n|[\n\r\u2028\u2029]/g
_.trackErrorPos = function (input, pos){
  lb.lastIndex = 0;

  var line = 1, last = 0, nextLinePos;
  var len = input.length;

  var match;
  while ((match = lb.exec(input))) {
    if(match.index < pos){
      ++line;
      last = match.index + 1;
    }else{
      nextLinePos = match.index
    }
  }
  if(!nextLinePos)  nextLinePos = len - 1;

  var min = pos - 10;
  if(min < last) min = last;

  var max = pos + 10;
  if(max > nextLinePos) max = nextLinePos;

  var remain = input.slice(min, max);
  var prefix = line + "> " + (min >= last? "..." : "")
  var postfix = max < nextLinePos ? "...": "";

  return prefix + remain + postfix + "\n" + new Array( prefix.length + pos - min + 1).join(" ") + "^";
}


var ignoredRef = /\(\?\!|\(\?\:|\?\=/;
_.findSubCapture = function (regStr) {
  var left = 0,
    right = 0,
    len = regStr.length,
    ignored = regStr.split(ignoredRef).length - 1; //忽略非捕获匹配
  for (; len--;) {
    var letter = regStr.charAt(len);
    if (len === 0 || regStr.charAt(len - 1) !== "\\" || regStr.charAt(len+1) !== "?") { //不包括转义括号
      if (letter === "(") left++;
      if (letter === ")") right++;
    }
  }
  if (left !== right) throw "RegExp: "+ regStr + "'s bracket is not marched";
  else return left - ignored;
};


_.assert = function(test, msg){
  if(!test) throw msg;
  return true;
}

_.walk = function(ast){
  if(o2str.call(ast) === "[object Array]"){
    var res = [];
    for(var i = 0, len = ast.length; i < len; i++){
      res.push(this.walk(ast[i]));
    }
    return this;
  }
  return this.walkers[ast.type || "default"].call(this, ast);
}


_.isEmpty = function(obj){
  return !obj || obj.length === 0;
}
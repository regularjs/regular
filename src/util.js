require('./helper/shim.js');
var _  = module.exports;
var entities = require('./helper/entities.js');
var slice = [].slice;
var o2str = ({}).toString;
var win = typeof window !=='undefined'? window: global;


_.noop = function(){};
_.uid = (function(){
  var _uid=0;
  return function(){
    return _uid++;
  }
})();

_.varName = 'd';
_.setName = 'p_';
_.ctxName = 'c';
_.extName = 'e';

_.rWord = /^[\$\w]+$/;
_.rSimpleAccessor = /^[\$\w]+(\.[\$\w]+)*$/;

_.nextTick = typeof setImmediate === 'function'? 
  setImmediate.bind(win) : 
  function(callback) {
    setTimeout(callback, 0) 
  }



_.prefix = "var " + _.varName + "=" + _.ctxName + ".data;" +  _.extName  + "=" + _.extName + "||'';";


_.slice = function(obj, start, end){
  var res = [];
  for(var i = start || 0, len = end || obj.length; i < len; i++){
    var item = obj[i];
    res.push(item)
  }
  return res;
}

_.typeOf = function (o) {
  return o == null ? String(o) :o2str.call(o).slice(8, -1).toLowerCase();
}

_.isExpression = function( expr ){
  return expr && expr.type === 'expression';
}


_.extend = function( o1, o2, override ){
  if(_.typeOf(override) === 'array'){
   for(var i = 0, len = override.length; i < len; i++ ){
    var key = override[i];
    o1[key] = o2[key];
   } 
  }else{
    for(var i in o2){
      if( typeof o1[i] === "undefined" || override === true ){
        o1[i] = o2[i]
      }
    }
  }
  return o1;
}

_.makePredicate = function makePredicate(words, prefix) {
    if (typeof words === "string") {
        words = words.split(" ");
    }
    var f = "",
    cats = [];
    out: for (var i = 0; i < words.length; ++i) {
        for (var j = 0; j < cats.length; ++j){
          if (cats[j][0].length === words[i].length) {
              cats[j].push(words[i]);
              continue out;
          }
        }
        cats.push([words[i]]);
    }
    function compareTo(arr) {
        if (arr.length === 1) return f += "return str === '" + arr[0] + "';";
        f += "switch(str){";
        for (var i = 0; i < arr.length; ++i){
           f += "case '" + arr[i] + "':";
        }
        f += "return true}return false;";
    }

    // When there are more than three length categories, an outer
    // switch first dispatches on the lengths, to save on comparisons.
    if (cats.length > 3) {
        cats.sort(function(a, b) {
            return b.length - a.length;
        });
        f += "switch(str.length){";
        for (var i = 0; i < cats.length; ++i) {
            var cat = cats[i];
            f += "case " + cat[0].length + ":";
            compareTo(cat);
        }
        f += "}";

        // Otherwise, simply generate a flat `switch` statement.
    } else {
        compareTo(words);
    }
    return new Function("str", f);
}


_.trackErrorPos = (function (){
  // linebreak
  var lb = /\r\n|[\n\r\u2028\u2029]/g;
  function findLine(lines, pos){
    var tmpLen = 0;
    for(var i = 0,len = lines.length; i < len; i++){
      var lineLen = (lines[i] || "").length;
      if(tmpLen + lineLen > pos) return {num: i, line: lines[i], start: pos - tmpLen};
      // 1 is for the linebreak
      tmpLen = tmpLen + lineLen + 1;
    }
    
  }
  return function(input, pos){
    if(pos > input.length-1) pos = input.length-1;
    lb.lastIndex = 0;
    var lines = input.split(lb);
    var line = findLine(lines,pos);
    var len = line.line.length;

    var min = line.start - 10;
    if(min < 0) min = 0;

    var max = line.start + 10;
    if(max > len) max = len;

    var remain = line.line.slice(min, max);
    var prefix = (line.num+1) + "> " + (min > 0? "..." : "")
    var postfix = max < len ? "...": "";

    return prefix + remain + postfix + "\n" + new Array(line.start + prefix.length + 1).join(" ") + "^";
  }
})();


var ignoredRef = /\((\?\!|\?\:|\?\=)/g;
_.findSubCapture = function (regStr) {
  var left = 0,
    right = 0,
    len = regStr.length,
    ignored = regStr.match(ignoredRef); // ignored uncapture
  if(ignored) ignored = ignored.length
  else ignored = 0;
  for (; len--;) {
    var letter = regStr.charAt(len);
    if (len === 0 || regStr.charAt(len - 1) !== "\\" ) { 
      if (letter === "(") left++;
      if (letter === ")") right++;
    }
  }
  if (left !== right) throw "RegExp: "+ regStr + "'s bracket is not marched";
  else return left - ignored;
};


_.escapeRegExp = function( str){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
  return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, function(match){
    return '\\' + match;
  });
};


var rEntity = new RegExp("&(" + Object.keys(entities).join('|') + ');', 'gi');

_.convertEntity = function(chr){

  return ("" + chr).replace(rEntity, function(all, capture){
    return String.fromCharCode(entities[capture])
  });

}


// simple get accessor

_.createObject = function(o, props){
    function Foo() {}
    Foo.prototype = o;
    var res = new Foo;
    if(props) _.extend(res, props);
    return res;
}

_.createProto = function(fn, o){
    function Foo() { this.constructor = fn;}
    Foo.prototype = o;
    return (fn.prototype = new Foo());
}


/**
clone
*/
_.clone = function clone(obj){
    var type = _.typeOf(obj);
    if(type === 'array'){
      var cloned = [];
      for(var i=0,len = obj.length; i< len;i++){
        cloned[i] = obj[i]
      }
      return cloned;
    }
    if(type === 'object'){
      var cloned = {};
      for(var i in obj) if(obj.hasOwnProperty(i)){
        cloned[i] = obj[i];
      }
      return cloned;
    }
    return obj;
  }

_.equals = function(now, old){
  var type = typeof now;
  if(type === 'number' && typeof old === 'number'&& isNaN(now) && isNaN(old)) return true
  return now === old;
}
_.diffArray = function(now, old){
  var nlen = now.length;
  var olen = old.length;
  if(nlen !== olen){
    return false;
  }
  for(var i = 0; i < nlen ; i++){
    if(now[i] !== old[i]) return  false;
  }
  return true

}




_.throttle = function throttle(func, wait){
  var wait = wait || 100;
  var context, args, result;
  var timeout = null;
  var previous = 0;
  var later = function() {
    previous = +new Date;
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function() {
    var now = + new Date;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      context = args = null;
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

// hogan escape
// ==============
_.escape = (function(){
  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos = /\'/g,
      rQuot = /\"/g,
      hChars = /[&<>\"\']/;

  return function(str) {
    return hChars.test(str) ?
      str
        .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }
})();

_.cache = function(max){
  max = max || 1000;
  var keys = [],
      cache = {};
  return {
    set: function(key, value) {
      if (keys.length > this.max) {
        cache[keys.shift()] = undefined;
      }
      // 
      if(cache[key] === undefined){
        keys.push(key);
      }
      cache[key] = value;
      return value;
    },
    get: function(key) {
      if (key === undefined) return cache;
      return cache[key];
    },
    max: max,
    len:function(){
      return keys.length;
    }
  };
}

// // setup the raw Expression
// _.touchExpression = function(expr){
//   if(expr.type === 'expression'){
//   }
//   return expr;
// }


// handle the same logic on component's `on-*` and element's `on-*`
// return the fire object
_.handleEvent = function(value, type ){
  var self = this, evaluate;
  if(value.type === 'expression'){ // if is expression, go evaluated way
    evaluate = value.get;
  }
  if(evaluate){
    return function fire(obj){
      self.data.$event = obj;
      var res = evaluate(self);
      if(res === false && obj && obj.preventDefault) obj.preventDefault();
      self.data.$event = undefined;
      self.$update();
    }
  }else{
    return function fire(){
      var args = slice.call(arguments)      
      args.unshift(value);
      self.$emit.apply(self, args);
      self.$update();
    }
  }
}

// only call once
_.once = function(fn){
  var time = 0;
  return function(){
    if( time++ === 0) fn.apply(this, arguments);
  }
}

_.fixObjStr = function(str){
  if(str.trim().indexOf('{') !== 0){
    return '{' + str + '}';
  }
  return str;
}



_.log = function(msg, type){
  if(typeof console !== "undefined")  console[type || "log"](msg);
}



//http://www.w3.org/html/wg/drafts/html/master/single-page.html#void-elements
_.isVoidTag = _.makePredicate("area base br col embed hr img input keygen link menuitem meta param source track wbr r-content");
_.isBooleanAttr = _.makePredicate('selected checked disabled readOnly required open autofocus controls autoplay compact loop defer multiple');

_.isFalse - function(){return false}
_.isTrue - function(){return true}


_.assert = function(test, msg){
  if(!test) throw msg;
}


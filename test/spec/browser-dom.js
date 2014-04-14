function require_base(src){
  return require( (typeof process !== "undefined" && process.env? "../../src/" : "terminator/src/")+src);
}

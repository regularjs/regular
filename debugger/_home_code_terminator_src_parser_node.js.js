
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_cZ671F, __expression_FqD$4J, __block_CAXg$p;
    var store = require('/home/code/terminator/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_cZ671F = function(i) {
        var fd = store.register('/home/code/terminator/src/parser/node.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_FqD$4J = function(i) {
        var fd = store.register('/home/code/terminator/src/parser/node.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_CAXg$p = function(i) {
        var fd = store.register('/home/code/terminator/src/parser/node.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_UmC_ID = function(id, obj) {
        // console.log('__intro: ', id, ', obj.__instrumented_miss: ', obj.__instrumented_miss, ', obj.length: ', obj.length);
        obj.__instrumented_miss = obj.__instrumented_miss || [];
        if ('undefined' !== typeof obj && null !== obj && 'undefined' !== typeof obj.__instrumented_miss) {
            if (obj.length === 0) {
                // console.log('interim miss: ', id);
                obj.__instrumented_miss[id] = true;
            } else {
                obj.__instrumented_miss[id] = false;
            }
        }
        return obj;
    };
    function isProbablyChainable(obj, id) {
        return obj &&
            obj.__instrumented_miss[id] !== undefined &&
            'number' === typeof obj.length;
    }
    __extro_Bv9j04 = function(id, obj) {
        var fd = store.register('/home/code/terminator/src/parser/node.js');
        // console.log('__extro: ', id, ', obj.__instrumented_miss: ', obj.__instrumented_miss, ', obj.length: ', obj.length);
        if ('undefined' !== typeof obj && null !== obj && 'undefined' !== typeof obj.__instrumented_miss) {
            if (isProbablyChainable(obj, id) && obj.length === 0 && obj.__instrumented_miss[id]) {
                // if the call was not a "constructor" - i.e. it did not add things to the chainable
                // and it did not return anything from the chainable, it is a miss
                // console.log('miss: ', id);
            } else {
                fs.writeSync(fd, '{"chain": {"node": ' + id + '}},\n');
            }
            obj.__instrumented_miss[id] = undefined;
        } else {
            fs.writeSync(fd, '{"chain": {"node": ' + id + '}},\n');
        }
        return obj;
    };
};
////////////////////////

// Instrumented Code
(function () {
    {
        __statement_cZ671F(0);
        module.exports = {
            element: function (name, attrs, children) {
                __block_CAXg$p(0);
                return __expression_FqD$4J(1), {
                    type: 'element',
                    tag: name,
                    attrs: attrs,
                    children: children
                };
            },
            if: function (test, consequent, alternate) {
                __block_CAXg$p(1);
                return __expression_FqD$4J(2), {
                    type: 'if',
                    test: test,
                    consequent: consequent,
                    alternate: alternate
                };
            },
            list: function (sequence, variable, body) {
                __block_CAXg$p(2);
                return __expression_FqD$4J(3), {
                    type: 'list',
                    sequence: sequence,
                    variable: variable,
                    body: body
                };
            },
            text: function (text) {
                __block_CAXg$p(3);
                return __expression_FqD$4J(4), text;
            },
            inteplation: function (expression) {
                __block_CAXg$p(4);
                return __expression_FqD$4J(5), {
                    type: 'inteplation',
                    expr: expression
                };
            },
            filter: function (object, filters) {
                __block_CAXg$p(5);
                return __expression_FqD$4J(6), {
                    type: 'filter',
                    object: object,
                    filters: filters
                };
            },
            condition: function (test, consequent, alternate) {
                __block_CAXg$p(6);
                return __expression_FqD$4J(7), {
                    type: 'condition',
                    test: test,
                    consequent: consequent,
                    alternate: alternate
                };
            },
            logic: function (op, left, right) {
                __block_CAXg$p(7);
                return __expression_FqD$4J(8), {
                    type: 'logic',
                    op: op,
                    left: left,
                    right: right
                };
            },
            binary: function (op, left, right) {
                __block_CAXg$p(8);
                return __expression_FqD$4J(9), {
                    type: 'binary',
                    op: op,
                    left: left,
                    right: right
                };
            },
            unary: function (op, arg) {
                __block_CAXg$p(9);
                return __expression_FqD$4J(10), {
                    type: 'logic',
                    op: op,
                    arg: arg
                };
            },
            call: function (callee, args) {
                __block_CAXg$p(10);
                return __expression_FqD$4J(11), {
                    type: 'call',
                    callee: callee,
                    args: args
                };
            },
            member: function (obj, prop, isComputed) {
                __block_CAXg$p(11);
                return __expression_FqD$4J(12), {
                    type: 'member',
                    obj: obj,
                    prop: prop,
                    isComputed: isComputed
                };
            }
        };
    }
}());
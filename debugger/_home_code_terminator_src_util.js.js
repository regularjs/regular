
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_M7D$Sj, __expression_gSrb6d, __block_shFsvx;
    var store = require('/home/code/terminator/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_M7D$Sj = function(i) {
        var fd = store.register('/home/code/terminator/src/util.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_gSrb6d = function(i) {
        var fd = store.register('/home/code/terminator/src/util.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_shFsvx = function(i) {
        var fd = store.register('/home/code/terminator/src/util.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_O4leMl = function(id, obj) {
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
    __extro_fisLx0 = function(id, obj) {
        var fd = store.register('/home/code/terminator/src/util.js');
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
        __statement_M7D$Sj(0);
        var _ = module.exports;
    }
    {
        __statement_M7D$Sj(1);
        var slice = [].slice;
    }
    {
        __statement_M7D$Sj(2);
        _.uid = (__expression_gSrb6d(3), function () {
            __block_shFsvx(0);
            {
                __statement_M7D$Sj(4);
                var _uid = 0;
            }
            return __expression_gSrb6d(5), function () {
                __block_shFsvx(1);
                return __expression_gSrb6d(6), (__expression_gSrb6d(7), _uid++);
            };
        }());
    }
    {
        __statement_M7D$Sj(8);
        _.slice = function (obj, start, end) {
            __block_shFsvx(2);
            return __expression_gSrb6d(9), __extro_fisLx0(10, __intro_O4leMl(10, slice).call(obj, start, end));
        };
    }
    {
        __statement_M7D$Sj(11);
        _.typeOf = function (o) {
            __block_shFsvx(3);
            return __expression_gSrb6d(12), (__expression_gSrb6d(15), (__expression_gSrb6d(16), o) == null) ? (__expression_gSrb6d(13), (__expression_gSrb6d(17), String(o))) : (__expression_gSrb6d(14), __extro_fisLx0(18, __intro_O4leMl(18, __extro_fisLx0(19, __intro_O4leMl(19, __extro_fisLx0(20, __intro_O4leMl(20, {}.toString).call(o))).slice(8, (__expression_gSrb6d(21), -1)))).toLowerCase()));
        };
    }
    {
        __statement_M7D$Sj(22);
        _.extend = function (o1, o2, override) {
            __block_shFsvx(4);
            for (var i in o2) {
                __block_shFsvx(5);
                if (__expression_gSrb6d(23), (__expression_gSrb6d(24), (__expression_gSrb6d(25), typeof o1[i]) === 'undefined') || (__expression_gSrb6d(26), override)) {
                    __block_shFsvx(6);
                    {
                        __statement_M7D$Sj(27);
                        o1[i] = o2[i];
                    }
                }
            }
            return __expression_gSrb6d(28), o1;
        };
    }
    {
        __statement_M7D$Sj(29);
        var lb = /\r\n|[\n\r\u2028\u2029]/g;
    }
    {
        __statement_M7D$Sj(30);
        _.trackErrorPos = function (input, pos) {
            __block_shFsvx(7);
            {
                __statement_M7D$Sj(31);
                lb.lastIndex = 0;
            }
            {
                __statement_M7D$Sj(32);
                var line = 1, last = 0, nextLinePos;
            }
            {
                __statement_M7D$Sj(33);
                var len = input.length;
            }
            {
                __statement_M7D$Sj(34);
                var match;
            }
            while (match = __extro_fisLx0(35, __intro_O4leMl(35, lb).exec(input))) {
                __block_shFsvx(8);
                if (__expression_gSrb6d(36), match.index < (__expression_gSrb6d(37), pos)) {
                    __block_shFsvx(9);
                    {
                        __statement_M7D$Sj(38);
                        __expression_gSrb6d(39), ++line;
                    }
                    {
                        __statement_M7D$Sj(40);
                        last = (__expression_gSrb6d(41), match.index + 1);
                    }
                } else {
                    __block_shFsvx(10);
                    {
                        __statement_M7D$Sj(42);
                        nextLinePos = match.index;
                    }
                }
            }
            if (__expression_gSrb6d(43), !(__expression_gSrb6d(44), nextLinePos)) {
                __block_shFsvx(11);
                {
                    __statement_M7D$Sj(45);
                    nextLinePos = (__expression_gSrb6d(46), (__expression_gSrb6d(47), len) - 1);
                }
            }
            {
                __statement_M7D$Sj(48);
                var min = (__expression_gSrb6d(49), (__expression_gSrb6d(50), pos) - 10);
            }
            if (__expression_gSrb6d(51), (__expression_gSrb6d(52), min) < (__expression_gSrb6d(53), last)) {
                __block_shFsvx(12);
                {
                    __statement_M7D$Sj(54);
                    min = last;
                }
            }
            {
                __statement_M7D$Sj(55);
                var max = (__expression_gSrb6d(56), (__expression_gSrb6d(57), pos) + 10);
            }
            if (__expression_gSrb6d(58), (__expression_gSrb6d(59), max) > (__expression_gSrb6d(60), nextLinePos)) {
                __block_shFsvx(13);
                {
                    __statement_M7D$Sj(61);
                    max = nextLinePos;
                }
            }
            {
                __statement_M7D$Sj(62);
                var remain = __extro_fisLx0(63, __intro_O4leMl(63, input).slice(min, max));
            }
            {
                __statement_M7D$Sj(64);
                var prefix = (__expression_gSrb6d(65), (__expression_gSrb6d(66), (__expression_gSrb6d(67), line) + '> ') + ((__expression_gSrb6d(70), (__expression_gSrb6d(71), min) >= (__expression_gSrb6d(72), last)) ? (__expression_gSrb6d(68), '...') : (__expression_gSrb6d(69), '')));
            }
            {
                __statement_M7D$Sj(73);
                var postfix = (__expression_gSrb6d(76), (__expression_gSrb6d(77), max) < (__expression_gSrb6d(78), nextLinePos)) ? (__expression_gSrb6d(74), '...') : (__expression_gSrb6d(75), '');
            }
            return __expression_gSrb6d(79), (__expression_gSrb6d(80), (__expression_gSrb6d(81), (__expression_gSrb6d(82), (__expression_gSrb6d(83), (__expression_gSrb6d(84), (__expression_gSrb6d(85), prefix) + (__expression_gSrb6d(86), remain)) + (__expression_gSrb6d(87), postfix)) + '\n') + __extro_fisLx0(88, __intro_O4leMl(88, new Array((__expression_gSrb6d(89), (__expression_gSrb6d(90), (__expression_gSrb6d(91), prefix.length + (__expression_gSrb6d(92), pos)) - (__expression_gSrb6d(93), min)) + 1))).join(' '))) + '^');
        };
    }
    {
        __statement_M7D$Sj(94);
        var ignoredRef = /\(\?\!|\(\?\:|\?\=/;
    }
    {
        __statement_M7D$Sj(95);
        _.findSubCapture = function (regStr) {
            __block_shFsvx(14);
            {
                __statement_M7D$Sj(96);
                var left = 0, right = 0, len = regStr.length, ignored = (__expression_gSrb6d(97), __extro_fisLx0(98, __intro_O4leMl(98, regStr).split(ignoredRef)).length - 1);
            }
            for (; __expression_gSrb6d(99), len--;) {
                __block_shFsvx(15);
                {
                    __statement_M7D$Sj(100);
                    var letter = __extro_fisLx0(101, __intro_O4leMl(101, regStr).charAt(len));
                }
                if (__expression_gSrb6d(102), (__expression_gSrb6d(103), (__expression_gSrb6d(104), (__expression_gSrb6d(105), len) === 0) || (__expression_gSrb6d(106), __extro_fisLx0(107, __intro_O4leMl(107, regStr).charAt((__expression_gSrb6d(108), (__expression_gSrb6d(109), len) - 1))) !== '\\')) || (__expression_gSrb6d(110), __extro_fisLx0(111, __intro_O4leMl(111, regStr).charAt((__expression_gSrb6d(112), (__expression_gSrb6d(113), len) + 1))) !== '?')) {
                    __block_shFsvx(16);
                    if (__expression_gSrb6d(114), (__expression_gSrb6d(115), letter) === '(') {
                        __block_shFsvx(17);
                        {
                            __statement_M7D$Sj(116);
                            __expression_gSrb6d(117), left++;
                        }
                    }
                    if (__expression_gSrb6d(118), (__expression_gSrb6d(119), letter) === ')') {
                        __block_shFsvx(18);
                        {
                            __statement_M7D$Sj(120);
                            __expression_gSrb6d(121), right++;
                        }
                    }
                }
            }
            if (__expression_gSrb6d(122), (__expression_gSrb6d(123), left) !== (__expression_gSrb6d(124), right)) {
                __block_shFsvx(19);
                {
                    __statement_M7D$Sj(125);
                    throw __expression_gSrb6d(126), (__expression_gSrb6d(127), 'RegExp: ' + (__expression_gSrb6d(128), regStr)) + '\'s bracket is not marched';
                }
            } else {
                __block_shFsvx(20);
                return __expression_gSrb6d(129), (__expression_gSrb6d(130), (__expression_gSrb6d(131), left) - (__expression_gSrb6d(132), ignored));
            }
        };
    }
    {
        __statement_M7D$Sj(133);
        _.assert = function (test, msg) {
            __block_shFsvx(21);
            if (__expression_gSrb6d(134), !(__expression_gSrb6d(135), test)) {
                __block_shFsvx(22);
                {
                    __statement_M7D$Sj(136);
                    throw msg;
                }
            }
            return __expression_gSrb6d(137), true;
        };
    }
}());
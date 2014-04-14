
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_pF5P6$, __expression_SneOuN, __block_r_OKk9;
    var store = require('/home/code/terminator/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_pF5P6$ = function(i) {
        var fd = store.register('/home/code/terminator/src/parser/lexer.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_SneOuN = function(i) {
        var fd = store.register('/home/code/terminator/src/parser/lexer.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_r_OKk9 = function(i) {
        var fd = store.register('/home/code/terminator/src/parser/lexer.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_O8OCWI = function(id, obj) {
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
    __extro_vTawF1 = function(id, obj) {
        var fd = store.register('/home/code/terminator/src/parser/lexer.js');
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
        __statement_pF5P6$(0);
        var _ = (__expression_SneOuN(1), require('../util.js'));
    }
    function wrapHander(handler) {
        __block_r_OKk9(0);
        return __expression_SneOuN(2), function (all) {
            __block_r_OKk9(1);
            return __expression_SneOuN(3), {
                type: handler,
                value: all
            };
        };
    }
    function wrapKeyValue(key, num) {
        __block_r_OKk9(2);
        return __expression_SneOuN(4), function () {
            __block_r_OKk9(3);
            return __expression_SneOuN(5), {
                type: key,
                value: arguments[num]
            };
        };
    }
    function Lexer(input, opts) {
        __block_r_OKk9(4);
        {
            __statement_pF5P6$(6);
            this.input = __extro_vTawF1(7, __intro_O8OCWI(7, (__expression_SneOuN(8), (__expression_SneOuN(9), input) || '')).trim());
        }
        {
            __statement_pF5P6$(10);
            this.opts = (__expression_SneOuN(11), (__expression_SneOuN(12), opts) || {});
        }
        {
            __statement_pF5P6$(13);
            this.map = (__expression_SneOuN(16), this.opts.mode != 2) ? (__expression_SneOuN(14), map1) : (__expression_SneOuN(15), map2);
        }
    }
    {
        __statement_pF5P6$(17);
        var lo = Lexer.prototype;
    }
    {
        __statement_pF5P6$(18);
        lo.skipspace = function (str) {
            __block_r_OKk9(5);
            {
                __statement_pF5P6$(19);
                var index = 0, ch, input = str;
            }
            {
                __statement_pF5P6$(20);
                ch = __extro_vTawF1(21, __intro_O8OCWI(21, input).charCodeAt(index));
            }
            while (__expression_SneOuN(22), (__expression_SneOuN(23), ch) && (__expression_SneOuN(24), (__expression_SneOuN(25), (__expression_SneOuN(26), (__expression_SneOuN(27), (__expression_SneOuN(28), (__expression_SneOuN(29), ch) === 32) || (__expression_SneOuN(30), (__expression_SneOuN(31), ch) === 13)) || (__expression_SneOuN(32), (__expression_SneOuN(33), ch) === 10)) || (__expression_SneOuN(34), (__expression_SneOuN(35), ch) === 8232)) || (__expression_SneOuN(36), (__expression_SneOuN(37), ch) === 8233))) {
                __block_r_OKk9(6);
                {
                    __statement_pF5P6$(38);
                    __expression_SneOuN(39), index++;
                }
                {
                    __statement_pF5P6$(40);
                    ch = __extro_vTawF1(41, __intro_O8OCWI(41, input).charCodeAt(index));
                }
            }
            {
                __statement_pF5P6$(42);
                this.index += index;
            }
            return __expression_SneOuN(43), __extro_vTawF1(44, __intro_O8OCWI(44, str).slice(index));
        };
    }
    {
        __statement_pF5P6$(45);
        lo.lex = function (str) {
            __block_r_OKk9(7);
            {
                __statement_pF5P6$(46);
                str = __extro_vTawF1(47, __intro_O8OCWI(47, (__expression_SneOuN(48), (__expression_SneOuN(49), str) || this.input)).trim());
            }
            {
                __statement_pF5P6$(50);
                var tokens = [], remain = this.input = str, TRUNK, split, test, mlen, token, state;
            }
            {
                __statement_pF5P6$(51);
                this.index = 0;
            }
            {
                __statement_pF5P6$(52);
                this.states = [
                    'INIT'
                ];
            }
            while (__expression_SneOuN(53), str) {
                __block_r_OKk9(8);
                {
                    __statement_pF5P6$(54);
                    state = __extro_vTawF1(55, __intro_O8OCWI(55, this).state());
                }
                {
                    __statement_pF5P6$(56);
                    split = this.map[state];
                }
                {
                    __statement_pF5P6$(57);
                    test = __extro_vTawF1(58, __intro_O8OCWI(58, split.TRUNK).exec(str));
                }
                if (__expression_SneOuN(59), !(__expression_SneOuN(60), test)) {
                    __block_r_OKk9(9);
                    {
                        __statement_pF5P6$(61);
                        __extro_vTawF1(62, __intro_O8OCWI(62, console).log(tokens));
                    }
                    {
                        __statement_pF5P6$(63);
                        __extro_vTawF1(64, __intro_O8OCWI(64, this).error('Unrecoginized Token'));
                    }
                }
                {
                    __statement_pF5P6$(65);
                    mlen = test[0].length;
                }
                {
                    __statement_pF5P6$(66);
                    token = __extro_vTawF1(67, __intro_O8OCWI(67, this._process).call(this, test, split));
                }
                if (__expression_SneOuN(68), token) {
                    __block_r_OKk9(10);
                    {
                        __statement_pF5P6$(69);
                        __extro_vTawF1(70, __intro_O8OCWI(70, tokens).push(token));
                    }
                }
                {
                    __statement_pF5P6$(71);
                    this.index += mlen;
                }
                {
                    __statement_pF5P6$(72);
                    str = __extro_vTawF1(73, __intro_O8OCWI(73, str).slice(mlen));
                }
            }
            {
                __statement_pF5P6$(74);
                __extro_vTawF1(75, __intro_O8OCWI(75, tokens).push({
                    type: 'EOF'
                }));
            }
            return __expression_SneOuN(76), tokens;
        };
    }
    {
        __statement_pF5P6$(77);
        lo.next = function () {
            __block_r_OKk9(11);
            {
                __statement_pF5P6$(78);
                var split = this.map[__extro_vTawF1(79, __intro_O8OCWI(79, this).state())];
            }
            {
                __statement_pF5P6$(80);
                var test = __extro_vTawF1(81, __intro_O8OCWI(81, split.TRUNK).exec(str));
            }
            if (__expression_SneOuN(82), !(__expression_SneOuN(83), test)) {
                __block_r_OKk9(12);
                {
                    __statement_pF5P6$(84);
                    __extro_vTawF1(85, __intro_O8OCWI(85, this).error('Unrecoginized Token'));
                }
            }
            {
                __statement_pF5P6$(86);
                var mlen = test[0].length;
            }
            {
                __statement_pF5P6$(87);
                var token = __extro_vTawF1(88, __intro_O8OCWI(88, this._process).apply(this, test));
            }
            {
                __statement_pF5P6$(89);
                this.input = __extro_vTawF1(90, __intro_O8OCWI(90, this.input).slice(mlen));
            }
            return __expression_SneOuN(91), token;
        };
    }
    {
        __statement_pF5P6$(92);
        lo.error = function (msg) {
            __block_r_OKk9(13);
            {
                __statement_pF5P6$(93);
                throw __expression_SneOuN(94), (__expression_SneOuN(95), (__expression_SneOuN(96), 'Parse Error: ' + (__expression_SneOuN(97), msg)) + ':\n') + __extro_vTawF1(98, __intro_O8OCWI(98, _).trackErrorPos(this.input, this.index));
            }
        };
    }
    {
        __statement_pF5P6$(99);
        lo._process = function (args, split) {
            __block_r_OKk9(14);
            {
                __statement_pF5P6$(100);
                var links = split.links;
            }
            for (var len = links.length, i = 0; __expression_SneOuN(101), (__expression_SneOuN(102), i) < (__expression_SneOuN(103), len); __expression_SneOuN(104), i++) {
                __block_r_OKk9(15);
                {
                    __statement_pF5P6$(105);
                    var link = links[i], handler = link[2], index = link[0];
                }
                if (__expression_SneOuN(106), args[index] != (__expression_SneOuN(107), undefined)) {
                    __block_r_OKk9(16);
                    if (__expression_SneOuN(108), handler) {
                        __block_r_OKk9(17);
                        {
                            __statement_pF5P6$(109);
                            var token = __extro_vTawF1(110, __intro_O8OCWI(110, handler).apply(this, __extro_vTawF1(111, __intro_O8OCWI(111, args).slice(index, (__expression_SneOuN(112), (__expression_SneOuN(113), index) + link[1])))));
                        }
                        if (__expression_SneOuN(114), token) {
                            __block_r_OKk9(18);
                            {
                                __statement_pF5P6$(115);
                                token.pos = this.index;
                            }
                        }
                    }
                    break;
                }
            }
            return __expression_SneOuN(116), token;
        };
    }
    {
        __statement_pF5P6$(117);
        lo.addRule = function (rules, forbid) {
            __block_r_OKk9(19);
        };
    }
    {
        __statement_pF5P6$(118);
        lo.enter = function (state) {
            __block_r_OKk9(20);
            {
                __statement_pF5P6$(119);
                __extro_vTawF1(120, __intro_O8OCWI(120, this.states).push(state));
            }
            return __expression_SneOuN(121), this;
        };
    }
    {
        __statement_pF5P6$(122);
        lo.state = function () {
            __block_r_OKk9(21);
            {
                __statement_pF5P6$(123);
                var states = this.states;
            }
            return __expression_SneOuN(124), states[__expression_SneOuN(125), states.length - 1];
        };
    }
    {
        __statement_pF5P6$(126);
        lo.leave = function () {
            __block_r_OKk9(22);
            {
                __statement_pF5P6$(127);
                __extro_vTawF1(128, __intro_O8OCWI(128, this.states).pop());
            }
        };
    }
    {
        __statement_pF5P6$(129);
        var macro = {
                'BEGIN': '{',
                'END': '}',
                'NAME': /(?:[:_A-Za-z][-\.:_0-9A-Za-z]*)/,
                'IDENT': /[\$_A-Za-z][-_0-9A-Za-z\$]*/
            };
    }
    function genMap(rules) {
        __block_r_OKk9(23);
        {
            __statement_pF5P6$(130);
            var rule, map = {}, sign;
        }
        for (var i = 0, len = rules.length; __expression_SneOuN(131), (__expression_SneOuN(132), i) < (__expression_SneOuN(133), len); __expression_SneOuN(134), i++) {
            __block_r_OKk9(24);
            {
                __statement_pF5P6$(135);
                rule = rules[i];
            }
            {
                __statement_pF5P6$(136);
                sign = (__expression_SneOuN(137), rule[2] || 'INIT');
            }
            {
                __statement_pF5P6$(138);
                __extro_vTawF1(139, __intro_O8OCWI(139, (__expression_SneOuN(140), map[sign] || (map[sign] = {
                    rules: [],
                    links: []
                })).rules).push(rule));
            }
        }
        return __expression_SneOuN(141), (__expression_SneOuN(142), setup(map));
    }
    function setup(map) {
        __block_r_OKk9(25);
        {
            __statement_pF5P6$(143);
            var split, rules, trunks, handler, reg, retain;
        }
        for (var i in map) {
            __block_r_OKk9(26);
            {
                __statement_pF5P6$(144);
                split = map[i];
            }
            {
                __statement_pF5P6$(145);
                split.curIndex = 1;
            }
            {
                __statement_pF5P6$(146);
                rules = split.rules;
            }
            {
                __statement_pF5P6$(147);
                trunks = [];
            }
            for (var i = 0, len = rules.length; __expression_SneOuN(148), (__expression_SneOuN(149), i) < (__expression_SneOuN(150), len); __expression_SneOuN(151), i++) {
                __block_r_OKk9(27);
                {
                    __statement_pF5P6$(152);
                    rule = rules[i];
                }
                {
                    __statement_pF5P6$(153);
                    reg = rule[0];
                }
                {
                    __statement_pF5P6$(154);
                    handler = rule[1];
                }
                if (__expression_SneOuN(155), (__expression_SneOuN(156), typeof handler) == 'string') {
                    __block_r_OKk9(28);
                    if (__expression_SneOuN(157), ~__extro_vTawF1(158, __intro_O8OCWI(158, handler).indexOf(':'))) {
                        __block_r_OKk9(29);
                        {
                            __statement_pF5P6$(159);
                            var tmp = __extro_vTawF1(160, __intro_O8OCWI(160, handler).split(':'));
                        }
                        {
                            __statement_pF5P6$(161);
                            var key = tmp[0], value = (__expression_SneOuN(162), parseInt(__extro_vTawF1(163, __intro_O8OCWI(163, tmp[1]).replace('$', ''))));
                        }
                        {
                            __statement_pF5P6$(164);
                            handler = (__expression_SneOuN(165), wrapKeyValue(key, value));
                        }
                    } else {
                        __block_r_OKk9(30);
                        {
                            __statement_pF5P6$(166);
                            handler = (__expression_SneOuN(167), wrapHander(handler));
                        }
                    }
                }
                if (__expression_SneOuN(168), __extro_vTawF1(169, __intro_O8OCWI(169, _).typeOf(reg)) == 'regexp') {
                    __block_r_OKk9(31);
                    {
                        __statement_pF5P6$(170);
                        reg = __extro_vTawF1(171, __intro_O8OCWI(171, __extro_vTawF1(172, __intro_O8OCWI(172, reg).toString())).slice(1, (__expression_SneOuN(173), -1)));
                    }
                }
                {
                    __statement_pF5P6$(174);
                    reg = __extro_vTawF1(175, __intro_O8OCWI(175, reg).replace(/\{(\w+)\}/g, function (all, one) {
                        __block_r_OKk9(32);
                        return __expression_SneOuN(176), (__expression_SneOuN(179), (__expression_SneOuN(180), typeof macro[one]) == 'string') ? (__expression_SneOuN(177), (__expression_SneOuN(181), escapeRegExp(macro[one]))) : (__expression_SneOuN(178), __extro_vTawF1(182, __intro_O8OCWI(182, (__expression_SneOuN(183), String(macro[one]))).slice(1, (__expression_SneOuN(184), -1))));
                    }));
                }
                {
                    __statement_pF5P6$(185);
                    retain = (__expression_SneOuN(186), __extro_vTawF1(187, __intro_O8OCWI(187, _).findSubCapture(reg)) + 1);
                }
                {
                    __statement_pF5P6$(188);
                    __extro_vTawF1(189, __intro_O8OCWI(189, split.links).push([
                        split.curIndex,
                        retain,
                        handler
                    ]));
                }
                {
                    __statement_pF5P6$(190);
                    split.curIndex += retain;
                }
                {
                    __statement_pF5P6$(191);
                    __extro_vTawF1(192, __intro_O8OCWI(192, trunks).push(reg));
                }
            }
            {
                __statement_pF5P6$(193);
                split.TRUNK = new RegExp((__expression_SneOuN(194), (__expression_SneOuN(195), '^(?:(' + __extro_vTawF1(196, __intro_O8OCWI(196, trunks).join(')|('))) + '))'));
            }
        }
        return __expression_SneOuN(197), map;
    }
    {
        __statement_pF5P6$(198);
        var rules = {
                COMMENT: [
                    /<!--([^\x00]*?)-->/
                ],
                ENTER_JST: [
                    /[^\x00\<]*?(?={BEGIN})/,
                    function (all, one) {
                        __block_r_OKk9(33);
                        {
                            __statement_pF5P6$(199);
                            __extro_vTawF1(200, __intro_O8OCWI(200, this).enter('JST'));
                        }
                        if (__expression_SneOuN(201), all) {
                            __block_r_OKk9(34);
                            return __expression_SneOuN(202), {
                                type: 'TEXT',
                                value: all
                            };
                        }
                    }
                ],
                ENTER_JST2: [
                    /[^\x00]*?(?={BEGIN})/,
                    function (all, one) {
                        __block_r_OKk9(35);
                        {
                            __statement_pF5P6$(203);
                            __extro_vTawF1(204, __intro_O8OCWI(204, this).enter('JST'));
                        }
                        if (__expression_SneOuN(205), all) {
                            __block_r_OKk9(36);
                            return __expression_SneOuN(206), {
                                type: 'TEXT',
                                value: all
                            };
                        }
                    }
                ],
                ENTER_TAG: [
                    /[^\x00<>]*?(?=<)/,
                    function (all) {
                        __block_r_OKk9(37);
                        {
                            __statement_pF5P6$(207);
                            __extro_vTawF1(208, __intro_O8OCWI(208, this).enter('TAG'));
                        }
                        if (__expression_SneOuN(209), all) {
                            __block_r_OKk9(38);
                            return __expression_SneOuN(210), {
                                type: 'TEXT',
                                value: all
                            };
                        }
                    }
                ],
                TEXT: [
                    /[^\x00]+/,
                    'TEXT'
                ],
                TAG_NAME: [
                    /{NAME}/,
                    'NAME',
                    'TAG'
                ],
                TAG_OPEN: [
                    /<({NAME})\s*/,
                    function (all, one) {
                        __block_r_OKk9(39);
                        return __expression_SneOuN(211), {
                            type: 'TAG_OPEN',
                            value: one
                        };
                    },
                    'TAG'
                ],
                TAG_CLOSE: [
                    /<\/({NAME})[\r\n\f ]*>/,
                    function (all, one) {
                        __block_r_OKk9(40);
                        {
                            __statement_pF5P6$(212);
                            __extro_vTawF1(213, __intro_O8OCWI(213, this).leave());
                        }
                        return __expression_SneOuN(214), {
                            type: 'TAG_CLOSE',
                            value: one
                        };
                    },
                    'TAG'
                ],
                TAG_ENTER_JST: [
                    /(?={BEGIN})/,
                    function (all, one) {
                        __block_r_OKk9(41);
                        {
                            __statement_pF5P6$(215);
                            __extro_vTawF1(216, __intro_O8OCWI(216, this).enter('JST'));
                        }
                    },
                    'TAG'
                ],
                TAG_PUNCHOR: [
                    /[>\/=]/,
                    function (all) {
                        __block_r_OKk9(42);
                        if (__expression_SneOuN(217), (__expression_SneOuN(218), all) === '>') {
                            __block_r_OKk9(43);
                            {
                                __statement_pF5P6$(219);
                                __extro_vTawF1(220, __intro_O8OCWI(220, this).leave());
                            }
                        }
                        return __expression_SneOuN(221), {
                            type: all,
                            value: all
                        };
                    },
                    'TAG'
                ],
                TAG_SPACE: [
                    /[ \r\n\f]+/,
                    null,
                    'TAG'
                ],
                JST_COMMENT: [
                    /{!([^\x00]*?)!}/,
                    null,
                    'JST'
                ],
                JST_OPEN: [
                    '{BEGIN}s*({IDENT})',
                    function (all, name) {
                        __block_r_OKk9(44);
                        return __expression_SneOuN(222), {
                            type: 'OPEN',
                            value: name
                        };
                    },
                    'JST'
                ],
                JST_LEAVE: [
                    /{END}/,
                    function () {
                        __block_r_OKk9(45);
                        {
                            __statement_pF5P6$(223);
                            __extro_vTawF1(224, __intro_O8OCWI(224, this).leave('JST'));
                        }
                        return __expression_SneOuN(225), {
                            type: 'END'
                        };
                    },
                    'JST'
                ],
                JST_EXPR_OPEN: [
                    '{BEGIN}([=-])',
                    function (one) {
                        __block_r_OKk9(46);
                        {
                            __statement_pF5P6$(226);
                            var escape = (__expression_SneOuN(227), (__expression_SneOuN(228), one) == '=');
                        }
                        return __expression_SneOuN(229), {
                            type: 'EXPR_OPEN',
                            escape: escape
                        };
                    },
                    'JST'
                ],
                JST_CLOSE: [
                    /{BEGIN}\s*\/\s*({IDENT})\s*{END}/,
                    function (all, one) {
                        __block_r_OKk9(47);
                        {
                            __statement_pF5P6$(230);
                            __extro_vTawF1(231, __intro_O8OCWI(231, this).leave('JST'));
                        }
                        return __expression_SneOuN(232), {
                            type: 'CLOSE',
                            value: one
                        };
                    },
                    'JST'
                ],
                JST_IDENT: [
                    '{IDENT}',
                    'IDENT',
                    'JST'
                ],
                JST_SPACE: [
                    /[ \r\n\f]+/,
                    null,
                    'JST'
                ],
                JST_PUNCHOR: [
                    /[=!]?==|[-=><+*\/%]?\=|\|\||&&|[\<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!,#]/,
                    function (all) {
                        __block_r_OKk9(48);
                        return __expression_SneOuN(233), {
                            type: all,
                            value: all
                        };
                    },
                    'JST'
                ],
                JST_STRING: [
                    /'([^']*)'|"([^"]*)"/,
                    function (all, one, two) {
                        __block_r_OKk9(49);
                        return __expression_SneOuN(234), {
                            type: 'STRING',
                            value: (__expression_SneOuN(235), (__expression_SneOuN(236), one) || (__expression_SneOuN(237), two))
                        };
                    },
                    'JST'
                ],
                JST_NUMBER: [
                    /[0-9]*\.[0-9]+|[0-9]+/,
                    function (all) {
                        __block_r_OKk9(50);
                        {
                            __statement_pF5P6$(238);
                            var value;
                        }
                        if (__expression_SneOuN(239), (__expression_SneOuN(240), (__expression_SneOuN(241), typeof (value = (__expression_SneOuN(242), parseInt(all)))) == 'number') && (__expression_SneOuN(243), (__expression_SneOuN(244), value) === (__expression_SneOuN(245), value))) {
                            __block_r_OKk9(51);
                            return __expression_SneOuN(246), {
                                type: 'NUMBER',
                                value: value
                            };
                        }
                    },
                    'JST'
                ]
            };
    }
    {
        __statement_pF5P6$(247);
        var map1 = (__expression_SneOuN(248), genMap([
                rules.COMMENT,
                rules.ENTER_JST,
                rules.ENTER_TAG,
                rules.TEXT,
                rules.TAG_NAME,
                rules.TAG_OPEN,
                rules.TAG_CLOSE,
                rules.TAG_PUNCHOR,
                rules.TAG_ENTER_JST,
                rules.TAG_SPACE,
                rules.JST_OPEN,
                rules.JST_EXPR_OPEN,
                rules.JST_IDENT,
                rules.JST_SPACE,
                rules.JST_LEAVE,
                rules.JST_CLOSE,
                rules.JST_NUMBER,
                rules.JST_PUNCHOR,
                rules.JST_STRING,
                rules.JST_COMMENT
            ]));
    }
    {
        __statement_pF5P6$(249);
        var map2 = (__expression_SneOuN(250), genMap([
                rules.ENTER_JST2,
                rules.TEXT,
                rules.JST_OPEN,
                rules.JST_EXPR_OPEN,
                rules.JST_IDENT,
                rules.JST_SPACE,
                rules.JST_LEAVE,
                rules.JST_CLOSE,
                rules.JST_NUMBER,
                rules.JST_PUNCHOR,
                rules.JST_STRING,
                rules.JST_COMMENT
            ]));
    }
    function escapeRegExp(string) {
        __block_r_OKk9(52);
        return __expression_SneOuN(251), __extro_vTawF1(252, __intro_O8OCWI(252, string).replace(/[-[\]{}()*+?.\\^$|,#\s]/g, function (match) {
            __block_r_OKk9(53);
            return __expression_SneOuN(253), (__expression_SneOuN(254), '\\' + (__expression_SneOuN(255), match));
        }));
    }
    ;
    {
        __statement_pF5P6$(256);
        module.exports = Lexer;
    }
}());
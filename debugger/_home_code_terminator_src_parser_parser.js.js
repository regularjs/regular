
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_MCXHfp, __expression_WDkJkb, __block_XkF_pV;
    var store = require('/home/code/terminator/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_MCXHfp = function(i) {
        var fd = store.register('/home/code/terminator/src/parser/parser.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_WDkJkb = function(i) {
        var fd = store.register('/home/code/terminator/src/parser/parser.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_XkF_pV = function(i) {
        var fd = store.register('/home/code/terminator/src/parser/parser.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_jlMIAZ = function(id, obj) {
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
    __extro_$K0h0L = function(id, obj) {
        var fd = store.register('/home/code/terminator/src/parser/parser.js');
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
        __statement_MCXHfp(0);
        var _ = (__expression_WDkJkb(1), require('../util.js'));
    }
    {
        __statement_MCXHfp(2);
        var node = (__expression_WDkJkb(3), require('./node.js'));
    }
    {
        __statement_MCXHfp(4);
        var Lexer = (__expression_WDkJkb(5), require('./lexer.js'));
    }
    function Parser(input, opts) {
        __block_XkF_pV(0);
        {
            __statement_MCXHfp(6);
            opts = (__expression_WDkJkb(7), (__expression_WDkJkb(8), opts) || {});
        }
        {
            __statement_MCXHfp(9);
            this.input = input;
        }
        {
            __statement_MCXHfp(10);
            this.tokens = __extro_$K0h0L(11, __intro_jlMIAZ(11, new Lexer(input, opts)).lex());
        }
        {
            __statement_MCXHfp(12);
            this.pos = 0;
        }
        {
            __statement_MCXHfp(13);
            this.length = this.tokens.length;
        }
    }
    {
        __statement_MCXHfp(14);
        var op = Parser.prototype;
    }
    {
        __statement_MCXHfp(15);
        op.parse = function () {
            __block_XkF_pV(1);
            {
                __statement_MCXHfp(16);
                this.pos = 0;
            }
            return __expression_WDkJkb(17), __extro_$K0h0L(18, __intro_jlMIAZ(18, this).program());
        };
    }
    {
        __statement_MCXHfp(19);
        op.ll = function (k) {
            __block_XkF_pV(2);
            {
                __statement_MCXHfp(20);
                k = (__expression_WDkJkb(21), (__expression_WDkJkb(22), k) || 1);
            }
            if (__expression_WDkJkb(23), (__expression_WDkJkb(24), k) < 0) {
                __block_XkF_pV(3);
                {
                    __statement_MCXHfp(25);
                    k = (__expression_WDkJkb(26), (__expression_WDkJkb(27), k) + 1);
                }
            }
            {
                __statement_MCXHfp(28);
                var pos = (__expression_WDkJkb(29), (__expression_WDkJkb(30), this.pos + (__expression_WDkJkb(31), k)) - 1);
            }
            if (__expression_WDkJkb(32), (__expression_WDkJkb(33), pos) > (__expression_WDkJkb(34), this.length - 1)) {
                __block_XkF_pV(4);
                return __expression_WDkJkb(35), this.tokens[__expression_WDkJkb(36), this.length - 1];
            }
            return __expression_WDkJkb(37), this.tokens[pos];
        };
    }
    {
        __statement_MCXHfp(38);
        op.la = function (k, value) {
            __block_XkF_pV(5);
            return __expression_WDkJkb(39), (__expression_WDkJkb(40), __extro_$K0h0L(41, __intro_jlMIAZ(41, this).ll(k)) || '').type;
        };
    }
    {
        __statement_MCXHfp(42);
        op.match = function (type, value) {
            __block_XkF_pV(6);
            if (__expression_WDkJkb(43), !(ll = __extro_$K0h0L(44, __intro_jlMIAZ(44, this).eat(type, value)))) {
                __block_XkF_pV(7);
                {
                    __statement_MCXHfp(45);
                    var ll = __extro_$K0h0L(46, __intro_jlMIAZ(46, this).ll());
                }
                {
                    __statement_MCXHfp(47);
                    __extro_$K0h0L(48, __intro_jlMIAZ(48, this).error((__expression_WDkJkb(49), (__expression_WDkJkb(50), (__expression_WDkJkb(51), (__expression_WDkJkb(52), (__expression_WDkJkb(53), (__expression_WDkJkb(54), 'expect [' + (__expression_WDkJkb(55), type)) + ((__expression_WDkJkb(58), (__expression_WDkJkb(59), value) == null) ? (__expression_WDkJkb(56), '') : (__expression_WDkJkb(57), (__expression_WDkJkb(60), ':' + (__expression_WDkJkb(61), value))))) + ']" -> got "[') + ll.type) + ((__expression_WDkJkb(64), (__expression_WDkJkb(65), value) == null) ? (__expression_WDkJkb(62), '') : (__expression_WDkJkb(63), (__expression_WDkJkb(66), ':' + ll.value)))) + ']'), ll.pos));
                }
            } else {
                __block_XkF_pV(8);
                return __expression_WDkJkb(67), ll;
            }
        };
    }
    {
        __statement_MCXHfp(68);
        op.error = function (msg, pos) {
            __block_XkF_pV(9);
            {
                __statement_MCXHfp(69);
                throw __expression_WDkJkb(70), (__expression_WDkJkb(71), (__expression_WDkJkb(72), 'Parse Error: ' + (__expression_WDkJkb(73), msg)) + ':\n') + __extro_$K0h0L(74, __intro_jlMIAZ(74, _).trackErrorPos(this.input, (__expression_WDkJkb(77), (__expression_WDkJkb(78), pos) != null) ? (__expression_WDkJkb(75), pos) : (__expression_WDkJkb(76), __extro_$K0h0L(79, __intro_jlMIAZ(79, this).ll()).pos)));
            }
        };
    }
    {
        __statement_MCXHfp(80);
        op.next = function (k) {
            __block_XkF_pV(10);
            {
                __statement_MCXHfp(81);
                k = (__expression_WDkJkb(82), (__expression_WDkJkb(83), k) || 1);
            }
            {
                __statement_MCXHfp(84);
                this.pos += k;
            }
        };
    }
    {
        __statement_MCXHfp(85);
        op.eat = function (type, value) {
            __block_XkF_pV(11);
            {
                __statement_MCXHfp(86);
                var ll = __extro_$K0h0L(87, __intro_jlMIAZ(87, this).ll());
            }
            if (__expression_WDkJkb(88), (__expression_WDkJkb(89), typeof type) !== 'string') {
                __block_XkF_pV(12);
                for (var len = type.length; __expression_WDkJkb(90), len--;) {
                    __block_XkF_pV(13);
                    if (__expression_WDkJkb(91), ll.type == type[len]) {
                        __block_XkF_pV(14);
                        {
                            __statement_MCXHfp(92);
                            __extro_$K0h0L(93, __intro_jlMIAZ(93, this).next());
                        }
                        return __expression_WDkJkb(94), ll;
                    }
                }
            } else {
                __block_XkF_pV(15);
                if (__expression_WDkJkb(95), (__expression_WDkJkb(96), ll.type == (__expression_WDkJkb(97), type)) && (__expression_WDkJkb(98), (__expression_WDkJkb(99), (__expression_WDkJkb(100), typeof value) == 'undefined') || (__expression_WDkJkb(101), ll.value == (__expression_WDkJkb(102), value)))) {
                    __block_XkF_pV(16);
                    {
                        __statement_MCXHfp(103);
                        __extro_$K0h0L(104, __intro_jlMIAZ(104, this).next());
                    }
                    return __expression_WDkJkb(105), ll;
                }
            }
            return __expression_WDkJkb(106), false;
        };
    }
    {
        __statement_MCXHfp(107);
        op.isEmpty = function (value) {
            __block_XkF_pV(17);
            return __expression_WDkJkb(108), (__expression_WDkJkb(109), (__expression_WDkJkb(110), !(__expression_WDkJkb(111), value)) || value.length);
        };
    }
    {
        __statement_MCXHfp(112);
        op.program = function () {
            __block_XkF_pV(18);
            {
                __statement_MCXHfp(113);
                var statements = [], statement, ll = __extro_$K0h0L(114, __intro_jlMIAZ(114, this).ll());
            }
            while (__expression_WDkJkb(115), (__expression_WDkJkb(116), ll.type !== 'EOF') && (__expression_WDkJkb(117), ll.type !== 'TAG_CLOSE')) {
                __block_XkF_pV(19);
                {
                    __statement_MCXHfp(118);
                    __extro_$K0h0L(119, __intro_jlMIAZ(119, statements).push(__extro_$K0h0L(120, __intro_jlMIAZ(120, this).statement())));
                }
                {
                    __statement_MCXHfp(121);
                    ll = __extro_$K0h0L(122, __intro_jlMIAZ(122, this).ll());
                }
            }
            return __expression_WDkJkb(123), statements;
        };
    }
    {
        __statement_MCXHfp(124);
        op.statements = function (until) {
            __block_XkF_pV(20);
            {
                __statement_MCXHfp(125);
                var ll, body = [];
            }
            while (__expression_WDkJkb(126), !(ll = __extro_$K0h0L(127, __intro_jlMIAZ(127, this).eat('CLOSE', until)))) {
                __block_XkF_pV(21);
                {
                    __statement_MCXHfp(128);
                    __extro_$K0h0L(129, __intro_jlMIAZ(129, body).push(__extro_$K0h0L(130, __intro_jlMIAZ(130, this).statement())));
                }
            }
            return __expression_WDkJkb(131), body;
        };
    }
    {
        __statement_MCXHfp(132);
        op.statement = function () {
            __block_XkF_pV(22);
            {
                __statement_MCXHfp(133);
                var ll = __extro_$K0h0L(134, __intro_jlMIAZ(134, this).ll()), la;
            }
            switch (ll.type) {
            case 'NAME':
            case 'TEXT': {
                    __block_XkF_pV(23);
                    {
                        __statement_MCXHfp(135);
                        var text = ll.value;
                    }
                    {
                        __statement_MCXHfp(136);
                        __extro_$K0h0L(137, __intro_jlMIAZ(137, this).next());
                    }
                    while (ll = __extro_$K0h0L(138, __intro_jlMIAZ(138, this).eat([
                            'NAME',
                            'TEXT'
                        ]))) {
                        __block_XkF_pV(24);
                        {
                            __statement_MCXHfp(139);
                            text += ll.value;
                        }
                    }
                    return __expression_WDkJkb(140), text;
                }
            case 'TAG_OPEN': {
                    __block_XkF_pV(25);
                    return __expression_WDkJkb(141), __extro_$K0h0L(142, __intro_jlMIAZ(142, this).xml());
                }
            case 'OPEN': {
                    __block_XkF_pV(26);
                    return __expression_WDkJkb(143), __extro_$K0h0L(144, __intro_jlMIAZ(144, this).directive());
                }
            case 'EXPR_OPEN': {
                    __block_XkF_pV(27);
                    return __expression_WDkJkb(145), __extro_$K0h0L(146, __intro_jlMIAZ(146, this).inteplation());
                }
            default: {
                    __block_XkF_pV(28);
                    {
                        __statement_MCXHfp(147);
                        __extro_$K0h0L(148, __intro_jlMIAZ(148, this).error((__expression_WDkJkb(149), 'Unexpected token: ' + __extro_$K0h0L(150, __intro_jlMIAZ(150, this).la()))));
                    }
                }
            }
        };
    }
    {
        __statement_MCXHfp(151);
        op.xml = function () {
            __block_XkF_pV(29);
            {
                __statement_MCXHfp(152);
                var name, attrs, children, selfClosed;
            }
            {
                __statement_MCXHfp(153);
                name = __extro_$K0h0L(154, __intro_jlMIAZ(154, this).match('TAG_OPEN')).value;
            }
            {
                __statement_MCXHfp(155);
                attrs = __extro_$K0h0L(156, __intro_jlMIAZ(156, this).attrs());
            }
            {
                __statement_MCXHfp(157);
                selfClosed = __extro_$K0h0L(158, __intro_jlMIAZ(158, this).eat('/'));
            }
            {
                __statement_MCXHfp(159);
                __extro_$K0h0L(160, __intro_jlMIAZ(160, this).match('>'));
            }
            if (__expression_WDkJkb(161), !(__expression_WDkJkb(162), selfClosed)) {
                __block_XkF_pV(30);
                {
                    __statement_MCXHfp(163);
                    children = __extro_$K0h0L(164, __intro_jlMIAZ(164, this).program());
                }
                if (__expression_WDkJkb(165), !__extro_$K0h0L(166, __intro_jlMIAZ(166, this).eat('TAG_CLOSE', name))) {
                    __block_XkF_pV(31);
                    {
                        __statement_MCXHfp(167);
                        __extro_$K0h0L(168, __intro_jlMIAZ(168, this).error((__expression_WDkJkb(169), (__expression_WDkJkb(170), (__expression_WDkJkb(171), 'expect </' + (__expression_WDkJkb(172), name)) + '> got') + 'no matched closeTag')));
                    }
                }
            }
            return __expression_WDkJkb(173), __extro_$K0h0L(174, __intro_jlMIAZ(174, node).element(name, attrs, children));
        };
    }
    {
        __statement_MCXHfp(175);
        op.attrs = function () {
            __block_XkF_pV(32);
            {
                __statement_MCXHfp(176);
                var ll = __extro_$K0h0L(177, __intro_jlMIAZ(177, this).ll());
            }
            if (__expression_WDkJkb(178), ll.type !== 'NAME') {
                __block_XkF_pV(33);
                return __expression_WDkJkb(179);
            }
            {
                __statement_MCXHfp(180);
                var attrs = [], attr;
            }
            do {
                __block_XkF_pV(34);
                {
                    __statement_MCXHfp(181);
                    attr = {
                        name: ll.value
                    };
                }
                if (__extro_$K0h0L(182, __intro_jlMIAZ(182, this).eat('='))) {
                    __block_XkF_pV(35);
                    {
                        __statement_MCXHfp(183);
                        attr.value = __extro_$K0h0L(184, __intro_jlMIAZ(184, this).attvalue());
                    }
                }
                {
                    __statement_MCXHfp(185);
                    __extro_$K0h0L(186, __intro_jlMIAZ(186, attrs).push(attr));
                }
            } while (ll = __extro_$K0h0L(187, __intro_jlMIAZ(187, this).eat('NAME')));
        };
    }
    {
        __statement_MCXHfp(188);
        op.attvalue = function () {
            __block_XkF_pV(36);
            {
                __statement_MCXHfp(189);
                var ll = __extro_$K0h0L(190, __intro_jlMIAZ(190, this).ll());
            }
            switch (ll.type) {
            case 'NAME':
            case 'STRING': {
                    __block_XkF_pV(37);
                    {
                        __statement_MCXHfp(191);
                        __extro_$K0h0L(192, __intro_jlMIAZ(192, this).next());
                    }
                    return __expression_WDkJkb(193), ll.value;
                }
            case 'EXPR_OPEN': {
                    __block_XkF_pV(38);
                    return __expression_WDkJkb(194), __extro_$K0h0L(195, __intro_jlMIAZ(195, this).inteplation());
                }
            default: {
                    __block_XkF_pV(39);
                    {
                        __statement_MCXHfp(196);
                        __extro_$K0h0L(197, __intro_jlMIAZ(197, this).error((__expression_WDkJkb(198), 'Unexpected token: ' + __extro_$K0h0L(199, __intro_jlMIAZ(199, this).la()))));
                    }
                }
            }
            return __expression_WDkJkb(200), ll.value;
        };
    }
    {
        __statement_MCXHfp(201);
        op.directive = function (name) {
            __block_XkF_pV(40);
            {
                __statement_MCXHfp(202);
                name = (__expression_WDkJkb(203), (__expression_WDkJkb(204), name) || __extro_$K0h0L(205, __intro_jlMIAZ(205, this).ll()).value);
            }
            if (__expression_WDkJkb(206), (__expression_WDkJkb(207), typeof this[name]) == 'function') {
                __block_XkF_pV(41);
                return __expression_WDkJkb(208), __extro_$K0h0L(209, __intro_jlMIAZ(209, this)[name]());
            } else {
                __block_XkF_pV(42);
                {
                    __statement_MCXHfp(210);
                    __extro_$K0h0L(211, __intro_jlMIAZ(211, this).error((__expression_WDkJkb(212), (__expression_WDkJkb(213), 'Undefined directive[' + (__expression_WDkJkb(214), name)) + ']')));
                }
            }
        };
    }
    {
        __statement_MCXHfp(215);
        op.inteplation = function () {
            __block_XkF_pV(43);
            {
                __statement_MCXHfp(216);
                __extro_$K0h0L(217, __intro_jlMIAZ(217, this).match('EXPR_OPEN'));
            }
            {
                __statement_MCXHfp(218);
                var res = __extro_$K0h0L(219, __intro_jlMIAZ(219, this).filter());
            }
            {
                __statement_MCXHfp(220);
                __extro_$K0h0L(221, __intro_jlMIAZ(221, this).match('END'));
            }
            return __expression_WDkJkb(222), res;
        };
    }
    {
        __statement_MCXHfp(223);
        op.filter = function () {
            __block_XkF_pV(44);
            {
                __statement_MCXHfp(224);
                var left = __extro_$K0h0L(225, __intro_jlMIAZ(225, this).expr()), ll = __extro_$K0h0L(226, __intro_jlMIAZ(226, this).eat('|'));
            }
            if (__expression_WDkJkb(227), ll) {
                __block_XkF_pV(45);
                {
                    __statement_MCXHfp(228);
                    var filters = [], filter;
                }
                do {
                    __block_XkF_pV(46);
                    {
                        __statement_MCXHfp(229);
                        filter = {};
                    }
                    {
                        __statement_MCXHfp(230);
                        filter.name = __extro_$K0h0L(231, __intro_jlMIAZ(231, this).match('IDENT')).value;
                    }
                    {
                        __statement_MCXHfp(232);
                        filter.args = __extro_$K0h0L(233, __intro_jlMIAZ(233, this).arguments('|'));
                    }
                } while (ll = __extro_$K0h0L(234, __intro_jlMIAZ(234, this).eat('|')));
                return __expression_WDkJkb(235), __extro_$K0h0L(236, __intro_jlMIAZ(236, node).filter(left, filters));
            } else {
                __block_XkF_pV(47);
                return __expression_WDkJkb(237), left;
            }
        };
    }
    {
        __statement_MCXHfp(238);
        op.if = function () {
            __block_XkF_pV(48);
            {
                __statement_MCXHfp(239);
                __extro_$K0h0L(240, __intro_jlMIAZ(240, this).next());
            }
            {
                __statement_MCXHfp(241);
                var test = __extro_$K0h0L(242, __intro_jlMIAZ(242, this).expr());
            }
            {
                __statement_MCXHfp(243);
                var consequent = [], alternate = [];
            }
            {
                __statement_MCXHfp(244);
                var container = consequent;
            }
            {
                __statement_MCXHfp(245);
                __extro_$K0h0L(246, __intro_jlMIAZ(246, this).match('END'));
            }
            {
                __statement_MCXHfp(247);
                var ll, type, close;
            }
            while (__expression_WDkJkb(248), !(close = __extro_$K0h0L(249, __intro_jlMIAZ(249, this).eat('CLOSE')))) {
                __block_XkF_pV(49);
                {
                    __statement_MCXHfp(250);
                    ll = __extro_$K0h0L(251, __intro_jlMIAZ(251, this).ll());
                }
                if (__expression_WDkJkb(252), ll.type == 'OPEN') {
                    __block_XkF_pV(50);
                    switch (ll.value) {
                    case 'else': {
                            __block_XkF_pV(51);
                            {
                                __statement_MCXHfp(253);
                                container = alternate;
                            }
                            {
                                __statement_MCXHfp(254);
                                __extro_$K0h0L(255, __intro_jlMIAZ(255, this).next());
                            }
                            {
                                __statement_MCXHfp(256);
                                __extro_$K0h0L(257, __intro_jlMIAZ(257, this).match('END'));
                            }
                            break;
                        }
                    case 'elseif': {
                            __block_XkF_pV(52);
                            {
                                __statement_MCXHfp(258);
                                __extro_$K0h0L(259, __intro_jlMIAZ(259, alternate).push(__extro_$K0h0L(260, __intro_jlMIAZ(260, this).if())));
                            }
                            return __expression_WDkJkb(261), __extro_$K0h0L(262, __intro_jlMIAZ(262, node).if(test, consequent, alternate));
                        }
                    default: {
                            __block_XkF_pV(53);
                            {
                                __statement_MCXHfp(263);
                                __extro_$K0h0L(264, __intro_jlMIAZ(264, container).push(__extro_$K0h0L(265, __intro_jlMIAZ(265, this).statement())));
                            }
                        }
                    }
                } else {
                    __block_XkF_pV(54);
                    {
                        __statement_MCXHfp(266);
                        __extro_$K0h0L(267, __intro_jlMIAZ(267, container).push(__extro_$K0h0L(268, __intro_jlMIAZ(268, this).statement())));
                    }
                }
            }
            if (__expression_WDkJkb(269), close.value !== 'if') {
                __block_XkF_pV(55);
                {
                    __statement_MCXHfp(270);
                    __extro_$K0h0L(271, __intro_jlMIAZ(271, this).error('Unmatched if directive'));
                }
            }
            return __expression_WDkJkb(272), __extro_$K0h0L(273, __intro_jlMIAZ(273, node).if(test, consequent, alternate));
        };
    }
    {
        __statement_MCXHfp(274);
        op.list = function () {
            __block_XkF_pV(56);
            {
                __statement_MCXHfp(275);
                __extro_$K0h0L(276, __intro_jlMIAZ(276, this).next());
            }
            {
                __statement_MCXHfp(277);
                var sequence = __extro_$K0h0L(278, __intro_jlMIAZ(278, this).expr()), variable, body, ll;
            }
            {
                __statement_MCXHfp(279);
                var consequent = [], alternate = [];
            }
            {
                __statement_MCXHfp(280);
                var container = consequent;
            }
            {
                __statement_MCXHfp(281);
                __extro_$K0h0L(282, __intro_jlMIAZ(282, this).match('IDENT', 'as'));
            }
            {
                __statement_MCXHfp(283);
                variable = __extro_$K0h0L(284, __intro_jlMIAZ(284, this).match('IDENT')).value;
            }
            {
                __statement_MCXHfp(285);
                __extro_$K0h0L(286, __intro_jlMIAZ(286, this).match('END'));
            }
            while (__expression_WDkJkb(287), !(ll = __extro_$K0h0L(288, __intro_jlMIAZ(288, this).eat('CLOSE')))) {
                __block_XkF_pV(57);
                if (__extro_$K0h0L(289, __intro_jlMIAZ(289, this).eat('OPEN', 'else'))) {
                    __block_XkF_pV(58);
                    {
                        __statement_MCXHfp(290);
                        container = alternate;
                    }
                    {
                        __statement_MCXHfp(291);
                        __extro_$K0h0L(292, __intro_jlMIAZ(292, this).match('END'));
                    }
                } else {
                    __block_XkF_pV(59);
                    {
                        __statement_MCXHfp(293);
                        __extro_$K0h0L(294, __intro_jlMIAZ(294, container).push(__extro_$K0h0L(295, __intro_jlMIAZ(295, this).statement())));
                    }
                }
            }
            if (__expression_WDkJkb(296), ll.value !== 'list') {
                __block_XkF_pV(60);
                {
                    __statement_MCXHfp(297);
                    __extro_$K0h0L(298, __intro_jlMIAZ(298, this).error((__expression_WDkJkb(299), (__expression_WDkJkb(300), (__expression_WDkJkb(301), (__expression_WDkJkb(302), 'expect ' + '{/list} got ') + '{/') + ll.value) + '}'), ll.pos));
                }
            }
            return __expression_WDkJkb(303), __extro_$K0h0L(304, __intro_jlMIAZ(304, node).list(sequence, variable, consequent, alternate));
        };
    }
    {
        __statement_MCXHfp(305);
        op.expr = function () {
            __block_XkF_pV(61);
            return __expression_WDkJkb(306), __extro_$K0h0L(307, __intro_jlMIAZ(307, this).condition());
        };
    }
    {
        __statement_MCXHfp(308);
        op.condition = function () {
            __block_XkF_pV(62);
            {
                __statement_MCXHfp(309);
                var test = __extro_$K0h0L(310, __intro_jlMIAZ(310, this).or());
            }
            if (__extro_$K0h0L(311, __intro_jlMIAZ(311, this).eat('?'))) {
                __block_XkF_pV(63);
                {
                    __statement_MCXHfp(312);
                    var consequent = __extro_$K0h0L(313, __intro_jlMIAZ(313, this).assign());
                }
                {
                    __statement_MCXHfp(314);
                    __extro_$K0h0L(315, __intro_jlMIAZ(315, this).match(':'));
                }
                {
                    __statement_MCXHfp(316);
                    var alternate = __extro_$K0h0L(317, __intro_jlMIAZ(317, this).assign());
                }
                return __expression_WDkJkb(318), __extro_$K0h0L(319, __intro_jlMIAZ(319, node).condition(test, consequent, alternate));
            }
            return __expression_WDkJkb(320), test;
        };
    }
    {
        __statement_MCXHfp(321);
        op.or = function () {
            __block_XkF_pV(64);
            {
                __statement_MCXHfp(322);
                var left = __extro_$K0h0L(323, __intro_jlMIAZ(323, this).and());
            }
            if (__extro_$K0h0L(324, __intro_jlMIAZ(324, this).eat('||'))) {
                __block_XkF_pV(65);
                return __expression_WDkJkb(325), __extro_$K0h0L(326, __intro_jlMIAZ(326, node).logic('||', left, __extro_$K0h0L(327, __intro_jlMIAZ(327, this).or())));
            }
            return __expression_WDkJkb(328), left;
        };
    }
    {
        __statement_MCXHfp(329);
        op.and = function () {
            __block_XkF_pV(66);
            {
                __statement_MCXHfp(330);
                var left = __extro_$K0h0L(331, __intro_jlMIAZ(331, this).equal());
            }
            if (__extro_$K0h0L(332, __intro_jlMIAZ(332, this).eat('&&'))) {
                __block_XkF_pV(67);
                return __expression_WDkJkb(333), __extro_$K0h0L(334, __intro_jlMIAZ(334, node).logic('&&', left, __extro_$K0h0L(335, __intro_jlMIAZ(335, this).and())));
            }
            return __expression_WDkJkb(336), left;
        };
    }
    {
        __statement_MCXHfp(337);
        op.equal = function () {
            __block_XkF_pV(68);
            {
                __statement_MCXHfp(338);
                var left = __extro_$K0h0L(339, __intro_jlMIAZ(339, this).relation());
            }
            if (ll = __extro_$K0h0L(340, __intro_jlMIAZ(340, this).eat([
                    '==',
                    '!=',
                    '===',
                    '!=='
                ]))) {
                __block_XkF_pV(69);
                return __expression_WDkJkb(341), __extro_$K0h0L(342, __intro_jlMIAZ(342, node).logic(ll.type, left, __extro_$K0h0L(343, __intro_jlMIAZ(343, this).equal())));
            }
            return __expression_WDkJkb(344), left;
        };
    }
    {
        __statement_MCXHfp(345);
        op.relation = function () {
            __block_XkF_pV(70);
            {
                __statement_MCXHfp(346);
                var left = __extro_$K0h0L(347, __intro_jlMIAZ(347, this).additive()), la;
            }
            if (ll = (__expression_WDkJkb(348), __extro_$K0h0L(349, __intro_jlMIAZ(349, this).eat([
                    '<',
                    '>',
                    '>=',
                    '<='
                ])) || __extro_$K0h0L(350, __intro_jlMIAZ(350, this).eat('IDENT', 'in')))) {
                __block_XkF_pV(71);
                return __expression_WDkJkb(351), __extro_$K0h0L(352, __intro_jlMIAZ(352, node).logic(ll.value, left, __extro_$K0h0L(353, __intro_jlMIAZ(353, this).relation())));
            }
            return __expression_WDkJkb(354), left;
        };
    }
    {
        __statement_MCXHfp(355);
        op.additive = function () {
            __block_XkF_pV(72);
            {
                __statement_MCXHfp(356);
                var left = __extro_$K0h0L(357, __intro_jlMIAZ(357, this).multive()), ll;
            }
            if (ll = __extro_$K0h0L(358, __intro_jlMIAZ(358, this).eat([
                    '+',
                    '-'
                ]))) {
                __block_XkF_pV(73);
                return __expression_WDkJkb(359), __extro_$K0h0L(360, __intro_jlMIAZ(360, node).binary(ll.type, left, __extro_$K0h0L(361, __intro_jlMIAZ(361, this).additive())));
            }
            return __expression_WDkJkb(362), left;
        };
    }
    {
        __statement_MCXHfp(363);
        op.multive = function () {
            __block_XkF_pV(74);
            {
                __statement_MCXHfp(364);
                var left = __extro_$K0h0L(365, __intro_jlMIAZ(365, this).unary()), ll;
            }
            if (ll = __extro_$K0h0L(366, __intro_jlMIAZ(366, this).eat([
                    '*',
                    '/',
                    '%'
                ]))) {
                __block_XkF_pV(75);
                return __expression_WDkJkb(367), __extro_$K0h0L(368, __intro_jlMIAZ(368, node).binary(ll.type, left, __extro_$K0h0L(369, __intro_jlMIAZ(369, this).multive())));
            }
            return __expression_WDkJkb(370), left;
        };
    }
    {
        __statement_MCXHfp(371);
        op.unary = function () {
            __block_XkF_pV(76);
            {
                __statement_MCXHfp(372);
                var ll;
            }
            if (ll = __extro_$K0h0L(373, __intro_jlMIAZ(373, this).eat([
                    '+',
                    '-',
                    '~',
                    '!'
                ]))) {
                __block_XkF_pV(77);
                return __expression_WDkJkb(374), __extro_$K0h0L(375, __intro_jlMIAZ(375, node).unary(ll.type, __extro_$K0h0L(376, __intro_jlMIAZ(376, this).unary())));
            } else {
                __block_XkF_pV(78);
                return __expression_WDkJkb(377), __extro_$K0h0L(378, __intro_jlMIAZ(378, this).member());
            }
        };
    }
    {
        __statement_MCXHfp(379);
        op.member = function (base) {
            __block_XkF_pV(79);
            {
                __statement_MCXHfp(380);
                base = (__expression_WDkJkb(381), (__expression_WDkJkb(382), base) || __extro_$K0h0L(383, __intro_jlMIAZ(383, this).primary()));
            }
            {
                __statement_MCXHfp(384);
                var ll;
            }
            if (ll = __extro_$K0h0L(385, __intro_jlMIAZ(385, this).eat([
                    '[',
                    '.',
                    '('
                ]))) {
                __block_XkF_pV(80);
                switch (ll.type) {
                case '.': {
                        __block_XkF_pV(81);
                        {
                            __statement_MCXHfp(386);
                            base = __extro_$K0h0L(387, __intro_jlMIAZ(387, node).member(base, __extro_$K0h0L(388, __intro_jlMIAZ(388, this).match('IDENT')).value, false));
                        }
                        return __expression_WDkJkb(389), __extro_$K0h0L(390, __intro_jlMIAZ(390, this).member(base));
                    }
                case '[': {
                        __block_XkF_pV(82);
                        {
                            __statement_MCXHfp(391);
                            base = __extro_$K0h0L(392, __intro_jlMIAZ(392, node).member(base, __extro_$K0h0L(393, __intro_jlMIAZ(393, this).expr()), true));
                        }
                        {
                            __statement_MCXHfp(394);
                            __extro_$K0h0L(395, __intro_jlMIAZ(395, this).match(']'));
                        }
                        return __expression_WDkJkb(396), __extro_$K0h0L(397, __intro_jlMIAZ(397, this).member(base));
                    }
                case '(': {
                        __block_XkF_pV(83);
                        {
                            __statement_MCXHfp(398);
                            base = __extro_$K0h0L(399, __intro_jlMIAZ(399, node).call(base, __extro_$K0h0L(400, __intro_jlMIAZ(400, this).arguments())));
                        }
                        {
                            __statement_MCXHfp(401);
                            __extro_$K0h0L(402, __intro_jlMIAZ(402, this).match(')'));
                        }
                        return __expression_WDkJkb(403), __extro_$K0h0L(404, __intro_jlMIAZ(404, this).member(base));
                    }
                }
            }
            return __expression_WDkJkb(405), base;
        };
    }
    {
        __statement_MCXHfp(406);
        op.arguments = function (end) {
            __block_XkF_pV(84);
            {
                __statement_MCXHfp(407);
                end = (__expression_WDkJkb(408), (__expression_WDkJkb(409), end) || ')');
            }
            {
                __statement_MCXHfp(410);
                var args = [], ll;
            }
            do {
                __block_XkF_pV(85);
                if (__expression_WDkJkb(411), __extro_$K0h0L(412, __intro_jlMIAZ(412, this).la()) !== (__expression_WDkJkb(413), end)) {
                    __block_XkF_pV(86);
                    {
                        __statement_MCXHfp(414);
                        __extro_$K0h0L(415, __intro_jlMIAZ(415, args).push(__extro_$K0h0L(416, __intro_jlMIAZ(416, this).condition())));
                    }
                }
            } while (__extro_$K0h0L(417, __intro_jlMIAZ(417, this).eat(',')));
            return __expression_WDkJkb(418), args;
        };
    }
    {
        __statement_MCXHfp(419);
        op.primary = function () {
            __block_XkF_pV(87);
            {
                __statement_MCXHfp(420);
                var ll = __extro_$K0h0L(421, __intro_jlMIAZ(421, this).ll());
            }
            switch (ll.type) {
            case '{': {
                    __block_XkF_pV(88);
                    return __expression_WDkJkb(422), __extro_$K0h0L(423, __intro_jlMIAZ(423, this).object());
                }
            case '[': {
                    __block_XkF_pV(89);
                    return __expression_WDkJkb(424), __extro_$K0h0L(425, __intro_jlMIAZ(425, this).array());
                }
            case '(': {
                    __block_XkF_pV(90);
                    return __expression_WDkJkb(426), __extro_$K0h0L(427, __intro_jlMIAZ(427, this).paren());
                }
            case 'IDENT': {
                    __block_XkF_pV(91);
                    {
                        __statement_MCXHfp(428);
                        __extro_$K0h0L(429, __intro_jlMIAZ(429, this).next());
                    }
                    switch (ll.value) {
                    case 'true': {
                            __block_XkF_pV(92);
                            return __expression_WDkJkb(430), true;
                        }
                    case 'fasle': {
                            __block_XkF_pV(93);
                            return __expression_WDkJkb(431), false;
                        }
                    case 'null': {
                            __block_XkF_pV(94);
                            return __expression_WDkJkb(432), null;
                        }
                    case 'undefined': {
                            __block_XkF_pV(95);
                            return __expression_WDkJkb(433), undefined;
                        }
                    case 'this': {
                            __block_XkF_pV(96);
                            return __expression_WDkJkb(434), __extro_$K0h0L(435, __intro_jlMIAZ(435, node).this());
                        }
                    default: {
                            __block_XkF_pV(97);
                            return __expression_WDkJkb(436), ll;
                        }
                    }
                    break;
                }
            case 'STRING':
            case 'NUMBER': {
                    __block_XkF_pV(98);
                    {
                        __statement_MCXHfp(437);
                        __extro_$K0h0L(438, __intro_jlMIAZ(438, this).next());
                    }
                    return __expression_WDkJkb(439), ll.value;
                }
            default: {
                    __block_XkF_pV(99);
                    {
                        __statement_MCXHfp(440);
                        __extro_$K0h0L(441, __intro_jlMIAZ(441, this).error((__expression_WDkJkb(442), 'Unexpected Token: ' + ll.type)));
                    }
                }
            }
        };
    }
    {
        __statement_MCXHfp(443);
        op.object = function () {
            __block_XkF_pV(100);
            {
                __statement_MCXHfp(444);
                __extro_$K0h0L(445, __intro_jlMIAZ(445, this).match('{'));
            }
            {
                __statement_MCXHfp(446);
                var ll;
            }
            {
                __statement_MCXHfp(447);
                var props = [];
            }
            while (ll = __extro_$K0h0L(448, __intro_jlMIAZ(448, this).eat([
                    'STRING',
                    'IDENT',
                    'NUMBER'
                ]))) {
                __block_XkF_pV(101);
                {
                    __statement_MCXHfp(449);
                    __extro_$K0h0L(450, __intro_jlMIAZ(450, this).match(':'));
                }
                {
                    __statement_MCXHfp(451);
                    var value = __extro_$K0h0L(452, __intro_jlMIAZ(452, this).condition());
                }
                {
                    __statement_MCXHfp(453);
                    __extro_$K0h0L(454, __intro_jlMIAZ(454, this).eat(','));
                }
                {
                    __statement_MCXHfp(455);
                    __extro_$K0h0L(456, __intro_jlMIAZ(456, props).push({
                        key: ll.value,
                        value: value
                    }));
                }
            }
            {
                __statement_MCXHfp(457);
                var len = props.length;
            }
            {
                __statement_MCXHfp(458);
                __extro_$K0h0L(459, __intro_jlMIAZ(459, this).match('}'));
            }
            return __expression_WDkJkb(460), __extro_$K0h0L(461, __intro_jlMIAZ(461, node).object(props));
        };
    }
    {
        __statement_MCXHfp(462);
        op.array = function () {
            __block_XkF_pV(102);
            {
                __statement_MCXHfp(463);
                __extro_$K0h0L(464, __intro_jlMIAZ(464, this).match('['));
            }
            {
                __statement_MCXHfp(465);
                var elements = [], item;
            }
            while (item = __extro_$K0h0L(466, __intro_jlMIAZ(466, this).assign())) {
                __block_XkF_pV(103);
                {
                    __statement_MCXHfp(467);
                    __extro_$K0h0L(468, __intro_jlMIAZ(468, this).eat(','));
                }
                {
                    __statement_MCXHfp(469);
                    __extro_$K0h0L(470, __intro_jlMIAZ(470, elements).push(item));
                }
            }
            {
                __statement_MCXHfp(471);
                var len = elements.length;
            }
            {
                __statement_MCXHfp(472);
                __extro_$K0h0L(473, __intro_jlMIAZ(473, this).match(']'));
            }
            return __expression_WDkJkb(474), __extro_$K0h0L(475, __intro_jlMIAZ(475, node).array(elements));
        };
    }
    {
        __statement_MCXHfp(476);
        op.paren = function () {
            __block_XkF_pV(104);
            {
                __statement_MCXHfp(477);
                __extro_$K0h0L(478, __intro_jlMIAZ(478, this).match('('));
            }
            {
                __statement_MCXHfp(479);
                var res = __extro_$K0h0L(480, __intro_jlMIAZ(480, this).expr());
            }
            {
                __statement_MCXHfp(481);
                __extro_$K0h0L(482, __intro_jlMIAZ(482, this).match(')'));
            }
            return __expression_WDkJkb(483), res;
        };
    }
    {
        __statement_MCXHfp(484);
        module.exports = Parser;
    }
}());
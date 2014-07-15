!function(win, doc, undefined) {
  // __nes命名空间__
  var nes = function(node, context){return all(node, context)},
    locals = {}; //存放local属性...被global坑死了

  // 常用属性local化
  var ap = Array.prototype,
    op = Object.prototype,
    sp = String.prototype,
    fp = Function.prototype,
    slice = ap.slice,
    body = doc.body,
    testNode = doc.createElement("div"),
    // 1. Helper(助手函数)
    // =================================
    // 将类数组(如Nodelist、Argument)变为数组
    toArray = function(arr) {
      return slice.call(arr);
    },
    // 够用的短小类型判断
    typeOf = function(o) {
      return o == null ? String(o) : op.toString.call(o).slice(8, -1).toLowerCase();
    },
    // 够用的简单对象扩展
    extend = function(o1, o2, override) {
      for (var i in o2) {
        if (o1[i] == null || override) o1[i] = o2[i];
      }
    },
    // 最简单先进先出缓存队列, max设置最大缓存长度, 为了不必要重复parse
    // nes会多次用到这个方法创建cache
    createCache = function(max) {
      var keys = [],
        cache = {};
      return {
        set: function(key, value) {
          if (keys.length > this.length) {
            delete cache[keys.shift()];
          }
          cache[key] = value;
          keys.push(key);
          return value;
        },
        get: function(key) {
          if (key === undefined) return cache;
          return cache[key];
        },
        length: max,
        len: function() {
          return keys.length;
        }
      };
    },
    // 让setter型函数fn支持object型的参数
    // 即支持`set(name:value)`
    // 也支持`set({name1:value1,name2:value2})`
    autoSet = function(fn) {
      return function(key, value) {
        if (typeOf(key) == "object") {
          for (var i in key) {
            fn.call(this, i, key[i]);
          }
        } else {
          fn.call(this, key, value);
        }
        return this;
      };
    },
    assert = function(fn) {
      try {
        return fn();
      } catch (e) {
        return false;
      } finally {
        testNode = document.createElement("div");
      }
    };
  // Fixed: toArray 低于IE8的 Nodelist无法使用slice获得array
  try {
    slice.call(doc.getElementsByTagName("body"));
  } catch (e) {
    toArray = function(arr) {
      var result = [],
        len = arr.length;
      for (var i = 0; i < len; i++) {
        result.push(arr[i]);
      }
      return result;
    };
  }

  // 扩展ES5 Native支持的函数，坑爹的远古浏览器
  //es5 trim
  var trimReg = /^\s+|\s+$/g;
  sp.trim = sp.trim ||
  function() {
    return this.replace(trimReg, "");
  };

  //es5 bind
  fp.bind = fp.bind ||
  function(context, args) {
    args = slice.call(arguments, 1);
    var fn = this;
    return function() {
      return fn.apply(context, args.concat(slice.call(arguments)));
    };
  };
  //es5 Array indexOf
  ap.indexOf = ap.indexOf ||
  function(a) {
    for (var i = 0, len = this.length; i < len; i++) {
      if (a === this[i]) return i;
    }
    return -1;
  };

  // Parser 相关
  var
  //抽离出字匹配数目
  ignoredRef = /\(\?\!|\(\?\:/,
    extractRefNum = function(regStr) {
      var left = 0,
        right = 0,
        len = regStr.length,
        ignored = regStr.split(ignoredRef).length - 1; //忽略非捕获匹配
      for (; len--;) {
        var letter = regStr.charAt(len);
        if (len === 0 || regStr.charAt(len - 1) !== "\\") { //不包括转义括号
          if (letter === "(") left++;
          if (letter === ")") right++;
        }
      }
      if (left !== right) throw regStr + "中的括号不匹配";
      else return left - ignored;
    },
    //前向引用 如\1 \12 等在TRUNK合并时要做处理
    refIndexReg = /\\(\d+)/g,
    extractRefIndex = function(regStr, curIndex) {
      return regStr;
    },
    // // 生成默认的action，这个会将匹配到的参数推入一个同名的数组内
    // createAction = function(name) {
    //   return function(all) {
    //     var parsed = this.parsed,
    //       current = parsed[name] || (parsed[name] = [])
    //       current.push(slice.call(arguments))
    //   }
    // },
    // Object.keys 规则排序时的调用方法
    keys = Object.keys || function(obj) {
    var result = [];
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) result.push(prop);
    }
    return result;
  },
  // 将规则中的reg中的macro替换掉
  cleanRule = function(rule) {
    var reg = rule.reg;
    //如果已经是regexp了就转为string
    if (typeOf(reg) === "regexp") reg = reg.toString().slice(1, -1);
    //将macro替换
    rule.regexp = reg.replace(replaceReg, function(a, b) {
      if (b in macros) return macros[b];
      else throw new Error('can"t replace undefined macros:' + b);
    });
    return rule;
  }, cleanRules = function(rules) {
    for (var i in rules) {
      if (rules.hasOwnProperty(i)) cleanRule(rules[i])
    }
    return rules
  }


  // ##2. Parser
  // 
  // 为何要抽象成一个类? 其实这里只用到了一个实例
  // 事实上这个简单Parser还帮我实现了命令行参数解析，
  // zen-coding的实现等等, 它可以帮助实现基于正则式的
  // 字符串解析


  function Parser(opts) {
    opts = opts || {};
    if (opts.macros) this._macros = opts.macros;
    this._links = {}; //symbol link map
    this._rules = {}; //symbol def
    this.TRUNK = null;
    this.cache = createCache(opts.maxCache || 200);
    this.cache.set("", [[] ]); //输入空字符串返回空数组
  }

  extend(Parser.prototype, {
    // ### 解析输入字符串input、返回action定义的data数据
    parse: function(input) {
      // 清理input数据、因为parsed数据最终会被缓存，
      // 我们要尽量让相同的选择器只对应一份parsed数据
      input = clean(input)
      // 先检查缓存中是否有数据
      if (parsed = this.cache.get(input)) return parsed
      // 如果没有: 初始化参数
      var parsed = this.parsed = [
        [null]
      ],
        remain = this.input = input,
        preRemain,
        TRUNK = this.TRUNK
        // 将remain进行this._process这里每匹配一个字符串都会进行一次reduce
      while (preRemain != (remain = remain.replace(TRUNK, this._process.bind(this)))) {
        preRemain = remain;
      }
      // 如果没有被解析完 证明选择器字符串有不能被解析的部分
      if (remain !== '') this.error(remain)
      // 返回数据并推入cache
      return this.cache.set(input, parsed)
    },
    // ###添加新规则 : 
    // 在nes中你可以想象成添加一个与Id、className、pesudo等价简单选择符
    on: function(rules) {
      if (typeOf(rules) === "string") { //当不是hash传入时
        var tmp = {}
        tmp[rules] = arguments[1]
        rules = tmp
      }
      // 可以同时接受object型或者key, value对的参数
      for (var i in rules) {
        var rule = rules[i]
        if (typeOf(rule) !== "object") {
          rule = {
            regexp: rule
          }
        }
        var reg = rule.regexp
        if (typeOf(reg) === "regexp") {
          rule.regexp = reg.toString().slice(1, -1)
        }
        // 初始化order
        if (rule.order === undefined) rule.order = 1
        this._rules[i] = rule
      }
      // 每进行一次新规则监听，都重新组装一次
      this.setup()
      return this
    },
    // ###__删除规则__ :
    // 删除对应规则, 即nes的规则都是在运行时可删可增的
    off: function(name) {
      if (typeOf(name) === "array") {
        for (var i = name.length; i--;) {
          this.off(name[i])
        }
      } else {
        if (this._rules[name]) {
          delete this._rules[name]
        }
      }
      return this
    },
    // 获得当前解析位置所在的datum，你只需要在这个datum中塞数据即可
    current: function() {
      var data = this.parsed
      var piece = data[data.length - 1],
        len = piece.length
      return piece[len - 1] || (piece[len - 1] = {
        tag: "*"
      })
    },
    error: function(info) {
      throw Error("输入  " + this.input + "  含有未识别语句:" + info || "")
    },

    clone: function(parser) {
      return new Parser().on(this._rules)
    },
    // __`this.parser`__的依赖方法，
    // 即遍历links检查是否有子匹配满足关系，
    // 有则推入对应的action数组,
    // 注意由于其是是replace方法的调用，每次都要返回""完成
    // reduce操作
    _process: function() {
      var links = this._links,
        rules = this._rules,
        args = slice.call(arguments);

        for (var i in links) {
          if(links.hasOwnProperty(i)){
            var link = links[i],
              retain = link[1],
              index = parseInt(link[0]);
            if (args[index] && (rule = rules[i])) {
              rule.action.apply(this, args.slice(index, index + retain))
              return ""
            }
          }
        }
      return ""
    },
    // 组装
    setup: function() {
      cleanRules(this._rules)
      var curIndex = 1,
        //当前下标
        splits = [],
        rules = this._rules,
        links = this._links,
        ruleNames = keys(rules).sort(function(a, b) {
          return rules[a].order >= rules[b].order
        }),
        len = ruleNames.length;

      for (; len--;) {
        var i = ruleNames[len],
          rule = rules[i],
          retain = extractRefNum(rule.regexp) + 1 // 1就是那个all
        if (rule.filter && !filters[i]) {
          filters[i] = rule.filter
        } //将filter转移到filters下
        links[i] = [curIndex, retain] //分别是rule名，参数数量
        var regexp = extractRefIndex(rule.regexp, curIndex - 1);
        curIndex += retain;
        splits.push(regexp)
      }
      this.TRUNK = new RegExp("^(?:(" + splits.join(")|(") + "))")
      return this
    }
  })



  // ### parse的规则定义部分开始
  // 一些用到的正则式，但是又不属于parser的规则组成
  var
  replaceReg = /\{\{([^\}]*)\}\}/g,
    //替换rule中的macro
    nthValueReg = /^(?:(\d+)|([+-]?\d*)?n([+-]\d+)?)$/,
    // nth伪类的value规则
    posPesudoReg = /^(nth)[\w-]*(-of-type|-child)/,
    //判断需要pos
    // 第一个cache 用来装载nth伪类中的参数解析后的数据
    // 如nth-child、nth-of-type等8个伪类
    nthCache = createCache(100),
    // 提取nthValue中的有用信息 比如an + b 我们需要提取出a以及,b并对额外情况如缺少a参数或b参数
    // 或者有a、b小于0这些情况作统一处理，返回find适合使用的数据
    extractNthValue = function(param) {
      var step, start, res
      //如果无参数 当成是获取第一个元素
      if (!param || !(param = param.replace(/\s+/g, ""))) {
        return {
          start: 1,
          step: 0
        }
      }
      if (res = nthCache.get(param)) return res
      // 对even odd等转化为标准的a，b组合(即step与start)
      if (param == "even") {
        start = 2
        step = 2
      } else if (param == "odd") {
        step = 2
        start = 1
      } else {
        res = param.match(nthValueReg)
        // 对错误的nth参数抛出错误
        if (!res) step = null // 无论其他参数，如果step为null，则永远为false
        else {
          if (res[1]) {
            step = 0
            start = parseInt(res[1])
          } else {
            if (res[2] == "-") res[2] = "-1"
            step = res[2] ? parseInt(res[2]) : 1
            start = res[3] ? parseInt(res[3]) : 0
          }
        }
      }
      if (start < 1) {
        if (step < 1) {
          step = null //标志false
        } else {
          start = -(-start) % step + step
        }
      }
      return nthCache.set(param, {
        start: start,
        step: step
      })
    }

    // ### parse Rule 相关
    // 了解bison等解析器生成的同学可以把这部分看成是词法与语法定义的杂糅
    // 很混乱也很不标准，但对于选择器这种最简单的DSL其实够用，并且有了奇效
    // 整个Parser根据rules动态产生(即可在使用时发生改变)
    // 具体的流程是下面的rules对象定义了一组语法(词法?)rule——如attribute，
    // 你可以把每个rule中的reg想象成一个token(word?),这些token可能会有{{word}}这种占位符
    // 占位符首先会被macros中对应的macro替换，然后这些token会被组装成一个大版的Regexp，即上面的
    // Trunk变量,这个过程没什么特殊，一般比较优秀的选择器都是基于这个方法。 在nes中,最终的Trunk可能是
    // 这样的:
    //
    // `/(\s*,\s*)|(#([\w\u4e00-\u9fbf-]+))|(\*|\w+)|(\.([\w\u4e00-\u9fbf-]+))|
    // (:([\w\u4e00-\u9fbf-]+)(?:\(([^\(\)]*|(?:\([^\)]+\)|[^\(\)]*)+)\))?)|
    // (\[([\w\u4e00-\u9fbf-]+)(?:([*^$|~!]?=)['"]?((?:[\w\u4e00-\u9fbf-]||\s)+)['"]?)?\])|(::([\w\u4e00-\u9fbf-]+))
    // |([>\s+~&%](?!=))|(\s*\{\s*(\d*),(\-?\d*)\s*\}\s*)/g`
    // 
    // 看到上面那长串，你大概理解了将regexp按词法分开这样做的第一个原因 : __维护__. 
    // 第二个原因就是: __效率__  一次大型正则的调用时间要远低于多次小型正则的匹配(前提它们做同样规模的匹配)
  var
  // 一些macro
  macros = {
    split: "\\s*,\\s*",
    // 分隔符
    operator: "[*^$|~!]?=",
    // 属性操作符 如= 、!=
    combo: "[>\\s+~](?!=)",
    // 连接符 如 > ~ 
    word: "[\\\\\\w\\u00A1-\\uFFFF-]"
  },
    // 语法规则定义
    rules = {
      split: {
        // 分隔符 如 ，
        reg: "{{split}}",
        action: function(all) {
          this.parsed.push([null])
        },
        order: 0
      },
      // id 如 #home
      id: {
        reg: "#({{word}}+)",
        action: function(all, id) {
          this.current().id = id
        }
      },
      // 节点类型选择符 如 div
      tag: {
        reg: "\\*|[a-zA-Z-]\\w*",
        // 单纯的添加到
        action: function(tag) {
          this.current().tag = tag.toLowerCase()
        }
      },
      // 类选择符 如 .m-home
      classList: {
        reg: "\\.({{word}}+)",
        action: function(all, className) {
          var current = this.current(),
            classList = current.classList || (current.classList = [])
            classList.push(className)
        }
      },
      // 伪类选择符 如 :nth-child(3n+4)
      pesudos: {
        reg: ":({{word}}+)" + //伪类名
        "(?:\\(" + //括号开始
        "([^\\(\\)]*" + //第一种无括号
        "|(?:" + //有括号(即伪类中仍有伪类并且是带括号的)
        "\\([^\\)]+\\)" + //括号部分
        "|[^\\(\\)]*" + ")+)" + //关闭有括号
        "\\))?",
        // 关闭最外圈括号
        action: function(all, name, param) {
          var current = this.current(),
            pesudos = current.pesudos || (current.pesudos = []),
            name = name.toLowerCase(),
            res = {
              name: name
            }

          if (param) param = param.trim()
          if (posPesudoReg.test(name)) {
            // parse 的成本是很小的 尽量在find前把信息准备好
            // 这里我们会把nth-child(an+b) 的 a 与 b 在不同输入下标准化
            param = extractNthValue(param)
          }
          if (param) res.param = param
          pesudos.push(res)
        }
      },
      // 属性选择符  如  [class=hahaha]
      //
      // 这里以属性选择符为例，说明下reg与action的关系
      // 
      attributes: {
        reg: "\\[\\s*({{word}}+)(?:({{operator}})[\'\"]?([^\'\"\\[]+)[\'\"]?)?\\s*\\]",
        action: function(all, key, operator, value) {
          var current = this.current(),
            attributes = current.attributes || (current.attributes = [])
            var res = {}
          attributes.push({
            key: key,
            operator: operator,
            value: value
          })
        }
      },
      // 伪元素可以实现么？ 占位
      combo: {
        reg: "\\s*({{combo}})\\s*",
        action: function(all, combo) {
          var data = this.parsed,
            cur = data[data.length - 1]
            this.current().combo = combo
            cur.push(null)
        },
        order: 0
      }
    }

  var cleanReg = new RegExp("\\s*(,|" + macros.combo + "|" + macros.operator + ")\\s*", "g")
  clean = function(sl) {
      return sl.trim().replace(/\s+/g, " ").replace(cleanReg, "$1")
    }
    // ### parser生成
    // 初始化parser实例
  var parser = new Parser()
  parser.on(rules) //生成规则
  // 为了兼容前面版本，仍然提供这个parse函数, 也为了与find想对应


  function parse(sl) {
    return parser.parse(sl)
  }

  //   3. Finder
  // ================
  //   Util
  // -------------------------
  // 将nodelist转变为array
  //  DOM related Util
  // --------------------
  var root = doc.documentElement || doc;
  var attrMap = {
    'for': "htmlFor",
    "href": function(node) {
      return "href" in node ? node.getAttribute("href", 2) : node.getAttribute("href")
    },
    "type": function(node) {
      return "type" in node ? node.getAttribute("type") : node.type
    }
  };
  var checkTagName = assert(function() {
    testNode.appendChild(doc.createComment(""));
    // 有些版本的getElementsByTagName("*")会返回注释节点
    return !testNode.getElementsByTagName("*").length ||
    // 低版本ie下input name 或者 id为length时 length返回异常
    typeof doc.getElementsByTagName("input").length !== "number"
  });
  //form __sizzle__line200 判断getAttribute是否可信
  var checkAttributes = assert(function() {
    testNode.innerHTML = "<select></select>";
    var type = typeOf(testNode.lastChild.getAttribute("multiple"))
    // IE8 returns a string for some attributes even when not present
    return type !== "boolean" && type !== "string";
  });
  // 将nth类方法的判断部分统一抽离出来,
  // 其中type代表是否是nth-type-of类型的判断,下面类似


  function checkNth(node, type) {
    return type? node.nodeName === type : node.nodeType === 1;
  }
  // 获得父节点node的顺数第n(从1开始)个子节点


  function nthChild(node, type) {
    var node = node.firstChild
    return (!node || checkNth(node, type)) ? node : nthNext(node, type);
  };
  // 获得父节点node的倒数第n(从1开始)个子节点


  function nthLastChild(node,type) {
    var node = node.lastChild
    return (!node || checkNth(node, type))? node:nthPrev(node, type);
  };
  // 获得节点node的第n(从1开始)个前置兄弟节点


  function nthPrev(node, type) {
    while (node = node.previousSibling) {
      if (checkNth(node, type)) return node
    }
    return node
  };
  // 获得节点node的倒数第n(从1开始)个前置兄弟节点


  function nthNext(node, type) {
    while (node = node.nextSibling) {
      if (checkNth(node, type)) return node
    }
    return node
  };
  // 获得节点node的key属性的值, 修改自from sizzle...蛋疼啊各浏览器的属性获取

  function getAttribute(node, key) {
    var map = attrMap[key]
    if (map) return typeof map === "function" ? map(node) : node[map]
    if (checkAttributes) {
      return node.getAttribute(key);
    }
    var attrNode = node.getAttributeNode(key);
    // 对于selected checked 当返回为bool值时  将其标准化为 selected = "selected"
    // 方便后续处理

    // 很多时候null可以作为标志位，nes中大部分特殊flag都用null标示
    return typeof node[key] === "boolean" 
            ? node[key] ? key : null
            : (attrNode && attrNode.specified ?attrNode.value : null);
  };
  // __数组去重__


  function distinct(array) {
    for (var i = array.length; i--;) {
      var n = array[i]
      // 先排除 即 如果它是清白的 后面就没有等值元素
      array.splice(i, 1, null)
      if (~array.indexOf(n)) {
        array.splice(i, 1); //不清白
      } else {
        array.splice(i, 1, n); //不清白
      }
    }
    return array
  }
  // 从sizzle抄袭的 document sorter 
  // 将匹配元素集按文档顺序排列好 这很重要!
  var sortor = (doc.compareDocumentPosition) ?
  function(a, b) {
    if (!a.compareDocumentPosition || !b.compareDocumentPosition) return 0;
    return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
  } : ('sourceIndex' in doc) ?
  function(a, b) {
    if (!a.sourceIndex || !b.sourceIndex) return 0;
    return a.sourceIndex - b.sourceIndex;
  } : function(a, b) {
    var i = 0,
      ap = [a],
      bp = [b],
      aup = a.parentNode,
      bup = b.parentNode,
      cur = aup;

    if (a === doc) {
      return -1;
    } else if (b === doc) {
      return 1;
    } else if (!aup && !bup) {
      return 0;
    } else if (!bup) {
      return -1;
    } else if (!aup) {
      return 1;
    } else if (aup === bup) {
      return siblingCheck(a, b);
    }
    while (cur) {
      ap.unshift(cur);
      cur = cur.parentNode;
    }
    cur = bup;
    while (cur) {
      bp.unshift(cur);
      cur = cur.parentNode;
    }
    while (ap[i] === bp[i]) {
      i++;
    }
    return siblingCheck(ap[i], bp[i]);
  };

  function siblingCheck(a, b) {
    if (a && b) {
      var cur = a.nextSibling;
      while (cur) {
        if (cur === b) {
          return -1;
        }
        cur = cur.nextSibling;
      }
    }
    return a ? 1 : -1;
  };

  function uniqueSort(nodeList) {
    return distinct(nodeList.sort(sortor))
  };

  // ### nth position Cache 部分
  // 对于nth类型的查找，有时候一次节点查找会遍历到多次相同节点，
  // 由于一次节点查找时，由于js的单线程，节点不可能发生改变，介于此，我们将
  // nth类的node的节点位置缓存起来，在本次查找结束后再清空
  // 获得node的唯一标示
  var getUid = (function(token) {
    var _uid = 0
    return function(node) {
      return node._uid || (node._uid = token + _uid++)
    }
  })("nes_" + (+new Date).toString(36));
  // 创建nth相关的Filter，由于都类似，就统一通过工厂函数生成了
  // 参数有两个  
  //    1. isNext: 代表遍历顺序是向前还是向后
  //    2. isType: 代表是否是要指定nodeName


  function createNthFilter(isNext, isType) {
    var next, prev, cacheKey, getStart;
    if (isNext) {
      cacheKey = isType ? "type" : "child"
      // if(typeof isType === "function") cacheKey = "match"
      next = nthNext
      prev = nthPrev
      getStart = nthChild
    } else {
      // Fixed:!!! 这里cache是首次生成的cache被写死了，即使后面clear了也没有用,
      // 即永远无法被释放
      cacheKey = "last" + (isType ? "type" : "child")
      // if(typeof isType === "function") cacheKey = "last-match"
      prev = nthNext
      next = nthPrev
      getStart = nthLastChild
    }
    // 实际返回函数, param即pesudo的action定义的参数形如
    // `{step:1, start:1}` 所有的类似even、odd或者其他形如n、-3n-11都会标准化
    // 成这种形势
    return function(node, param) {
      var cache = nthPositionCache[cacheKey]
      if (node === root) return false // 如果是html直接返回false 坑爹啊
      var _uid = getUid(node),
        parent = node.parentNode,
        traverse = param.step > 0 ? next : prev,
        step = param.step,
        start = param.start,
        type = isType && node.nodeName
        //Fixed
      if (step === null) return false //means always false
      if (!cache[_uid]) {
        var startNode = getStart(parent, type),
          index = 0;
          do {
            cache[getUid(startNode)] = ++index;
            nthPositionCache.length++;
          } while (startNode = next(startNode, type))
      }
      var position = cache[_uid]
      if (step === 0) return position === start;
      return ((position - start) / step >= 0) && ((position - start) % step === 0);
    }
  }
  // 
  var nthPositionCache = {length: 1 };
  function clearNthPositionCache() {
    if (nthPositionCache.length) {
      nthPositionCache = {
        child: {},
        lastchild: {},
        type: {},
        lasttype: {},
        length: 0
      }
    }
  }
  // 初始化positioncache
  clearNthPositionCache()


  // 这里的几个finders是第一轮获取目标节点集的依赖方法
  // 我没有对byClassName做细致优化，比如用XPath的方式
  // form sizzle line 147
  var finders = {
    byId: function(id) {
      var node = doc.getElementById(id)
      return node ? [node] : []
    },
    byClassName: doc.getElementsByClassName ? function(classList, node) {
      classList = classList.join(" ")
      return toArray((node || doc).getElementsByClassName(classList))
    } : null,
    byTagName: checkTagName ? function(tagName, node) {
      var results = (node || doc).getElementsByTagName(tagName)
      return toArray(results)
    } : function(tagName, node) {
      var results = (node || doc).getElementsByTagName(tagName)
      var elem, tmp = [],
        i = 0;
      for (;
      (elem = results[i]); i++) {
        if (elem.nodeType === 1) tmp.push(elem);
      }
      return tmp;
    }
  }
  // ### filter: 
  // Action中塞入的数据会统一先这里处理，可能是直接处理如id、class等简单的.
  // 也可能是分发处理，甚至是多重的分发，如那些复杂的attribute或者是pesudo
  // 这里简化到过滤单个节点 逻辑清晰 ,但可能性能会降低，因为有些属性会重复获取
  var filters = {
    id: function(node, id) {
      return node.id === id
    },
    classList: function(node, classList) {
      var len = classList.length,
        className = " " + node.className + " "
      for (; len--;) {
        if (className.indexOf(" " + classList[len] + " ") === -1) {
          return false
        }
      }
      return true
    },
    tag: function(node, tag) {
      if (tag == "*") return true
      return node.tagName.toLowerCase() === tag
    },
    // pesudos会分发到ExpandsFilter中pesudo中去处理
    pesudos: function(node, pesudos) {
      var len = pesudos.length,
        pesudoFilters = expandFilters["pesudos"]

      for (; len--;) {
        var pesudo = pesudos[len],
          name = pesudo.name,
          filter = pesudoFilters[name]

        if (!filter) throw Error("不支持的伪类:" + name)
        if (!filter(node, pesudo.param)) return false
      }
      return true
    },
    // attributes会分发到ExpandsFilter中的operator去处理
    attributes: function(node, attributes) {
      var len = attributes.length,
        operatorFilters = expandFilters["operators"]

      for (; len--;) {
        var attribute = attributes[len],
          operator = attribute["operator"],
          filter = operatorFilters[operator],
          nodeValue = getAttribute(node, attribute.key)

          if (nodeValue === null) {
            if (operator !== "!=") return false
            continue
          }
        if (!operator) continue
        if (!filter) throw Error("不支持的操作符:" + operator)
        if (!filter(attribute.value, nodeValue + "")) return false
      }
      return true
    }
  }

  // expandFilters 
  // -------------------------
  // 原生可扩展的方法
  var expandFilters = {
    // __扩展连接符__:
    // 选择符filter 与其他filter不同 node 同样是当前节点 区别是
    // 如果成功返回成功的上游节点(可能是父节点 可能是兄弟节点等等)
    // 其中 match(node) 返回 这个上游节点是否匹配剩余选择符(内部仍是一个递归)
    combos: {
      ">": function(node, match) {
        var parent = node.parentNode
        if (match(parent)) return parent
      },
      "~": function(node, match) {
        var prev = nthPrev(node)
        while (prev) {
          if (match(prev)) return prev
          prev = nthPrev(prev)
        }
      },
      " ": function(node, match) {
        var parent = node.parentNode
        while (parent) {
          var pass = match(parent)
          if (pass) return parent
          if (pass === null) return null
          parent = parent.parentNode
        }
        return null
      },
      "+": function(node, match) {
        var prev = nthPrev(node)
        if (prev && match(prev)) return prev
      }
    },
    // __扩展操作符__ :
    operators: {
      "^=": function(value, nodeValue) {
        if (nodeValue == null) return false
        return nodeValue.indexOf(value) === 0
      },
      "=": function(value, nodeValue) {
        return nodeValue === value
      },
      "~=": function(value, nodeValue) {
        if (nodeValue == null) return false
        return ~ (" " + nodeValue + " ").indexOf(value)
      },
      "$=": function(value, nodeValue) { //以value结尾
        return nodeValue.substr(nodeValue.length - value.length) === value
      },
      "|=": function(value, nodeValue) { // 连接符
        return ~ ("-" + nodeValue + "-").indexOf("-" + value + "-")
      },
      "*=": function(value, nodeValue) { //出现在nodeValue的任意位置
        return ~ (nodeValue).indexOf(value)
      },
      "!=": function(value, nodeValue) {
        return nodeValue !== value
      }
    },
    // __扩展伪类__:
    pesudos: {
      //TODO:这里如果出自 SELECtorAPI 标注下处处
      "not": function(node, sl) {
        return !matches(node, sl)
      },
      "matches": function(node, sl) {
        return matches(node, sl)
      },
      // child pesudo 统一由工厂函数生成
      "nth-child": createNthFilter(true, false),
      "nth-last-child": createNthFilter(false, false),
      "nth-of-type": createNthFilter(true, true),
      "nth-last-of-type": createNthFilter(false, true),
  
      "first-child": function(node) {
        return !nthPrev(node)
      },
      "last-child": function(node) {
        return !nthNext(node)
      },
      "last-of-type": function(node) {
        return !nthNext(node, node.nodeName)
      },
      "first-of-type": function(node) {
        return !nthPrev(node, node.nodeName)
      },
      "only-child": function(node) {
        return !nthPrev(node) && !nthNext(node)
      },
      "only-of-type": function(node) {
        return !nthPrev(node, node.nodeName) && !nthNext(node, node.nodeName)
      },
      //找出有具体text内容的节点
      "contains": function(node, param) {
        return ~ (node.innerText || node.textContent || '').indexOf(param)
      },
      "checked": function(node) {
        return !!node.checked || !! node.selected
      },
      "selected": function(node) {
        return node.selected
      },
      "enabled": function(node) {
        return node.disabled === false
      },
      "disabled": function(node) {
        return node.disabled === true
      },
      "empty": function(node) {
        var nodeType;
        node = node.firstChild;
        while (node) {
          if (node.nodeName > "@" || (nodeType = node.nodeType) === 3 || nodeType === 4) {
            return false;
          }
          node = node.nextSibling;
        }
        return true;
      },
      "focus": function(node) {
        return node === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !! (node.type || node.href || ~node.tabIndex);
      },
      "target": function(node, param) {
        var id = node.id || node.name
        if (!id) return false
        return ("#" + id) === location.hash
      }
    }
  }

  // 这里主要是整合之前的ExpandsFilter中的mathch, 单层数据


  function matchDatum(node, datum, ignored) {
    var subFilter
    for (var i in datum) {
      if (ignored !== i && (subFilter = filters[i]) && !subFilter(node, datum[i])) {
        return false
      }
    }
    return true
  };
  // 这个全局cache的引入是为了避免多次传入参数。
  // 当然全局的缺点也很明显，维护会不方便, 不利于测试
  var matchesCache = null; //保存那些matches函数
  

  function matchData(node, data, ignored) { // 稍后再看存入step
    var len = data.length,
      datum = data[len - 1]
      // 首先要满足自身
    if (!matchDatum(node, datum, ignored)) return false
    else {
      if (len == 1) return true
      var nextDatum = data[len - 2],
        getNext = expandFilters.combos[nextDatum.combo],
        match = matchesCache[len - 2],
        next = getNext(node, match)

        if (next) return true
        else return false
    }
  };
  //动态产生供FilterOneNode使用的match


  function createMatch(data) {
    return function(node) {
      if (node == root || node == null || node == doc) return null //null 相当于休止符
      return matchData(node, data)
    }
  };

  function createMatches(data) {
    var matches = []
    for (var i = 0, len = data.length; i < len; i++) {
      matches.push(createMatch(data.slice(0, i + 1)))
    }
    return matches
  };
  // 过滤主函数filter
  // -----------------------------------
  // 自底向上过滤非匹配节点


  function filter(results, data, ignored) {
    if (!data.length) return results;
    //这里是为了缓存match匹配函数
    var preMatchesCache = matchesCache
    matchesCache = createMatches(data)
    for (var i = results.length; i--;) {
      if (!matchData(results[i], data, ignored)) {
        results.splice(i, 1)
      }
    }
    // Fixed: 因为一次filter可能会有字filter调用，比如matches、not、include
    matchesCache = preMatchesCache; // warning :以后写全局变量一定当心
    return results;
  }
  // 获得第一次目标节点集


  function getTargets(data, context) {
    var results, ignored, lastPiece = data[data.length - 1]
    if (lastPiece.id) {
      results = finders.byId(lastPiece.id);
      ignored = "id";
    } else if (lastPiece.classList && lastPiece.classList.length && finders.byClassName) {
      results = finders.byClassName(lastPiece.classList, context);
      ignored = "classList";
    } else {
      results = finders.byTagName(lastPiece.tag || "*", context);
      ignored = "tag";
    }
    if (!results.length) return results;
    return filter(results, data, ignored);
  }
  // API : find (private)
  // -------------
  // 根据parse后的数据进行节点查找
  // options:
  //    1. parsed.data  parse数据为一数组
  //    2. node         context节点
  // 事实上没有data这个单词，我这里算是自定了这个单词
  //     datas : [data,data]   
  //     data : [datum, datum]
  //     datum: {tag:"*"....etc}


  function find(datas, context) {
    if (!datas[0][0]) return []
    var results = [],
      notNullResult = 0;

    for (var i = 0, len = datas.length; i < len; i++) {
      var data = datas[i],
        dlen = data.length,
        last = data[dlen - 1],
        result = getTargets(data, context);

      if (result && result.length) {notNullResult++};
      if (!results) results = result;
      else results =results.concat(result);
    }
    clearNthPositionCache();//清理
    if (notNullResult > 1) uniqueSort(results)
    return results;
  }
  // API : 测试用get相当于all (private)
  // -------------------------------------
  // 为了测试时避免原生querySelector的影响
  // 


  function get(sl, context) {
    var data = parse(sl);
    var result = find(data, context || doc);
    return result;
  }

  // API 
  // ----------------------------------------------------------------------
  var supportQuerySelector = !! doc.querySelector

  // API1——__one__:对应标准的querySelector方法


  function one(sl, context) {
    var node
    if (supportQuerySelector && !nes.debug) {
      try {
        node = (context || doc).querySelector(sl);
      } catch (e) {
        node = get(sl, context)[0];
      }
    } else {
      node = get(sl, context)[0];
    }
    return node
  }

  // API2——__all__
  // -------------------------------
  // 对应标准的querySelectorAll方法


  function all(sl, context) {
    var nodeList
    if (supportQuerySelector && !nes.debug) {
      try {
        nodeList = toArray((context || doc).querySelectorAll(sl));
      } catch (e) {
        nodeList = get(sl, context);
      }
    } else {
      nodeList = get(sl, context);
    }
    return nodeList
  }

  // API 3: 
  // ----------------------------------------------------------------------
  // 对应标准的matches方法
  // nes的matches功能稍强，它支持用分隔符链接符组合的复杂选择器
  // 即与all、one函数的支持是一样的
  //
  // 注: 由于:not与:matches依赖于这个函数 ,所以同样支持复杂选择器


  function matches(node, sl) {
    if (!node || node.nodeType !== 1) return false
    var datas = parse(sl),
      len = datas.length
    if (!datas[len - 1][0]) return false
    for (; len--;) {
      if (matchOneData(node, datas[len])) return true
    }
    return false
  }

  // matches 单步调用方法


  function matchOneData(node, data) {
    var len = data.length
    if (!matchDatum(node, data[len - 1])) {
      return false;
    } else {
      return filter([node], data.slice(0)).length === 1;
    }
  }

  // ASSEMBLE 
  // =========================
  // 组装分为几个步骤
  //
  // 1. 生成pesudo 、 operator、combo 等expand方法
  // ----------------------------------------------------------------------
  // 具体扩展方法的使用请参见 [nes的github](https://github.com/leeluolee/nes)
  // 统一由工厂函数createExpand
  ;
  (function createExpand(host, beforeAssign) {
    for (var i in host) {
      nes[i] = (function(i) {
        var container = host[i];
        // autoSet代表了这三个函数除了key、value参数
        // 也支持字面量的参数输入
        return autoSet(function(key, value) {
          // Warning: 直接覆盖，如果存在的话
          container[key] = value;
          if (i in beforeAssign) {
            beforeAssign[i](key, value);
          }
        })
      })(i)
    }
    // 有些扩展如combos、operators由于为了避免冲突
    // 关键字都写入了正则式中，这种情况下需要将新的正则式
    // 填入相关正则，并进行parser的setup
  })(expandFilters, {
    "operators": function(key) {
      var befores = macros.operator.split("]");
      befores.splice(1, 0, key.charAt(0) + "]");
      macros.operator = befores.join("");
      parser.setup();
    },
    "combos": function(key) {
      var befores = macros.combo.split("]");
      befores.splice(1, 0, key + "]");
      macros.combo = befores.join("");
      parser.setup();
    }
  })

  // 2. 暴露API
  // -------------------------------------
  //
  // 直接设置其为true 来强制不适用原生querySelector Api
  nes.debug = false; 
  nes._nthCache = nthCache;
  // parser , 抽离的parser部分
  // ---------------------------
  // 它可以:
  //
  //    1. parser.parse 解析内部规则定义的字符串匹配
  //    2. parser.on    添加新规则
  //    3. parser.clone 复制此parser，这个作用会在后面的zen-coding的demo中体现
  //    4. parser.off   删除规则
  //    5. parser.cache 缓存控制
  nes.parser = parser;

  //解析, 这个将被移除，使用parser.parse来代替
  nes.parse = parse;
  //查找parser解析后的data代表的节点 __private__
  nes._find = find;
  //测试时排除原生querySelector的影响 __deprecated__! 使用nes.debug来控制
  nes._get = get;
  //        *主要API*
  // -------------------------
  nes.one = one; 
  nes.all = all; 
  nes.matches = matches;
  // 内建扩展 api 这三个已经内建:
  // 
  // 1. `pesudos`
  // 2. `operators`
  // 3. `combos`
  nes._uniqueSort = uniqueSort;
  nes._cleanSelector = clean;
  nes._getUid = getUid;


  //          5.Exports
  // ----------------------------------------------------------------------
  // 暴露API:  amd || commonjs  || global 
  // 支持commonjs
  if (typeof exports === 'object') {
    module.exports = nes;
    // 支持amd
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return nes
    });
  } else {
    // 直接暴露到全局
    win.nes = nes;
  }

  //        6. extension
  //-------------------------------------------------------------
  // 很多人不看extend文件夹， 所以这部分也作为Demo实例

  /**
   * nth Math 的调用方法
   * @param  {[type]} first [description]
   * @return {[type]}
   */
  function nthMatch(first) {
    return function(node, param) {
      var tmp = param.split(/\s+of\s+/);
      if(tmp.length<2) throw Error("no 'of' keyword in nth-match\"s selector")

      var params = extractNthValue(tmp[0]),
        sl = tmp[1],
        testNode = node.parentNode[first? "firstChild":"lastChild"],
        next = first? "nextSibling" : "previousSibling",
        step = params.step,
        start = params.start,
        position = 0;

        if(!nes.matches(node, sl)) return false;
        if (step === null) return false; //means always false
        do {
          if (testNode.nodeType === 1 && nes.matches(testNode, sl)) position++;
          if (testNode === node) break;
        } while (testNode = testNode[next])
        
        if (step === 0) return position === start;
        return ((position - start) / step >= 0) && ((position - start) % step === 0);
    }
  }
  nes.pesudos({
    // 例如 :nth-match(3 of li.active) 第三个满足这个li.active的节点
    "nth-match": nthMatch(true),
    "nth-last-match": nthMatch(false),
    "local-link": function(node, param){
      if(param) param = parseInt(param);
    }
  })
}(window, document, undefined)
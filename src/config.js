module.exports = {
  macro: {
    'BEGIN': '{{',
    'END': '}}',
    //http://www.w3.org/TR/REC-xml/#NT-Name
    // ":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
    // 暂时不这么严格，提取合适范围
    // 'NAME': /(?:[:_A-Za-z\xC0-\u2FEF\u3001-\uD7FF\uF900-\uFFFF][-\.:_0-9A-Za-z\xB7\xC0-\u2FEF\u3001-\uD7FF\uF900-\uFFFF]*)/
    'NAME': /(?:[:_A-Za-z][-\.:_0-9A-Za-z]*)/,
    'IDENT': /[\$_A-Za-z][-_0-9A-Za-z\$]*/,
    'SPACE': /[\r\n\f ]/
  }
}
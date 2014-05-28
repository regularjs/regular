module.exports = {
  element: function(name, attrs, children){
    return {
      type: 'element',
      tag: name,
      attrs: attrs,
      children: children
    }
  },
  attribute: function(name, value){
    return {
      type: 'attribute',
      name: name,
      value: value
    }
  },
  "if": function(test, consequent, alternate){
    return {
      type: 'if',
      test: test,
      consequent: consequent,
      alternate: alternate
    }
  },
  list: function(sequence, variable, body){
    return {
      type: 'list',
      sequence: sequence,
      variable: variable,
      body: body
    }
  },
  expression: function(get, set,  constant){
    return {
      type: "expression",
      get: get,
      set: set,
      constant: constant

    }
  },
  text: function(text){
    return text;
  },
  interplation: function(expression){
    return {
      type: 'interplation',
      expression:  expression
    }
  },
  template: function(template){
    return {
      type: 'template',
      content: template
    }
  }
}

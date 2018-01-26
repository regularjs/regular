module.exports = {
  'COMPONENT_TYPE': 1,
  'ELEMENT_TYPE': 2,
  'ERROR': {
    'UNMATCHED_AST': 101
  },
  "MSG": {
    101: "Unmatched ast and mountNode, report issue at https://github.com/regularjs/regular/issues"
  },
  'NAMESPACE': {
    html: "http://www.w3.org/1999/xhtml",
    svg: "http://www.w3.org/2000/svg"
  },
  'OPTIONS': {
    'STABLE_INIT': { stable: !0, init: !0 },
    'FORCE_INIT': { force: !0, init: !0 },
    'STABLE': {stable: !0},
    'INIT': { init: !0 },
    'SYNC': { sync: !0 },
    'FORCE': { force: !0 }
  },
  'DIFF': {
    'REMOVE_ALL': 1,
    'ADD_ALL': 0
  }
}

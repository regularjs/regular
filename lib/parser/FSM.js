// create a simple finite state machine
function createFSM() {
  return {
    _stack: [],
    enter: function(state) {
      this._stack.push(state);
      return this;
    },
    leave: function(state) {
      var stack = this._stack;
      // if state is falsy or state equals to last item in stack
      if(!state || stack[stack.length-1] === state) {
        stack.pop();
      }
      return this;
    },
    get: function() {
      var stack = this._stack;
      return stack[stack.length - 1];
    },
    all: function() {
      return this._stack;
    },
    is: function(state) {
      var stack = this._stack;
      return stack[stack.length - 1] === state
    }
  }
}

module.exports = createFSM;

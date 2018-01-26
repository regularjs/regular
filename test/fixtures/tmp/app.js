var Regular= requ

  var Todo = Regular.extend({
    data: {},
    template: "#todo",
    init: function(){}
  });
  

  var TodoApp = Regular.extend({
    template: '#application', // id | template string | preparsed ast
    init: function(){
      // call parent.init function ()
      // this.supr();
      var data = this.data;
      // localStorage
      if(window.localStorage){
        this.$on('update', function(){
          localStorage.setItem('items',JSON.stringify(this.data.items))
        })
      }
    },
    // get the list;
    getList: function(filter){
      if(!filter || filter === 'all') return this.data.items;
      else return this.data.items.filter(function(item){
        return filter === 'completed'? item.completed : !item.completed;
      });
    },
    // toggle all todo's completed state
    toggleAll: function(sign){
      this.data.items.forEach(function(item){
        return item.completed = !sign;
      });
    },
    // clear all compleled
    clearCompleted: function(){
      this.data.items = this.data.items.filter(function(item){
        return !item.completed
      });
    },
    // create a new todo
    newTodo: function(editTodo){
      var data = this.data;
      data.items.unshift({description: editTodo});
      data.editTodo = "";
    },
    // remove a todo
    remove: function(index){
      this.data.items.splice(index,1); 
    }
  }).filter({
    every: {
      get: function(value, key){
        return value.filter(function(item){
          return item[key] 
        }).length === value.length
      },
      set: function(value, key, items){
        items.forEach(function(item){
          item[key] = value
        })
        return items
      }
    }
  })
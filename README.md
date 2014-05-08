// @TODO:
1. 

// @idea

1. Termin is a vm
2. vm's style
  ```
  var Yixin = Termin.extend()
    .directive('on-click' ,{
         
    })

  Template = Yixin.


  var List = Yixin.extend({
    name: 'ng-style2',
    template: '<comment data={hello}/>',
    // beofre render. after data init
    $create: function(){
      this.supr(); 
    },
    $destroy: function(){
      this.supr();
    }
  });

  // or
  window.ListStyle = Yixin.extend({
    
  })

  new ListStyle({name: 1});


  var Name = Yixin.extend({
    template: '<span class="title">{>data| template}</span>name',
    $created: function(){

    },
    $updated: function(){

    },
    $removed: function(){
      
    }
  });

  var vm = new List();

  ```

 Vue.compile('hello', 'name') 

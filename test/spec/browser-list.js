var Regular = require_lib("index.js");
void function(){

  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }

  describe("List", function(){
    var container = document.createElement('div');

    describe("basic", function(){
      it("the list based on range should work", function(){
        var list = "<div t-test={num} class='m-model'>{#list 1..3 as num}<div class='a-{num}'>{num}</div> {/list}</div>"
        var BaseComponent = Regular.extend({
          template: list
        })

        var component = new BaseComponent().$inject(container);
        expect($("div",container).length).to.equal(4);
        expect($(".a-1",container)[0].innerHTML).to.equal("1");
        expect($(".a-2",container)[0].innerHTML).to.equal("2");
        expect($(".a-3",container)[0].innerHTML).to.equal("3");
        destroy(component, container);
      })

      it("should destroy clear when have non parentNode", function(){
        var list = "{#list 1..3 as num}{num}{/list}"
        var component = new Regular({
          template: list
        }).$inject(container);
        expect(container.innerHTML.slice(-3)).to.equal("123")
        destroy(component, container);
      })

      it("the dom should sync with the 'sequence' value", function(){
        var list =
          "{#list todos as todo}" + 
            "<div class='a-{todo_index}'>{todo.content}</div>" + 
          "{/list}";
        var component = new Regular({
          data: {todos: [{content: "hello"}, {content: "hello2"}]},
          template: list
        }).$inject(container);
        // expect($("div",container).length).to.equal(2);
        // expect($(".a-0",container)[0].innerHTML).to.equal("hello");
        // expect($(".a-1",container)[0].innerHTML).to.equal("hello2");

        component.$update(function(data){
          data.todos.push({content: 'lily'})
          data.todos[0].content = 'people'
        })


        expect($(".a-0",container)[0].innerHTML).to.equal("people");
        // expect($(".a-1",container)[0].innerHTML).to.equal("hello2");
        // expect($(".a-2",container)[0].innerHTML).to.equal("lily");

        destroy(component, container);
      })

      it("list should work with sibling node or text", function(){
        var list =
          "<a>name</a>{#list todos as todo}" + 
            "<div >{todo.content}</div>" + 
          "{/list}xxx";
        var component = new Regular({
          data: {todos: [{content: "hello"}, {content: "hello2"}]},
          template: list
        }).$inject(container);

        expect($('a', container).length).to.equal(1);
        expect($("div",container).length).to.equal(2);
        expect(container.innerHTML.slice(-3)).to.equal('xxx');
        destroy(component, container);

      })
      it("delete first element should sync with dom", function(){
        var todos = [{content: "hello"}, {content: "hello2"}]
        var list =
          "{#list todos as todo}" + 
            "<div >{todo_index}{todo.content}</div>" + 
          "{/list}";
        var component = new Regular({
          data: {todos: todos},
          template: list
        }).$inject(container);

        expect($("div",container).length).to.equal(2);
        expect(nes.one("div", container).innerHTML).to.equal("0hello");

        todos.shift();
        component.$update()
        expect(nes("div", container).length).to.equal(1);
        expect(nes.one("div", container).innerHTML).to.equal("0hello2");
        destroy(component, container);

      })

      it("the VARIABLE_index should work as expected", function(){
        var list =
          "{#list 1..4 as num}" + 
            "<div class='a-{num}'>{num_index}</div>" + 
          "{/list}"
        var component = new Regular({
          data: {todos: [{content: "hello"}, {content: "hello2"}]},
          template: list
        }).$inject(container);

        expect($("div",container).length).to.equal(4);
        expect($("div",container)[0].innerHTML).to.equal("0");
        expect($("div",container)[1].innerHTML).to.equal("1");
        expect($("div",container)[2].innerHTML).to.equal("2");


        destroy(component, container);

      })

      it("the 'sequence' with expression should work as expect", function(){
        var list =
          "{#list this.filter() as num}" + 
            "<div>{num_index}</div>"+
          "{/list}"
        var List = Regular.extend({
          template: list, 
          data: { len: 1, todos:[1,2,3,4,5,6] },
          filter: function(){
            var data = this.data;
            return data.todos.slice(0, data.len);
          }
        });
        var component = new List().$inject(container);

        expect($("div",container).length).to.equal(1);

        component.$update('len',5);
        expect($("div",container).length).to.equal(5);
        expect($("div",container)[4].innerHTML).to.equal("4");

        destroy(component, container);

      })
      it("on,off's context should point to outer component", function(){
        var context, num=0;
        var Component = Regular.extend({
          template: "{#list 1..2 as i} <li tmp-test></li> {/list}"
        }).directive({
          "tmp-test":function(){
            this.$on("hello", function(){
              num++;
            })
          }
        })
        var component = new Component();
        component.$emit("hello");

        expect(num).to.equal(2);

      })
    })
    describe("list with nested", function(){

      it("list can work with component", function(){

      var TodoComponent = Regular.extend({
        name: 'todo',
        template: "<div>{content}</div>"
      });

      var component = new Regular({
        data: {todos: [{content: "hello"}, {content: "hello2"}]},
        template: 
          "{#list todos as todo}\
            <todo content={todo.content}/>\
           {/list}"
      }).$inject(container);

      expect($("div",container).length).to.equal(2);
      expect($("div", container)[0].innerHTML).to.equal("hello");
      expect($("div", container)[1].innerHTML).to.equal("hello2");

      destroy(component, container)

      })

      it("nested list should have the outerComponent's context", function(){
        var container = document.createElement('div');

        var list =
          "{#list 1..2 as todo}" + 
            "<div class='sub' data-value={this.get(todo_index)}>" + 
            "{#list 1..2 as num}" + 
            "<div class='sub2'>{this.get(num_index)}</div>"+
            "{/list}" +
            "</div>"+
          "{/list}"
        var List = Regular.extend({
          hello: "123456",
          template: list, 
          get: function(index){
            return this.data.todos[index].content;
          }
        });
        var component = new List({
          data: {todos: [{content: "hello"}, {content: "hello2"}]}
        }).$inject(container);

        expect($("div",container).length).to.equal(6);
        expect($(".sub:nth-child(10n+1)",container).attr("data-value")).to.equal("hello");
        expect($(".sub:nth-child(10n+2)",container).attr("data-value")).to.equal("hello2");
        expect($(".sub2:nth-child(10n+1)",container).html()).to.equal("hello");
        expect($(".sub2:nth-child(10n+2)",container).html()).to.equal("hello2");

        component.$update('todos[0].content', 'changedvalue');
        expect($(".sub:nth-child(10n+1)",container).attr("data-value")).to.equal("changedvalue");
        expect($(".sub2:nth-child(10n+1)",container).html()).to.equal("changedvalue");

        destroy(component, container)

      })

      it("list with table should work correctly", function(){
        var container = document.createElement('table')
        var list =
          "{#list todos as todo}" + 
            "<tr class={this.get(todo_index)}>" + 
            "{#list 1..2 as num}" + 
            "<td>{this.get(num_index)}</td>"+
            "{/list}" +
            "</tr>"+
          "{/list}"
        var List = Regular.extend({
          template: list, 
          get: function(index){
            return this.data.todos[index].content;
          }
        });
        var component = new List({
          data: {todos: [{content: "hello"}, {content: "hello2"}]}
        }).$inject(container);

        expect($("td",container).length).to.equal(4);

        expect($("td:nth-child(10n+1)",container).html()).to.equal("hello");
        expect($("td:nth-child(10n+2)",container).html()).to.equal("hello2");

        component.$update(function(data){
          data.todos.push({content: "hello3"})
        })

        expect($("td",container).length).to.equal(6);
        destroy(component, container);

      })

      it("list should get the parent's directive", function(){
        var container = document.createElement('table')
        var num = 0;
        var Component = Regular.extend({})
          .directive('r-name', function(elem, value){
            num++;
          })
        var component = new Component({
          template: "{#list 1..2 as num}<div r-name='name'>haha</div>{/list}"
        }).$inject(container)

        expect(num).to.equal(2);

        destroy(component, container);
      })
      it("component in list should works as expect", function(){
        var container = document.createElement('div')
        var num = 0;
        var Component = Regular.extend({})
          .directive('r-name', function(elem, value){
            num++;
          })

        var Item = Regular.extend({
          template: "<p>{item}</p>",
          name: 'item'
        })
        var component = new Regular({
          data: {items: ["item1", "item2"]} ,
          template: "{#list items as item}<item item={item} />{/list}"
        }).$inject(container)

        expect($("p",container).length).to.equal(2);
        expect($("p", container)[0].innerHTML).to.equal("item1");
        expect($("p", container)[1].innerHTML).to.equal("item2");

        component.$update(function(data){
          data.items.push("item3");
          data.items[0] = "item11";
        })
        expect($("p",container).length).to.equal(3);
        expect($("p", container)[0].innerHTML).to.equal("item11");
        expect($("p", container)[2].innerHTML).to.equal("item3");

        destroy(component, container);
      })

      var container = document.createElement('div')
      
      it("input:checkbox in list should have correct type", function(){
        var List = Regular.extend({
          template: "<div>{#list items as item}<input type='checkbox' class='1' >{/list}</div>"
        });

        var component = new List({
          data: {
            items: [1,2,3,4]
          }
        }).$inject(container)

        var inputs = nes.all("input", container);
        var types = inputs.map(function(node){
          return node.type
        })

        expect(types).to.eql(["checkbox","checkbox","checkbox","checkbox"])

        destroy(component, container);


      })

      it("array change from Array back to undefined, should not throw undefined", function(){
        var list = new Regular({
          template: "<div ref=cnt>{#list items as item}<p>{item}</p>{/list}</div>",
          data: {items: [1]}
        })
        expect(nes.all("p", list.$refs.cnt).length).to.equal(1);
        list.$update("items", undefined);
        expect(nes.all("p", list.$refs.cnt).length).to.equal(0);



      })


        it("item in list should not emit ,init, update or destroy to outerComponent", function(){
        var List = Regular.extend({
          template: "{#list items as item}<div>{item}</div>{/list}"
        })
        var initTimes = 0;
        var destroyTimes = 0;
        var updateTimes = 0;
        var component = new List({
          data: {
            items: [1,2,3]
          },
          events: {
            $init: function(){
              initTimes++
            },
            $destroy: function(){
              destroyTimes++
            },
            update: function(){
              updateTimes++
            }
          }
        })

        expect(initTimes).to.equal(1);
        expect(destroyTimes).to.equal(0);
        expect(updateTimes).to.equal(1);

        component.$update(function(data){
          data.items.pop();
        })
        
        expect(initTimes).to.equal(1);
        expect(destroyTimes).to.equal(0);
        expect(updateTimes).to.equal(2);

        component.destroy();

      })


    it("list in list should not thorw error , when both of them are update", function(){
      // beacuse if not record.
      var List = Regular.extend({
        template: "<div ref=cnt>{#list list1 as it1}<ul>{#list list2 as it2}{it2}{/list}</ul>{/list}</div>",
        data: {list1:[1], list2: [2]}
      })
      var list = new List;

      list.data.list1 = [];
      list.data.list2 = [];
      list.$update()

      expect(nes.all('ul',list.$refs.cnt).length).to.equal(0);

      list.destroy();

    })
    })
  })

}()
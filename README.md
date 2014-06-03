# Regular = react(ractive) + angular.

regular provide angular-way's data-binding, string-based template to help us create reusable and reactive component that can be integrated with whatever framework you already used;

with less than 10 line code then you already have a simple but whole note component, you can also see it in [jsfiddle]()

```
var NoteApp = Regular.extend({
  template: 
    "{{#list nodes as c}}\
      <p>{{c.content}} <a on-click={{this.remove(c)}}>Delete The Note</a></p>\
     {{/list}}\
     <textarea r-model={{draftComment}}></textarea><button on-click={{this.add()}}>Post new Note</button>\
    "
  remove: function(c){
    var notes = this.data.nodes;
    var index = notes.indexOf(c);
    if(~index) notes.splice(index,1);
  },
  add: function(){
    var data = this.data;
    data.items.push({content: data.draftComment})
    data.draftComment = "";
  }
});
new CommentApp({nodes:[]}).inject(document.body);
```


> __Regular is still in heavily development, current version is not stable enough__


## Download

1. install with bower 
  * confirm you installed [bower](https://github.com/bower/bower) or just type `npm install -g bower`
  * `bower install regularjs` or add regularjs dependency in you `bower.json`

2. clone this repo, or download the [latest package]

3. now you can find `regular.js` and `regular.min.js` in `dist` folder;


## Document

currently, there is only __Chinese version__

*. [中文文档](https://github.com/regularjs/regular/wiki/Document/Chinese.md)



## [LICENSE](https://github.com/regularjs/regular/blob/master/LICENSE)

MIT.



## TODO

2. template还是script id 的判断过于无端
3. maybe add casper
4. directive 的link放在init之前做，这样初始化的结构已经出现了。
5. @TODO watch 同一个表达式(将不会创建两个watcher)






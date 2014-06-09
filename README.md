# Regular = react(ractive) + angular.

regular is a live template engine that provide angular-way's data-binding, string-based template to help us create reusable and reactive component that can be integrated with whatever framework you already used;

with less than 20 line code then you already have a simple note component, you can also see it in [jsfiddle](http://jsfiddle.net/leeluolee/e6yD3/)

```
var NoteApp = Regular.extend({
  template: 
    "{{#list notes as c}}\
        <p>{{c.content}} <a href='#' on-click={{this.remove(c)}}>remove</a></p>\
     {{/list}}\
     <textarea r-model={{draftComment}}></textarea><button on-click={{this.add()}}>new Note</button>",
  remove: function(c){
    var notes = this.data.notes;
    var index = notes.indexOf(c);
    if(~index) notes.splice(index,1);
  },
  add: function(){
    var data = this.data;
    data.notes.push({content: data.draftComment})
    data.draftComment = "";
  }
});

new NoteApp({notes:[]}).inject(document.body);
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


## Guide

Coming soon...


## [LICENSE](https://github.com/regularjs/regular/blob/master/LICENSE)

MIT.



## TODO

3. maybe add casper
5. @TODO watch 同一个表达式(将不会创建两个watcher)
7. html插值
8. https://developer.github.com/v3/ , loadmore  component;






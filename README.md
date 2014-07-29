![logo](http://regularjs.github.io//asserts/image/regular-icon-100.png) 

# regular = react(ractive) + angular.

[![Build Status](https://travis-ci.org/regularjs/regular.svg?branch=master)](https://travis-ci.org/regularjs/regular)

regularjs is a live template engine helping us to create interactive component.

__features__

1. __data-binding__ based on dirty-check
2. __string-based template__ 
3. __independent lifecycle__ —— can be integrated with whatever framework you already used.
4. __nested component__
5. class-based component. just like [angular-classy](http://davej.github.io/angular-classy/) do for angular
6. __directive, filter, event__ is supported, and extend easily.
7. The template's rule is extensiable(need Parser packaged).

## Take a glance at regularjs

with the code that less than 20 line , a simple noteapp is done. check the result on [jsfiddle](http://jsfiddle.net/leeluolee/e6yD3/)

__template__

```html
{{#list notes as c}}
  <p>{{c.content}}<a href='#' on-click={{this.remove(c)}}>remove</a></p>
{{/list}}
<textarea r-model={{draftComment}}></textarea><button on-click={{this.add()}}>new Note</button>
```

__javascript__
```javascript
var NoteApp = Regular.extend({
  template: "#todos",
  remove: function(index){
    this.data.notes.splice(index,1);
  },
  add: function(){
    var data = this.data;
    data.notes.push({ content: data.draftComment})
    data.draftComment = "";
  }
});

new NoteApp({ data: {notes:[] }}).inject(document.body);
```




## Installation

regularjs can be installed via `component` and `bower` . you can also directly download the [latest package](https://github.com/regularjs/regular/archive/master.zip)

then you can find `regular.js` and `regular.min.js` in `dist` folder;

or....

```html
<script src="https://rawgit.com/regularjs/regular/master/dist/regular.min.js"></script>
```




## Resource

* __[regular's Offcial Guide](http://leeluolee.gitbooks.io/regular-guide/)__(use gitbook)
* __[Offcial Site ](http://regularjs.github.io)__


## Community

* If you find bugs or have suggestion, please feel free to open [an issue](https://github.com/regularjs/regular/issues)

* Ask any questions on [Stack Overflow](http://stackoverflow.com/questions/tagged/regularjs) with tag `regularjs`. 

* Social 
  1. twitter: follow the [@regularjs](https://twitter.com/regularjs). 
  2. weibo: chinese friends can also follow author's weibo[@拴萝卜的棍子](http://weibo.com/luobolee)

## Contribute

__regularjs is still in heavily development__, helping us with pull request and  feedback. there is some recommend to contributor.

* Please [open issue](https://github.com/regularjs/regular/issues) before sending pull request, 
* if needed, add your testcase at `test/specs` folder. always make sure the `gulp test` is passed, and the `test/runner/index.html` is passed in every target browser (if you doesn't have some browser installed that list in [gulpfile's karmaConfig](https://github.com/regularjs/regular/blob/master/gulpfile.js#L30))

##Gulp Task

###1. `gulp test`
the test command contains `casper`, `mocha`, `karma`. and output the coverage information

###2. `gulp dev`
watch and build the source code

###3. other... see the gulpfile.js


## [LICENSE](https://github.com/regularjs/regular/blob/master/LICENSE)

MIT.

## Browser Compatibility

IE7+ and other modern browser. __In fact, most of our products need to support IE6, so ie6 is still under testing currently__

## Changelog

* `0.2.2`: you can use `delegate-[event]` to delegate the event from element to containerElement.
* `0.2.1`: now pass `Non-Expression` to `on-*` attribute will proxy the event to specified event.

* `0.2.0`: 
  1. `@(Expression)` to create binding-once Expression 
  2. lightweight animation support
  3. svg support
  4. `{{#if }}` can be used in tag. like `<div {{#if !user }} on-click = {{this.login()}}{{/if}}></div>`


## TODO

1. example gallery   `progressing`
2. interactive tutorial
3. blog
5. Hexo-renderer-mcss


<a href="http://regularjs.github.io">
  ![regularjs](http://regularjs.github.io/image/regular-icon-100.png)
</a>

> <p align='center'><b>After version 0.3.0: regularjs change the default TAG from `{{}}` to the more clean`{}`</b>, please use `Regular.config({BEGIN:'{{', END: '}}'})` if you need the old syntax`</p>

# Regularjs


[![Build Status](http://img.shields.io/travis/regularjs/regular/master.svg?style=flat-square)](http://travis-ci.org/regularjs/regular)

> Regularjs is a __living template engine__ that helping us to create data-driven component.




## Features

- __String-based template__ make it flexible to build your component.
- __data-binding__ is based on dirty-check, angular experience also make sense to regularjs
- __self-contained and well encapsulation__, make it be easily integrated with other framework
- __composite component__ , using component as 'custom element'.
- __directive, filter, event and animation...__  all you need is provided out of box with __concise API__



## Quirk Start

### Example 1: __define a simple Note Component__

```javascript
var Note = Regular.extend({
template: 
  "<input {#if !disabled} r-model='hello' {#else} disabled {/if} > {hello} \
<button on-click={disabled = !disabled}>{disabled? 'active': 'disable'} it</button>"
})

// inject component into #app , you can also inject at 'before' , 'after', 'top'.
var note = new Note().$inject("#app"); 

```

__[Example1 on codepen.io](http://codepen.io/leeluolee/pen/JqAaH)__

 the Example is dead simple, but you can find the directive and attribute is easily switched by statement 'if'. which is difficult with other mvvm framework. 


### Example 2: __define a List Component__

```javascript
var NoteList = Regular.extend({
template: 
  "<ul>{#list notes as nt}" +
    "<li class={nt.done? 'done': ''} on-click={nt.done= !nt.done}>{{nt.content}}</li>" + 
  "{/list}</ul>"
});

var list = new NoteList({
  data: {notes: [{content: 'playgame'}, {content: 'homework'}]}
}).$inject("#app");


```

In this Example, we create a ListView by statement `list`. 

__[Example2 on codepen.io](http://codepen.io/leeluolee/pen/mAKlL)__


### Example 3: combine Note with NoteList

we need refactor Note to make it composable.

```javascript
var Note = Regular.extend({
  name: 'note',  // register component during the definition of Component
  template: 
   "<input r-model={draft}> <button  on-click={this.post()}> post</button>", 
  post: function(){
    var data = this.data;
    this.$emit('post', data.draft);
    data.draft = ""; //clear the draft
  }

});

Regular.component('list', NoteList);  // manual register a component

```
when 'Enter' is pressed, we emit a 'post' event with the `draft` as the $event object. 

> the `this` in template is pointing to the component self. 

then, define Core Component: NoteApp.

```javascript
var NoteApp = Regular.extend({
  template: 
    "<note on-post={notes.push({ content: $event} )}/>"+ 
    "<list notes ={notes}></list>"
})

var noteapp = new NoteApp({
    data: {notes:[] }
});

noteapp.$inject('#app');

```

you can register a component(via attribute `name` or method `Component.component`) to make them composable in other component.

__[Example3 on codepen.io](http://codepen.io/leeluolee/pen/bqkLp)__


See more on [Guide: Quirk Start](http://regularjs.github.io/guide/en/getting-start/README.html)

## Resources

* __[Offcial Site ](http://regularjs.github.io)__
* __[Reference ](http://regularjs.github.io/reference)__


## Browser Compatibility

IE7+ and other modern browser. 


## installation

###bower

```javascript
bower install regularjs
```

`dist/regular.js` have been packaged as a standard UMD, you can use it in AMD、commonjs and global.

### npm (browserify or other based on commonjs)

```js
npm install regularjs
```

use

```js
var Regular = require('regularjs');
```


### component

```js
component install regularjs/regular
```
use

```js
var Regular = require('regularjs/regular');
```



### Directly download

1. [regular.js](https://rawgit.com/regularjs/regular/master/dist/regular.js)
2. [regular.min.js](https://rawgit.com/regularjs/regular/master/dist/regular.min.js)


## Who are using ?

1. [NetEase](https://github.com/NetEase) : operator of famous [www.163.com](http://www.163.com).



## Community

* If you find bugs or have suggestion, please feel free to open [an issue](https://github.com/regularjs/regular/issues)

* Ask any questions on [Stack Overflow](http://stackoverflow.com/questions/tagged/regularjs) with tag `regularjs`. 

* Social 
  1. twitter: follow the [@regularjs](https://twitter.com/regularjs). 
  3. gitter: talk on [![Gitter chat](https://badges.gitter.im/regularjs/regular.png)](https://gitter.im/regularjs/regular)
  2. weibo: [@拴萝卜的棍子](http://weibo.com/luobolee)

## Contribute

__regularjs is still in heavily development__, helping us with feedback. there is some recommend to contributor.

* Please [open issue](https://github.com/regularjs/regular/issues) before sending pull request, 
* if needed, add your testcase at `test/specs` folder. always make sure the `gulp test` is passed, and the `test/runner/index.html` is passed in every target browser (if you doesn't have some browser installed that list in [gulpfile's karmaConfig](https://github.com/regularjs/regular/blob/master/gulpfile.js#L30))



## LICENSE

[MIT](https://github.com/regularjs/regular/blob/master/LICENSE).




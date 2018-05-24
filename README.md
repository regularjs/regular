[![regularjs](http://regularjs.github.io/image/regular-icon-100.png)](http://regularjs.github.io)

# Regularjs


[![Build Status](http://img.shields.io/travis/regularjs/regular/master.svg?style=flat-square)](http://travis-ci.org/regularjs/regular)

> Regularjs is a __living template engine__ that helps us to create data-driven components.


* __[✨中文指南 ](http://regularjs.github.io/guide/zh/index.html)__
* __[✨中文API ](http://regularjs.github.io/reference/?api-zh)__


## Features

- __String-based template__ makes it flexible to write your component;
- __data-binding__ based on dirty-check: experience from AngularJS-like frameworks also makes sense to regularjs;
- __self-contained and well-defined encapsulation__ makes it more easily integrated with other frameworks;
- __composite components__: components can be used as "custom elements";
- __directive, filter, event and animation...__  all you need is provided out of the box with __concise API__.



## Quick Start

### Example 1: __define a simple Note Component__

```javascript
var Note = Regular.extend({
  template:
    "<input {#if !disabled} r-model='hello' {#else} disabled {/if} > {hello} \
    <button on-click={disabled = !disabled}>{disabled? 'active': 'disable'} it</button>"
});

// inject component into #app , you can also inject at 'before' , 'after', 'top'.
var note = new Note().$inject("#app");

```

__[Example1 on codepen.io](http://codepen.io/leeluolee/pen/JqAaH)__

This example is dead simple, but you can find the directive and attribute is easily switched by statement 'if', which is difficult with other mvvm frameworks.


### Example 2: __define a List Component__

```javascript
var NoteList = Regular.extend({
  template:
    "<ul>{#list notes as nt}" +
      "<li class={nt.done? 'done': ''} on-click={nt.done= !nt.done}>{{nt.content}}</li>" +
    "{/list}</ul>"
});

var list = new NoteList({
  data: {
    notes: [
      {content: 'playgame'},
      {content: 'homework'}
    ]
  }
}).$inject("#app");

```

In this Example, we create a ListView with the statement `list`.

__[Example2 on codepen.io](http://codepen.io/leeluolee/pen/mAKlL)__


### Example 3: combine Note with NoteList

We need to refactor Note to make it composable.

```javascript
var Note = Regular.extend({
  name: 'note',  // register component during the definition of Component
  template:
   "<input r-model={draft}> <button on-click={this.post()}> post</button>",
  post: function(){
    var data = this.data;
    this.$emit('post', data.draft);
    data.draft = ""; //clear the draft
  }
});

Regular.component('list', NoteList);  // manual register a component

```

When 'Enter' is pressed, `Note` will emit a 'post' event with `draft` as the $event object.

> The keyword `this` in the template refers to the component itself.

Then, let's define the core component: NoteApp.

```javascript
var NoteApp = Regular.extend({
  template:
    "<note on-post={notes.push({ content: $event} )}/>"+
    "<list notes ={notes}></list>"
});

var noteapp = new NoteApp({
    data: {notes:[]}
});

noteapp.$inject('#app');

```

you can register a component (via attribute `name` or method `Component.component`) to make it composable in other components.

__[Example3 on codepen.io](http://codepen.io/leeluolee/pen/bqkLp)__


See more on [Guide: Quick Start](http://regularjs.github.io/guide/en/getting-start/README.html)

## Resources

* __[Official Site ](http://regularjs.github.io)__
* __[Reference ](http://regularjs.github.io/reference)__


## Browser Compatibility

IE7+ and other modern browsers.


## Installation

### bower

```javascript
bower install regularjs
```

`dist/regular.js` has been packaged as a standard UMD, and therefore you can use it in AMD, commonjs or global.

### npm (browserify or other based on commonjs)

```bash
$ npm install regularjs
```

use

```js
var Regular = require('regularjs');
```


### component

```bash
$ component install regularjs/regular
```
use

```js
var Regular = require('regularjs/regular');
```



### Direct download

1. [regular.js](https://rawgit.com/regularjs/regular/master/dist/regular.js)
2. [regular.min.js](https://rawgit.com/regularjs/regular/master/dist/regular.min.js)


## Who are using?

1. [NetEase](https://github.com/NetEase): the operator of the famous website [www.163.com](http://www.163.com).



## Community

* If you find any bug or have any suggestion, please feel free to [open an issue](https://github.com/regularjs/regular/issues)

* Ask any question on [Stack Overflow](http://stackoverflow.com/questions/tagged/regularjs) with tag `regularjs`.

* Social
  1. twitter: follow the [@regularjs](https://twitter.com/regularjs)
  1. gitter: join chat at [![Gitter chat](https://badges.gitter.im/regularjs/regular.png)](https://gitter.im/regularjs/regular)
  1. weibo: [@拴萝卜的棍子](http://weibo.com/luobolee)

## Contributing

__regularjs is still under heavy development__, and please help us with feedback. Contributing to this project is also welcome.

* Please [open an issue](https://github.com/regularjs/regular/issues) before sending pull request
* if needed, add your testcase in `test/specs` folder. Always make sure the `gulp test` is passed, and the `test/runner/index.html` is passed in every target browser (if a certain browser is not installed, list that in [gulpfile's karmaConfig](https://github.com/regularjs/regular/blob/master/gulpfile.js#L30))



## LICENSE

[MIT](https://github.com/regularjs/regular/blob/master/LICENSE).

## TODO

remove log code in production mode;
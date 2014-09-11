<a href="http://regularjs.github.io">
  ![regularjs](http://regularjs.github.io/image/regular-icon-100.png)
</a>

# Regularjs


[![Build Status](http://img.shields.io/travis/regularjs/regular/master.svg?style=flat-square)](http://travis-ci.org/regularjs/regular)

> Regularjs is a __live template engine__ helping us to create data-driven component.




## Features

- __String-based template__ make it easy and flexible to build your component.
- __data-binding__ based on dirty-check, angular experience also make sense to regularjs
- __self-contained and well encapsulation__, friendly with large-project
- __nested and composite component__, use component just like custom element.
- __directive, filter, event and animation...__  all you need is provided out of box with __concise API__



## Quirk Start

define a Regular Component can not be simple any more.

```js
var Note = Regular.extend({
template: 
  "<input {{#if !disabled}} r-model='hello' {{#else}} disabled {{/if}}  > {{hello}} \
<button on-click={{disabled = !disabled}}>{{disabled? 'active': 'disable'}} it</button>"
})

var note = new Note().$inject("#app");

```

__[Result on codepen.io](http://codepen.io/leeluolee/pen/JqAaH)__

It is very simple, but hard to implement in other mvvm library or template. beacuse regularjs is based on string-based parser and dom-based compiler.

See more on [Quirk Start](http://regularjs.github.io/guide/en/getting-start/README.html)

## Resources

* __[regular's Offcial Guide](http://regularjs.github.io/guide/)__(use gitbook)
* __[Offcial Site ](http://regularjs.github.io)__
* __[demo on codepen.io](http://codepen.io/search?q=regularjs&limit=all&depth=everything&show_forks=false)__


## Browser Compatibility

IE7+ and other modern browser. 

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


## Who is use ?

1. [NestEase](https://github.com/NetEase) : operator of famous [www.163.com](http://www.163.com).





## LICENSE

[MIT](https://github.com/regularjs/regular/blob/master/LICENSE).




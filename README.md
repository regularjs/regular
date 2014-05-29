# Regular = react(ractive) + angular.

# Regular is in very unstable version and still in busy-developing

The current(future the same) web is component but not data-binding, the angular's success just beacuse that the most component(widget) can be describe with some internal state(react's way), angular's scope do it, in some way it just a coincidence;but angular is diffcult to integrated with other framework beacuse the nested scope relation and the clever(difficult) lifecycle;

In first version regular is aim to change react's way(jsx with function in js) way to describe component structure and state-logic, instead of the template combine with the react's virtual-dom; 

<del>facebook say "there is no dirty-check in model", but you see it has "dirty-check in virtual dom" , so they only have the half perfomance compare to another brother(angular, ractive also regular)</del> whereas react achive the pure one-way data-flow with virtual-dom with full-render at every update;

Regular combine the advantage of react(nested component) and ractive(string based template) and angular(dirty check data-bind) to help you to build reactive component(ui), and can be integated with whatever framework(like backbone) you like;


# TODO

1. consistency binding-style (expression and constant)

# DOCUMENT(Coming soon...)

## template Syntax


# Tips

1. Best practice is to operate only in the __init__ function, only manipulate the data at other function;


# [LICENSE](https://github.com/regularjs/regular/blob/master/LICENSE)

MIT.


# event bubble,  data down flow( children component can easily destroied);


# TODO

1. use(implement)扩展, 全局开启（这个是前期就可以优化的点）
2. template还是script id 的判断过于无端
3. filter该如何处理?
4. 仔细看下Promise
5. 好处就是不会有大量的j-xxx 也不会有data-xxx来保存页面数据
6. tag 必须存在 end point 中(git)
7. 常量， 以及undefined的expression不会触发watch。比如 if username 如果username未定义的话；第一个判断就不会出现
8. direct $bind to acheive two-way binding in components;

#不足
 1. 每次都需要this.data来获取数据模型




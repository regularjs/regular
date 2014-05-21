# Regular = react(ractive) + angular.

# Regular is in very unstable version and still in busy-developing

The current(future the same) web is component but not data-binding, the angular's success just beacuse that the most component(widget) can be describe with some internal state(react's way), angular's scope do it, in some way it just a coincidence;but angular is diffcult to integrated with other framework beacuse the nested scope relation and the clever(difficult) lifecycle;

In first version regular is aim to change react's way(jsx with function in js) way to describe component structure and state-logic, instead of the template combine with the react's virtual-dom; 


<del>facebook say "there is no dirty-check in model", but you see it has "dirty-check in virtual dom" , so they only have the half perfomance compare to another brother(angular, ractive also regular)</del> whereas react achive the pure one-way data-flow with virtual-dom with full-render at every update;

Regular combine the advantage of react(nested component) and ractive(string based template) and angular(dirty check data-bind) to help you to build reactive component(ui), and can be integated with whatever framework(like backbone) you like;


# TODO

1. consistency binding-style (expression and constant)

# DOCUMENT(Coming soon...)





# [LICENSE](https://github.com/regularjs/regular/blob/master/LICENSE)

MIT.




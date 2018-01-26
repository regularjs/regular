var Regular = require('../../..');
var ssr = require('../../../src/render/server.js');

var Modal = Regular.extend({
  name: 'modal',
  template: `
<div class="modal show {clazz}">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" on-click={this.close()} data-dismiss="modal" aria-hidden="true">×</button>
        <h4 class="modal-title">{title}</h4>
      </div>
      <div class="modal-body">
        {#include content }
      </div>
      <r-component is='nested' title={title} on-click={click} >
        <div class='dada {clazz}-2 dada'>{#inc content}</div>
      </r-component>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" on-click={this.close()} >Close</button>
        <button type="button" class="btn btn-primary" on-click={this.confirm()}>Confirm</button>
      </div>
    </div>
  </div>
</div>
  `,
  close: function(){
    this.$emit('close');
    this.destroy();
  },
  confirm: function(){
    this.$emit('confirm', this.data);
    this.destroy();
  }
});

var Nested = Regular.extend({
  name: 'nested',
  template: '<div class="nested">{title}</div><transclude>{#inc this.$body}</transclude>'

})


console.log(
  ssr.render(Modal, {
    data: {
      clazz: '1', 
      title: "服务端渲染",
      content: `
        {#list books as book}
        <div>{book.name}</div>
        {/list}
      `,
      books: [{name:'高级程序设计'}, {name:'编程语言实现模式'}]
    }
  })
)



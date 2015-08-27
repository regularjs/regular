void function(){
  window.Pager = Regular.extend({
    name: 'pager',
    template: 
     "<div class='m-page {clazz}'>\
         <a  href='javascript:;' delegate-click={ this.nav(current-1)} class='pageprv {current==1? \"z-dis\": \"\"}'>Prev</a>\
          {#if total - 5 > show * 2}\
            <a href='javascript:;' delegate-click={ this.nav(1)} class={current==1? 'z-crt': ''}>1</a>\
            {#if begin > 2}<i>...</i>{/if}\
            {#list begin..end as i}\
            <a href='javascript:;'delegate-click={ this.nav(i)} class={current==i? 'z-crt': ''} >{i}</a>\
            {/list}\
            {#if (end < total-1)}\
             <i>...</i>\
            {/if}\
           <a href='javascript:;' delegate-click={this.nav(total)} class={current==total? 'z-crt':''}>{total}</a>\
          {#else}\
            {#list 1..total as i}\
              <a href='javascript:;' delegate-click={ this.nav(i)}  class={current==i? 'z-crt': ''}>{i}</a>\
            {/list}\
          {/if}\
        <a href='javascript:;' delegate-click={this.nav(current + 1)}  class='pagenxt {current == total? \"z-dis\": \"\"}'>Next</a>\
      </div>",
    // before init
    config: function(data){
      var count =  5;
      var show = data.show = Math.floor( count/2 );
      data.current = data.current || 1;
      data.total = data.total || 1;

      this.$watch(['current', 'total'], function( current, total ){
        data.begin = current - show;
        data.end = current + show;
        if(data.begin < 2) data.begin = 2;
        if(data.end > data.total-1) data.end = data.total-1;
        if(current-data.begin <= 1) data.end = data.end + show + data.begin- current;
        if(data.end - current <= 1) data.begin = data.begin-show-current+ data.end;
      });
    },
    nav: function(page){
      var data = this.data;
      if(page < 1) return;
      if(page > data.total) return;
      if(page === data.current) return;
      data.current = page;
      this.$emit('nav', page);
    }
  })
}();



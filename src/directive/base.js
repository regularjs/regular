// Regular
var _ = require('../util.js');
var dom = require('../dom.js');
var Regular = require('../Regular.js');
var events = "click dblclick mouseover mouseout change focus blur keydown keyup keypress".split(" ");


events.forEach(function(item){
  Regular.directive('r-'+item, function(elem, value){
    if(!value) return;
    var self = this; 
    dom.on(elem, item, function(event){
      self.data.$event = event;
      value.get(self);
      self.data.$event = null;
      self.$update();
    });
  })
});


Regular.directive('r-enter', function(elem, value){
  if(!value) return;
  var self = this;
  dom.on(elem, 'keypress', function(ev){
    if(ev.which == 13 || ev.keyCode == 13){
      value.get(self);
      self.$update();
    }
  });
})


Regular.directive('r-model', function(elem,value){
  var sign = elem.tagName.toLowerCase();
  if(typeof value === 'string') value = Regular.parse(value);

  switch(sign){
    case "select":
      initSelect.call(this, elem, value);
      break;
    case "input":
      if(elem.type === 'checkbox'){
        initCheckBox.call(this, elem, value);
      }else{
        initText.call(this,elem, value);
      }
    default:
      initText.call(this,elem, value);
  }
}).directive('proxy', function(elem, value){
});




function initSelect(scope, elem, value, parseFn){
  // // 初始化一次
  // if(parseFn(scope)==null){
  //   parseFn.assign(elem.value)(scope);
  // }

  // scope.$watch(parseFn, function(newValue, oldValue){
  //   var children = e._$all('option',elem)
  //   children.forEach(function(node, index){
  //     if(node.value == newValue){
  //       elem.selectedIndex = index;
  //     }
  //   })
  // });

  // function handler(ev){
  //   parseFn.assign(this.value)(scope);
  //   if(!scope.$phase) scope.$update();
  // }
  // v._$addEvent(elem, 'change', handler)
}

function initText(elem, parsed){
  var inProgress = false;
  var self = this;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress){ return; }
    if(elem.value !== newValue) elem.value = newValue == null? "": "" + newValue;
  });

  // @TODO to fixed event
  var handler = function handler(ev){
    var value = (ev.srcElement || ev.target).value
    parsed.set(self, value);
    inProgress = true;
    self.$update();
    inProgress = false;
  }

  if(dom.msie !== 9 && 'oninput' in dom.tNode ){
    elem.addEventListener('input', handler );
  }else{
    dom.on(elem, 'paste', handler)
    dom.on(elem, 'keypress', handler)
    dom.on(elem, 'cut', handler)
  }
}

function initCheckBox(elem, parsed){
  var inProgress = false;
  var self = this;
  this.$watch(parsed, function(newValue, oldValue){
    if(inProgress) return;
    elem.checked = !!newValue;
  });

  var handler = function handler(ev){
    var value = this.checked;
    parsed.set(self, value);
    inProgress= true;
    self.$update();
    inProgress = false;
  }
  if(parsed.set) dom.on(elem, 'change', handler)

}

var Regular = require_lib("index.js");

void function(){
  function destroy(component, container){
    component.destroy();
    expect(container.innerHTML).to.equal('');
  }

  describe("config", function(){
    var container = document.createElement("div");
    it("END and BEGIN can accpet '[' and ']'", function(){

      Regular.config({
        END: ']',
        BEGIN: '['
      })

      var component = new Regular({
        template: "<p>[{a:1}['a']]</p>"
      }).$inject( container );

      expect(nes.one("p",container).innerHTML).to.equal('1');
      destroy(component, container)
    })
    it("END and BEGIN can accpet '{' and '}'", function(){

      Regular.config({
        END: '}',
        BEGIN: '{'
      })

      var component = new Regular({
        template: "<p>{{a:1}['a']}</p>"
      }).$inject( container );

      expect(nes.one("p",container).innerHTML).to.equal('1');
      destroy(component, container)
    })
    it("END and BEGIN can accpet '[[' and ']]'", function(){

      Regular.config({
        END: ']]',
        BEGIN: '[['
      })

      var component = new Regular({
        template: "<p>[[ {a:1}['a'] ]]</p>"
      }).$inject( container );

      expect(nes.one("p",container).innerHTML).to.equal('1');
      destroy(component, container)
    })
    it("END and BEGIN can accpet '{{{' and '}}}'", function(){

      Regular.config({
        END: '}}}',
        BEGIN: '{{{'
      })

      var component = new Regular({
        template: "<p>{{{ {a:1}['a'] }}}</p>"
      }).$inject( container );

      expect(nes.one("p",container).innerHTML).to.equal('1');
      destroy(component, container)
    })
    it("RETURN '{{' and '}}'", function(){

      Regular.config({
        END: '}}',
        BEGIN: '{{'
      })

      var component = new Regular({
        template: "<p>{{{a:1}['a']}}</p>"
      }).$inject( container );

      expect(nes.one("p",container).innerHTML).to.equal('1');
      destroy(component, container)

    })


  })

}()
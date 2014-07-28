casper.test.begin("test syntax list", 1, function (test) {

  casper
  .start("html/syntax-list.html")
  .wait(1000, function(){
    this.echo(this.getHTML())
    test.assertElementCount('p', 3)
  })
  .run(function () {
      test.done()
  })
});
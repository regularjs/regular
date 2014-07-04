casper.test.begin("test syntax list", 1, function (test) {

  casper
  .start("html/syntax-list.html")
  .wait(100, function(){
    test.assertElementCount('p', 3)
  })
  .run(function () {
      test.done()
  })
});
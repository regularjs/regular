casper.test.begin("test syntax list", 1, function (test) {

  casper
  .start("html/syntax-list.html")
  .then(function () {
    test.assertElementCount('form', 1)
  })
  .run(function () {
      test.done()
  })
});
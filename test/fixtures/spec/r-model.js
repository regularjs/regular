// r-model

casper.test.begin('Buildin Directive r-model', 1, function (test) {

  casper
  .start('./html/r-model.html')
  .then(function () {
      test.assertElementCount('form', 1)
  })
  .run(function () {
      test.done()
  })

});




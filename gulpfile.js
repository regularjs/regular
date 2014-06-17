var fs = require('fs');
var gulp = require('gulp');
var component = require('gulp-component');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var through = require('through2');
var before_mocha = require('./test/before_mocha.js');
var pkg;

try{
  pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
}catch(e){
  pkg = {}
}


gulp.task('default', ['build'], function() {});


gulp.task('build', function(){
  // form minify    
  gulp.src('./component.json')
    .pipe(component.scripts({
      standalone: 'Regular',
      name: 'regular'
    }))
    .pipe(wrap(signatrue))
    .pipe(gulp.dest('dist'))
    .pipe(wrap(mini))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .on('error', function(err){
      console.log(err)
    })

  // for test
  gulp.src('./component.json')
    .pipe(component.scripts({
      name: 'regular'
    }))
    .pipe(wrap(signatrue))
    .pipe(gulp.dest('test'))

})




gulp.task('dev', function(){
  gulp.watch(['component.json', 'src/**/*.js'], ['build'])
})

gulp.task('dev-test', function(){
  gulp.watch(['src/**/*.js', 'test/spec/**/*.js'], ['build','mocha'])
})



gulp.task('jshint', function(){
      // jshint
  gulp.src(['src/**/*.js','test/spec/test-*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('default'))

})

gulp.task('cover', function(cb){
  before_mocha.dirty();
  gulp.src(['src/**/*.js'])
    .pipe(istanbul()) // Covering files
    .on('end', function () {
      gulp.src(['test/spec/test-*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports('./test/coverage')) // Creating the reports after tests runned
        .on('end', cb);
    });
})

gulp.task('mocha', function() {

  before_mocha.dirty();

  return gulp.src(['test/spec/test-*.js'])
      .pipe(mocha({reporter: 'spec' }) )
      .on('error', function(){
        gutil.log.apply(this, arguments);
        console.log('\u0007');
      })
      .on('end', function(){
        before_mocha.clean();
      });

});



function wrap(fn){
  return through.obj(fn);
}

function signatrue(file, enc, cb){
  var sign = '/**\n'+ '@author\t'+ pkg.author.name + '\n'+ '@version\t'+ pkg.version +
    '\n'+ '@homepage\t'+ pkg.homepage + '\n*/\n';
  file.contents =  Buffer.concat([new Buffer(sign), file.contents]);
 cb(null, file);
}

function mini(file, enc, cb){
  file.path = file.path.replace('.js', '.min.js');
  cb(null, file)
}
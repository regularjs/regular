var fs = require('fs');
var gulp = require('gulp');
var component = require('gulp-component');
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


gulp.task('default', ['build'], function() {
  // place code for your default task here
});


gulp.task('build', function(){

  gulp.src(['src/**/*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('default'))

  gulp.src('./component.json')
    .pipe(component.scripts({
      standalone: 'terminator',
      name: 'terminator'
    }))
    .pipe(wrap(signatrue))
    .pipe(gulp.dest('dist'))
    .pipe(wrap(mini))
    .pipe(uglify())
    .pipe(wrap(signatrue))
    .pipe(gulp.dest('dist'))

})




gulp.task('dev', function(){
  gulp.watch(['component.json', 'src/**/*.js'], ['build'])
})

gulp.task('dev-test', function(){
  gulp.watch(['src/**/*.js', 'test/spec/**/*.js'], ['mocha'])
})





gulp.task('mocha', function() {
  gulp.src('./component.json')
    .pipe(component.scripts({
      name: 'terminator'
    }))
    .pipe(wrap(signatrue))
    .pipe(gulp.dest('test/runner'))

  before_mocha.dirty();
  return gulp.src(['test/spec/*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(mocha({ 
        require: 'test/before_mocha.js',
        reporter: 'list' }) )
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
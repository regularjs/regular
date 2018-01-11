var fs = require('fs');
var path = require('path');
var karma = require('karma').server;
var _ = require('./src/util.js');
var gulp = require('gulp');
var git = require('gulp-git');
var spawn = require('child_process').spawn;
var shell = require('gulp-shell');
var runSequence = require('run-sequence')
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var webpack = require('gulp-webpack');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var bump = require('gulp-bump');
var through = require('through2');
var pkg;


function inc(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json', './bower.json'])
    // bump the version number in those files
    .pipe(bump({type: importance}))
    // save it back to filesystem
    .pipe(gulp.dest('./'))
    // commit the changed version number
    // .pipe(git.commit('bumps package version'))
    // **tag it in the repository**
    // .pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })



try{
  pkg = require('./package.json')
  pkg_bower = require('./bower.json')
}catch(e){}

var wpConfig = {
  output: {
    filename: "regular.js",
    library: "Regular",
    libraryTarget: "umd"
  }

}

var testConfig = {
  devtool: 'source-map',
  output: {

    filename: "dom.bundle.js"
  }
}



gulp.task('default', ['watch'], function() {});


//one could also externalize common config into a separate file,
//ex.: var karmaCommonConf = require('./karma-common-conf.js');
var karmaCommonConf = {
  browsers: ['Chrome', 'Firefox', 'IE', 'IE9', 'IE8', 'IE7', 'PhantomJS'],
  frameworks: ['mocha'],
  files: [
    'test/runner/vendor/expect.js',
    'test/runner/vendor/jquery.js',
    'test/runner/vendor/nes.js',
    'test/runner/vendor/util.js',
    'test/runner/dom.bundle.js'
  ],
  client: {
    mocha: {ui: 'bdd'}
  },
  customLaunchers: {
    IE9: {
      base: 'IE',
      'x-ua-compatible': 'IE=EmulateIE9'
    },
    IE8: {
      base: 'IE',
      'x-ua-compatible': 'IE=EmulateIE8'
    },
    IE7: {
      base: 'IE',
      'x-ua-compatible': 'IE=EmulateIE8'
    }
  },

  // coverage reporter generates the coverage
  reporters: ['progress', 'coverage'],

  preprocessors: {
    // source files, that you wanna generate coverage for
    // do not include tests or libraries
    // (these files will be instrumented by Istanbul)
    'src/**/*.js': ['coverage']
  },

  // optionally, configure the reporter
  coverageReporter: { 
    type: 'html' 
  }
  
};

/**
 * Run test once and exit
 */
gulp.task('karma', function (done) {
  var config = _.extend({}, karmaCommonConf);
  if(process.argv[3] === '--phantomjs'){
    config.browsers=["PhantomJS"]
    config.coverageReporter = {type : 'text-summary'}
    
    karma.start(_.extend(config, {singleRun: true}), done);
  }else{
    karma.start(_.extend(config, {singleRun: true}), done);
  }
  
});


// build after jshint
gulp.task('build',["jshint"], function(){
  // form minify    
  gulp.src('./src/index.js')
    .pipe(webpack(wpConfig))
    .pipe(wrap(signatrue))
    .pipe(gulp.dest('./dist'))
    .pipe(wrap(mini))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
    .on("error", function(err){
      throw err
    })


})

gulp.task('testbundle',  function(cb){
  return gulp.src("test/test.exports.js")
    .pipe(webpack(testConfig))
    .pipe(gulp.dest('test/runner'))
    .on("error", function(err){
      throw err
    })
})


// gulp v  -0.0.1
gulp.task('v', function(fn){
  var version = process.argv[3].replace('-',"");
  pkg.version = version
  pkg_bower.version = version
  try{
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2), 'utf8');           
    fs.writeFileSync('./bower.json', JSON.stringify(pkg_bower, null, 2), 'utf8');
  }catch(e){
    console.error('update version faild' + e.message)
  }
})



gulp.task('watch', ["build", 'testbundle'], function(){
  // gulp.watch(['src/**/*.js'], ['build']);
  gulp.watch(['test/spec/*.js', 'src/**/*.js'], ['jshint','testbundle'])
})



// 
gulp.task('jshint', function(){
      // jshint
  gulp.src(['src/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))

})

gulp.task('cover', function(cb){
  
  gulp.src(['src/**/*.js'])
    .pipe(istanbul()) // Covering files
    .on('end', function () {
      gulp.src(['test/spec/test-*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports('./test/coverage')) // Creating the reports after tests runned
        .on('end', cb);
    });
})

gulp.task('test', ['jshint', 'karma'])

// for travis
gulp.task('travis', function(cb){
  runSequence( 'jshint' , 'testbundle', 'karma', cb );
})


gulp.task('casper', function(){
  var casperjs = spawn('casperjs', ['test','--concise', 'spec'], {
     cwd: path.resolve('test/fixtures')
  })

  casperjs.stdout.on('data', function (data) {
    console.log(""+ data);
  });
  casperjs.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  casperjs.on('close', function (code) {
    console.log('casperjs test compelete!');
  });

})



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

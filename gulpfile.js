// Build automation
// Require sudo npm install -g gulp
// For dev, initiate watch by executing either `gulp` or `gulp watch`

var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    shell = require('gulp-shell'),
    rename = require('gulp-rename');
    _ = require('underscore');
    listFiles = require('file-lister');
var babelify = require('babelify');

var path = {
  originalJs: ['./js/framework','./js/plugins'],
  dependencies: ['./js/plugin-dependencies'],
  scripts: ['./js/plugins/**/*.*']
};

// Build All
gulp.task('build', ['browserify', 'publishDependencies']);

gulp.task('publishDependencies', function() {
  var publish = function(srcArray)
  {
    _.each(srcArray, function(sourceFile)
    {
      gulp.src(sourceFile).pipe(gulp.dest('./build/'));
    });
  };
  listFiles(path.dependencies, function(error, files) {
    if (error) {
      console.log(error);
    } else {
      var filteredList = files.filter(_.bind(checkFileExtension,this,".js"));
      publish(filteredList);
    }
  });
});

gulp.task('browserify', function() {

  var bundleThis = function(srcArray)
  {
    _.each(srcArray, function(sourceFile)
    {
      var b = browserify({
        entries: sourceFile,
        debug: false,
        transform: [babelify]
      });

      b.bundle()
        .pipe(source(getFileNameFromPath(sourceFile)))
        .pipe(buffer())
        .pipe(gulp.dest('./build/'))
        .pipe(uglify())
        .pipe(rename({
          extname: '.min.js'
        }))
        .pipe(gulp.dest('./build/'))
    });
  };

  listFiles(path.originalJs, function(error, files) {
    if (error) {
        console.log(error);
    } else {
      var filteredList = files.filter(_.bind(checkFileExtension,this,".js"));
      bundleThis(filteredList);
    }
  });

});

var checkFileExtension = function(extension, fileName)
{
    if (!fileName || fileName.length < extension.length)
    {
      return false;
    }

    return (fileName.lastIndexOf(extension) == fileName.length - extension.length);
}

var getFileNameFromPath = function(path)
{
  var start = path.lastIndexOf('/') + 1;
  return path.substring(start);
}

// Run tests
gulp.task('test', shell.task(['npm test']));

// Initiate a watch
gulp.task('watch', function()
{
  gulp.watch(path.scripts, ['browserify']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);

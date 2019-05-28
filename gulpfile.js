/* eslint-disable require-jsdoc */
// Build automation
// Require sudo npm install -g gulp
// For dev, initiate watch by executing either `gulp` or `gulp watch`

const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const shell = require('gulp-shell');
const rename = require('gulp-rename');
_ = require('underscore');
listFiles = require('file-lister');
const babelify = require('babelify');

const path = {
  originalJs: ['./js/framework', './js/plugins'],
  dependencies: ['./js/plugin-dependencies'],
  scripts: ['./js/plugins/**/*.*'],
};

const checkFileExtension = function (extension, fileName) {
  if (!fileName || fileName.length < extension.length) {
    return false;
  }

  return (fileName.lastIndexOf(extension) === fileName.length - extension.length);
};

const getFileNameFromPath = function (pathStr) {
  const start = pathStr.lastIndexOf('/') + 1;
  return pathStr.substring(start);
};

// Build All
gulp.task('build', ['browserify', 'publishDependencies']);

gulp.task('publishDependencies', () => {
  const publish = function (srcArray) {
    _.each(srcArray, (sourceFile) => {
      gulp.src(sourceFile).pipe(gulp.dest('./build/'));
    });
  };
  listFiles(path.dependencies, function (error, files) {
    if (error) {
      console.log(error);
    } else {
      const filteredList = files.filter(_.bind(checkFileExtension, this, '.js'));
      publish(filteredList);
    }
  });
});

gulp.task('browserify', () => {
  const bundleThis = function (srcArray) {
    _.each(srcArray, (sourceFile) => {
      const b = browserify({
        entries: sourceFile,
        debug: false,
        transform: [babelify],
      });

      b.bundle()
        .pipe(source(getFileNameFromPath(sourceFile)))
        .pipe(buffer())
        .pipe(gulp.dest('./build/'))
        .pipe(uglify())
        .pipe(rename({
          extname: '.min.js',
        }))
        .pipe(gulp.dest('./build/'));
    });
  };

  listFiles(path.originalJs, function (error, files) {
    if (error) {
      console.log(error);
    } else {
      const filteredList = files.filter(_.bind(checkFileExtension, this, '.js'));
      bundleThis(filteredList);
    }
  });
});

// Run tests
gulp.task('test', shell.task(['npm test']));

// Initiate a watch
gulp.task('watch', () => {
  gulp.watch(path.scripts, ['browserify']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);

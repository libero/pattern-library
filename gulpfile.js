'use strict';

const del = require('del');
const gulp = require('gulp');
const minimist = require('minimist');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');

const options = minimist(
  process.argv, {
    default: {
      environment: 'production',
    },
  }
);

const environment = options.environment;

gulp.task('echo', [], () => {
  console.log("Echo back options");
  console.log(options);
});

gulp.task('css:generate', ['css:clean'], () => {
  const options = environment === 'production' ? {outputStyle: 'compressed'} : null;
  return gulp.src('source/css/sass/build.scss')
             .pipe(sourcemaps.init())
             .pipe(sassGlob())
             .pipe(sass(options).on('error', sass.logError))
             .pipe(rename('all.css'))
             .pipe(sourcemaps.write('./'))
             .pipe(gulp.dest('source/css'));
});

gulp.task('css:clean', () => {
  del(['./source/css/*.css', './source/css/*.map', '!./source/css/pattern-scaffolding.css']);
});


gulp.task('default', () => {});

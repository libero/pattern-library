'use strict';

const del = require('del');
const gulp = require('gulp');
const minimist = require('minimist');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');

const invocationOptions = minimist(
  process.argv, {
    default: {
      environment: 'production',
      sassEntryPoint: 'build.scss',
      sassOutFilename: 'all.css',
    },
  }
);

const environment = invocationOptions.environment;

gulp.task('echo', [], () => {
  console.log("Echo back options");
  console.log(invocationOptions);
});

gulp.task('css:generate', ['css:clean'], () => {
  const sassOptions = environment === 'production' ? {outputStyle: 'compressed'} : null;
  return gulp.src(`source/css/sass/${invocationOptions.sassEntryPoint}`)
             .pipe(sourcemaps.init())
             .pipe(sassGlob())
             .pipe(sass(sassOptions).on('error', sass.logError))
             .pipe(rename(invocationOptions.sassOutFilename))
             .pipe(sourcemaps.write('./'))
             .pipe(gulp.dest('source/css'));
});

gulp.task('css:clean', () => {
  del(['./source/css/*.css', './source/css/*.map', '!./source/css/pattern-scaffolding.css']);
});

gulp.task('default', () => {});

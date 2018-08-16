'use strict';

const gulp = require('gulp');
const minimist = require('minimist');
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

gulp.task('default', () => {});

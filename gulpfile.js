'use strict';

const del = require('del');
const gulp = require('gulp');
const minimist = require('minimist');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const reporter = require('postcss-reporter');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const stylelint = require('stylelint');
const syntaxScss = require('postcss-scss');

const invocationOptions = minimist(
  process.argv, {
    default: {
      environment: 'production',
      sassEntryPoint: 'build.scss',
      sassOutFilename: 'all.css',
      'sass-lint': true
    },
  }
);

const environment = invocationOptions.environment;
const sassLint = invocationOptions['sass-lint'] !== 'false';

const config = (function (sourceRoot, exportRoot) {
  const config = {};
  config.sourceRoot = sourceRoot;
  config.exportRoot = exportRoot;

  config.dir = {
    src: {},
    out: {}
  };
  config.dir.src.css = `${config.sourceRoot}css/`;
  config.dir.src.sass = `${config.dir.src.css}sass/`;

  config.dir.out.css = `${config.sourceRoot}css/`;

  config.files = {
    src: {},
    out: {}
  };
  config.files.src.css = `${config.dir.src.css}/**/*.css`;
  config.files.src.map = `${config.dir.src.css}/**/*.map`;
  config.files.src.sass = `${config.dir.src.sass}/**/*.scss`;

  return config;

}('source/', 'patternsExport/'));


gulp.task('echo', [], () => {
  console.log("Echo back options");
  console.log(invocationOptions);
});

gulp.task('css:generate', ['sass:lint'], () => {
  const sassOptions = environment === 'production' ? {outputStyle: 'compressed'} : null;
  return gulp.src(`${config.dir.src.sass}${invocationOptions.sassEntryPoint}`)
             .pipe(sourcemaps.init())
             .pipe(sassGlob())
             .pipe(sass(sassOptions).on('error', sass.logError))
             .pipe(rename(invocationOptions.sassOutFilename))
             .pipe(sourcemaps.write('./'))
             .pipe(gulp.dest(config.dir.out.css));
});

gulp.task('sass:lint', ['css:clean'], () => {
  if (!sassLint) {
    console.info("Skipping sass:lint");
    return;
  }

  const processors = [
    stylelint(),
    reporter(
      {
        clearMessages: true,
        throwError: true
      }
    )
  ];

  return gulp.src([config.files.src.sass])
             .pipe(postcss(processors, {syntax: syntaxScss}));
});

gulp.task('css:clean', () => {
  del([config.files.src.css, config.files.src.map, `!${config.dir.src.css}pattern-scaffolding.css`]);
});

gulp.task('default', () => {});

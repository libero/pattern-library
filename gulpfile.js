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

function buildConfig(invocationArgs, sourceRoot, exportRoot) {

  const invocationOptions = minimist(
    invocationArgs, {
      default: {
        environment: 'production',
        sassEntryPoint: 'build.scss',
        cssOutFilename: 'all.css',
        'sass-lint': true
      },
    }
  );

  const config = {};
  config.environment = invocationOptions.environment;
  config.sassLint = invocationOptions['sass-lint'] !== 'false';
  config.sourceRoot = sourceRoot;
  config.exportRoot = exportRoot;

  config.dir = {
    src: {},
    out: {}
  };
  config.dir.src.css = `${config.sourceRoot}css/`;
  config.dir.src.sass = `${config.dir.src.css}sass/`;
  config.dir.src.images = `${config.sourceRoot}images/`;
  config.dir.src.fonts = `${config.sourceRoot}fonts/`;

  config.dir.out.css = `${config.exportRoot}css/`;
  config.dir.out.images = `${config.exportRoot}images/`;
  config.dir.out.fonts = `${config.exportRoot}fonts/`;

  config.files = {
    src: {},
    out: {}
  };
  config.files.src.css = [
    `${config.dir.src.css}/**/*.css`,
    `${config.dir.src.css}/**/*.map`,
    `!${config.dir.src.css}pattern-scaffolding.css`
  ];
  config.files.src.sass = `${config.dir.src.sass}/**/*.scss`;
  config.files.src.sasEntryPoint = config.dir.src.sass + invocationOptions.sassEntryPoint;
  config.files.src.images = [`${config.dir.src.images}/*`, `${config.dir.src.images}/**/*`];
  config.files.src.fonts = [`${config.dir.src.fonts}/*`, `${config.dir.src.fonts}/**/*`];

  config.files.out.cssFilename = invocationOptions.cssOutFilename;

  return config;

}

const config = buildConfig(process.argv, 'source/', 'patternsExport/');

gulp.task('css:generate', ['sass:lint'], () => {
  const sassOptions = config.environment === 'production' ? {outputStyle: 'compressed'} : null;
  return gulp.src(config.files.src.sasEntryPoint)
             .pipe(sourcemaps.init())
             .pipe(sassGlob())
             .pipe(sass(sassOptions).on('error', sass.logError))
             .pipe(rename(config.files.out.cssFilename))
             .pipe(sourcemaps.write('./'))
             .pipe(gulp.dest(config.dir.src.css));
});

gulp.task('sass:lint', ['css:clean'], () => {
  if (!config.sassLint) {
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
  del(config.files.src.css);
});

gulp.task('build', ['css:generate', 'patternsExport:clean'], () => {
});

gulp.task('patternsExport:clean', (cb) => {
  del([`${config.exportRoot}**/*`]);
  cb();
});

gulp.task('exportPatterns', ['build'], () => {

  gulp.src(config.files.src.css)
      .pipe(gulp.dest(config.dir.out.css));

  gulp.src(config.files.src.images)
      .pipe(gulp.dest(config.dir.out.images));

  gulp.src(config.files.src.fonts)
      .pipe(gulp.dest(config.dir.out.fonts));

});

gulp.task('default', ['exportPatterns']);

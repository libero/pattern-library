import browserSync from 'browser-sync';
import color from 'ansi-colors';
import del from 'del';
import distributeConfig from './libero-config/bin/distributeConfig';
import eslint from 'gulp-eslint';
import flatten from 'gulp-flatten';
import gulp from 'gulp';
import log from 'fancy-log';
import jest from 'gulp-jest';
import minimist from 'minimist';
import mocha from 'gulp-mocha';
import path from 'path';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import reporter from 'postcss-reporter';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import sourcemaps from 'gulp-sourcemaps';
import stylelint from 'stylelint';
import syntaxScss from 'postcss-scss';
import webpack from 'webpack';
import webpackConfigFactory from './webpack.config.babel.js';

const buildConfig = (invocationArgs, publicRoot, sourceRoot, testRoot, exportRoot) => {

  const invocationOptions = minimist(
    invocationArgs, {
      default: {
        environment: 'production',
        jsEntryPoint: 'main.js',
        sassEntryPoint: 'base.scss',
        cssOutFilename: 'all.css',
        'sass-lint': true,
      },
    },
  );

  //
  // ** DONE **
  //
  // SASS needs the locations:
  // - where it's authored (src)
  // - where it's exported to (export)
  //
  // CSS needs the locations:
  // - where it's compiled to (compiled)
  // - where it's copied to to drive pattern lab (public)
  // - where it's exported to (export)
  //
  // ** TODO **
  //
  // JS needs the locations:
  // - where it's authored (src)
  // - where it's compiled to (compiled)
  // - where it's copied to to drive pattern lab (public)
  // - where it's exported to (export)

  const config = {};
  config.environment = invocationOptions.environment;
  config.publicRoot = publicRoot;
  config.sourceRoot = sourceRoot;
  config.testRoot = testRoot;
  config.exportRoot = exportRoot;

  config.sass = {};
  config.sass.linting = invocationOptions['sass-lint'] !== 'false';
  config.sass.options = config.environment === 'production' ? {outputStyle: 'compressed'} : null;

  config.dir = {
    export: {},
    out: {},
    public: {},
    src: {},
    test: {},
  };
  config.dir.src.sass = `${config.sourceRoot}/sass`;
  config.dir.src.images = `${config.sourceRoot}/images`;
  config.dir.src.fonts = `${config.sourceRoot}/fonts`;
  config.dir.src.templates = `${config.sourceRoot}/_patterns`;
  config.dir.src.js = `${config.sourceRoot}/js`;
  config.dir.src.jsMap = `${config.sourceRoot}/js`;

  config.dir.test.sass = `${config.testRoot}/sass`;
  config.dir.test.js = `${config.testRoot}/js`;

  config.dir.out.compiledAssets = 'compiled-assets';
  config.dir.out.compiledCss = `${config.dir.out.compiledAssets}/css`;

  config.dir.public.css = `${config.publicRoot}/css`;

  config.dir.export.css = `${config.exportRoot}/css`;
  config.dir.export.sass = `${config.dir.export.css}/sass`;
  config.dir.export.sassVendor = `${config.dir.export.css}/sass/vendor`;
  config.dir.out.js = `${config.exportRoot}/js`;
  config.dir.out.images = `${config.exportRoot}/images`;
  config.dir.out.fonts = `${config.exportRoot}/fonts`;
  config.dir.out.templates = `${config.exportRoot}/templates`;

  config.files = {
    out: {},
    src: {},
    test: {},
  };
  config.files.out.css = [
    `${config.dir.out.compiledCss}/**/*.css`,
    `${config.dir.out.compiledCss}/**/*.map`,
  ];
  config.files.src.sass = [
    `${config.dir.src.sass}/**/*.scss`,
    `!${config.dir.src.sass}/vendor/**/*`,
  ];
  config.files.src.sassEntryPoint = `${config.dir.src.sass}/${invocationOptions.sassEntryPoint}`;
  config.files.src.sassVendor = [
    `${config.dir.src.sass}/vendor/**/*.scss`,
    `${config.dir.src.sass}/vendor/**/*.css`,
    `${config.dir.src.sass}/vendor/**/LICENSE.*`,
  ];
  config.files.src.js = `${config.dir.src.js}/**/*.js`;
  config.files.src.jsEntryPoint = `${config.dir.src.js}/app/${invocationOptions.jsEntryPoint}`;
  config.files.src.jsCompiled = `${config.dir.src.js}/dist/**/*.js`;
  config.files.src.jsAuthored = [config.files.src.js, `!${config.files.src.jsCompiled}`];
  config.files.src.jsMap = `${config.dir.src.jsMap}/**/*.js.map`;
  config.files.src.images = [`${config.dir.src.images}/*`, `${config.dir.src.images}/**/*`];
  config.files.src.fonts = [`${config.dir.src.fonts}/*`, `${config.dir.src.fonts}/**/*`];
  config.files.src.templates = [
    `${config.dir.src.templates}/*.twig`,
    `${config.dir.src.templates}/**/*.twig`,
    `!${config.dir.src.templates}/04-pages/**/*.twig`,
  ];
  config.files.src.derivedConfigs = [
    `${config.dir.src.sass}/variables/**/*`,
    `${config.dir.src.js}/derivedConfig.json`,
  ];

  config.files.test.js = `${config.dir.test.js}/**/*.spec.js`;

  config.files.test.sass = `${config.dir.test.sass}/**/*.spec.scss`;
  config.files.test.sassTestsEntryPoint = `${config.dir.test.sass}/test_sass.js`;

  config.files.out.cssFilename = invocationOptions.cssOutFilename;

  config.webpack = webpackConfigFactory(config.environment, path.resolve(config.files.src.jsEntryPoint), path.resolve(`${config.dir.src.js}/dist`));

  return config;

};

const config = buildConfig(process.argv, 'public', 'source', 'test', 'export');

// Builders

const cleanSharedConfig = () => del(config.files.src.derivedConfigs);

const distributeSharedConfig = gulp.series(cleanSharedConfig, distributeConfig);


// SASS / CSS tasks

const lintSass = () => {
  if (!config.sass.linting) {
    console.info('Skipping sass:lint');
    return Promise.resolve();
  }

  const processors = [
    stylelint(),
    reporter(
      {
        clearMessages: true,
        throwError: true,
      },
    ),
  ];

  return gulp.src(config.files.src.sass)
    .pipe(postcss(processors, {syntax: syntaxScss}));
};

const testSass = () => {
  return gulp.src(config.files.test.sassTestsEntryPoint)
      .pipe(mocha({reporter: 'spec'}));
};

const validateSass = gulp.parallel(lintSass, testSass);

const cleanCss = () => del(config.files.out.css.concat([config.dir.export.css]));

const compileCss = () => {
  return gulp.src(config.files.src.sassEntryPoint)
      .pipe(sourcemaps.init())
      .pipe(sassGlob())
      .pipe(sass(config.sass.options).on('error', sass.logError))
      .pipe(replace(/\.\.\/\.\.\/fonts\//g, '../fonts/'))
      .pipe(rename(config.files.out.cssFilename))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(config.dir.out.compiledCss))
      .pipe(gulp.dest(config.dir.public.css));
};

const generateCss = gulp.series(cleanCss, compileCss);

const buildCss = gulp.series(validateSass, generateCss);

// JavaScript tasks

const lintJs = () => {
  return gulp.src([config.files.src.js, `!${config.dir.src.js}/dist/**/*.js`])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
};

const testJs = () => {
  return gulp.src(config.dir.test.js)
             // TODO: remove passWithNoTests once js work has started
             .pipe(jest({ 'passWithNoTests': true}));
};

const validateJs = gulp.parallel(lintJs, testJs);

const cleanJs = () => del([config.files.src.jsCompiled, config.files.src.jsMap]);

const transpileAndBundleJs = (done) => {
  // Adapted from https://stackoverflow.com/questions/33558396/gulp-webpack-or-just-webpack

  function logBuild(done) {
    return (err, stats) => {
      if (err) {
        log('Error', err);
        done();
      } else {
        Object.getOwnPropertyNames(stats.compilation.assets).forEach((asset) => {
          log('Webpack: output', color.green(asset));
        });
      }
      log('Webpack:', color.blue('finished'));
      done();
    }
  }

  webpack(config.webpack).run(logBuild(done));
};

const generateJs = gulp.series(cleanJs, transpileAndBundleJs);

const buildJs = gulp.series(validateJs, generateJs);

// Combined tasks

const build = gulp.parallel(buildCss, buildJs);

const assemble = gulp.series(distributeSharedConfig, build);

// Exporters

const cleanExport = () => del(`${config.exportRoot}**/*`);

const exportCss = () =>
  gulp.src(config.files.out.css)
    .pipe(gulp.dest(config.dir.export.css));

const exportSass = () =>
  gulp.src(config.files.src.sass)
    .pipe(gulp.dest(config.dir.export.sass));

const exportSassVendor = () =>
  gulp.src(config.files.src.sassVendor)
    .pipe(gulp.dest(config.dir.export.sassVendor));

const exportImages = () =>
  gulp.src(config.files.src.images)
    .pipe(gulp.dest(config.dir.out.images));

const exportFonts = () =>
  gulp.src(config.files.src.fonts)
    .pipe(gulp.dest(config.dir.out.fonts));

const exportJs = () =>
  gulp.src([config.files.src.js, config.files.src.jsMap])
    .pipe(gulp.dest(config.dir.out.js));

const exportTemplates = () =>
  gulp.src(config.files.src.templates)
    // Rename files to standard Twig usage
    .pipe(rename(path => {
      path.basename = path.basename.replace(/^_/, '');
      path.extname = '.html.twig';
    }))
    // Replace pattern-lab partial inclusion with generic Twig syntax
    .pipe(replace(/(['"])(?:atoms|molecules|organisms|templates)-(.+?)(\1)(?=[\s\S]*?(}}|%}))/g, '$1@LiberoPatterns/$2.html.twig$3'))
    // Template files don't need their authoring hierarchy for downstream use
    .pipe(flatten({includeParents: false}))
    .pipe(gulp.dest(config.dir.out.templates));

const exportPatterns = gulp.series(
  cleanExport,
  gulp.parallel(exportCss, exportSass, exportSassVendor, exportImages, exportFonts, exportTemplates, exportJs),
);

const test = gulp.parallel(buildJs, validateSass);

// Watchers

const watchSass = () => gulp.watch(config.files.src.sass.concat([config.files.test.sass]), buildCss);

const watchJs = () => gulp.watch(config.files.src.jsAuthored.concat([config.files.test.js]), buildJs);

const watchSharedConfig = () => gulp.watch('libero-config/**/*', distributeSharedConfig);

const watch = gulp.parallel(watchSass, watchJs, watchSharedConfig);

// Server

const reloadServer = done => {
  browserSync.reload();
  done();
};

const watchServer = () => gulp.watch(config.publicRoot, reloadServer);

const initialiseServer = done => {
  browserSync.init({
    notify: false,
    open: false,
    port: 80,
    server: {
      baseDir: config.publicRoot,
    },
  });
  done();
};

const server = gulp.series(initialiseServer, watchServer);

export default gulp.series(assemble, exportPatterns);

export {
  distributeSharedConfig,
  buildCss,
  buildJs,
  build,
  assemble,
  exportPatterns,
  test,
  watch,
  server,
};

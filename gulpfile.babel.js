import browserSync from 'browser-sync';
import del from 'del';
import distributeConfig from './libero-config/bin/distributeConfig';
import flatten from 'gulp-flatten';
import gulp from 'gulp';
import minimist from 'minimist';
import mocha from 'gulp-mocha';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import reporter from 'postcss-reporter';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import sourcemaps from 'gulp-sourcemaps';
import stylelint from 'stylelint';
import syntaxScss from 'postcss-scss';

const buildConfig = (invocationArgs, publicRoot, sourceRoot, testRoot, exportRoot, buildRoot) => {

  const invocationOptions = minimist(
    invocationArgs, {
      default: {
        environment: 'production',
        sassEntryPoint: 'base.scss',
        cssOutFilename: 'all.css',
        lint: true,
      },
    },
  );

  const config = {};
  config.environment = invocationOptions.environment;
  config.lint = invocationOptions.lint !== 'false';
  config.publicRoot = publicRoot;
  config.sourceRoot = sourceRoot;
  config.testRoot = testRoot;
  config.exportRoot = exportRoot;
  config.buildRoot = buildRoot;

  config.sass = config.environment === 'production' ? {outputStyle: 'compressed'} : null;

  config.dir = {
    src: {},
    test: {},
    build: {},
    export: {},
  };

  config.dir.src.sass = `${config.sourceRoot}/sass`;
  config.dir.src.fonts = `${config.sourceRoot}/fonts`;
  config.dir.src.patterns = `${config.sourceRoot}/patterns`;
  config.dir.src.meta = `${config.sourceRoot}/meta`;
  config.dir.src.js = `${config.sourceRoot}/js`;

  config.dir.test.sass = `${config.testRoot}/sass`;

  config.dir.build.css = `${config.buildRoot}/css`;
  config.dir.build.fonts = `${config.buildRoot}/fonts`;
  config.dir.build.meta = `${config.buildRoot}/_meta`;
  config.dir.build.patterns = `${config.buildRoot}/_patterns`;

  config.dir.export.css = `${config.exportRoot}/css`;
  config.dir.export.sass = `${config.dir.export.css}/sass`;
  config.dir.export.sassVendor = `${config.dir.export.css}/sass/vendor`;
  config.dir.export.images = `${config.exportRoot}/images`;
  config.dir.export.fonts = `${config.exportRoot}/fonts`;
  config.dir.export.templates = `${config.exportRoot}/templates`;

  config.files = {
    src: {},
    test: {},
    build: {},
  };

  config.files.src.sass = [
    `${config.dir.src.sass}/**/*.scss`,
    `!${config.dir.src.sass}/vendor/**/*`,
  ];
  config.files.src.sassEntryPoint = `${config.dir.src.sass}/${invocationOptions.sassEntryPoint}`;
  config.files.src.sassVendor = [
    `${config.dir.src.sass}/vendor/**/*.scss`,
    `${config.dir.src.sass}/vendor/**/_*.scss`,
    `${config.dir.src.sass}/vendor/**/*.css`,
    `${config.dir.src.sass}/vendor/**/LICENSE.*`,
    `${config.dir.src.sass}/vendor/**/license.*`,
    `!${config.dir.src.sass}/vendor/modularscale-sass/libsass/**/*`,
    `!${config.dir.src.sass}/vendor/modularscale-sass/test-compass/**/*`,
  ];
  config.files.src.images = [`${config.dir.src.images}/*`, `${config.dir.src.images}/**/*`];
  config.files.src.fonts = [`${config.dir.src.fonts}/*`, `${config.dir.src.fonts}/**/*`];
  config.files.src.meta = [`${config.dir.src.meta}/*`, `${config.dir.src.meta}/**/*`];
  config.files.src.patterns = [`${config.dir.src.patterns}/*`, `${config.dir.src.patterns}/**/*`];
  config.files.src.templates = [
    `${config.dir.src.patterns}/**/*.twig`,
    `!${config.dir.src.patterns}/04-pages/**/*.twig`,
  ];
  config.files.src.derivedConfigs = [
    `${config.dir.src.sass}/variables/**/*`,
    `${config.dir.src.js}/derivedConfig.json`,
  ];

  config.files.test.sass = `${config.dir.test.sass}/**/*.spec.scss`;
  config.files.test.sassTestsEntryPoint = `${config.dir.test.sass}/test_sass.js`;

  config.files.build.cssFilename = invocationOptions.cssOutFilename;

  return config;

};

const config = buildConfig(process.argv, 'public', 'source', 'test', 'export', 'build');

// Shared config tasks

const cleanSharedConfig = () => del(config.files.src.derivedConfigs);

export const distributeSharedConfig = gulp.series(cleanSharedConfig, distributeConfig);

// Sass tasks

const lintSass = () => {
  if (!config.lint) {
    console.info('Skipping lintSass');
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

const testSass = () =>
  gulp.src(config.files.test.sassTestsEntryPoint)
    .pipe(mocha({reporter: 'spec'}));

export const validateSass = gulp.parallel(lintSass, testSass);

const cleanCss = () => del(config.dir.build.css);

const compileCss = () =>
  gulp.src(config.files.src.sassEntryPoint)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass(config.sass).on('error', sass.logError))
    .pipe(rename(config.files.build.cssFilename))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.dir.build.css));

export const generateCss = gulp.series(cleanCss, compileCss);

export const buildCss = gulp.parallel(validateSass, generateCss);

// Patterns tasks

const cleanLinks = () => del([config.dir.build.fonts, config.dir.build.meta, config.dir.build.patterns]);

const linkFonts = () =>
  gulp.src(config.files.src.fonts)
    .pipe(gulp.dest(config.dir.build.fonts));

const linkMeta = () =>
  gulp.src(config.files.src.meta)
    .pipe(gulp.dest(config.dir.build.meta));

const linkPatterns = () =>
  gulp.src(config.files.src.patterns)
    .pipe(gulp.dest(config.dir.build.patterns));

const generateLinks = gulp.parallel(linkFonts, linkMeta, linkPatterns);

export const buildLinks = gulp.series(cleanLinks, generateLinks);

// Combined tasks

export const build = gulp.parallel(buildCss, buildLinks);

export const assemble = gulp.series(distributeSharedConfig, build);

export const test = gulp.parallel(validateSass);

// Exporters

const cleanExport = () => del(`${config.exportRoot}**/*`);

const exportCss = () =>
  gulp.src(`${config.dir.build.css}/**/*`)
    .pipe(gulp.dest(config.dir.export.css));

const exportSass = () =>
  gulp.src(`${config.dir.build.sass}/**/*`)
    .pipe(gulp.dest(config.dir.export.sass));

const exportSassVendor = () =>
  gulp.src(config.files.src.sassVendor)
    .pipe(gulp.dest(config.dir.export.sassVendor));

const exportImages = () =>
  gulp.src(config.files.src.images)
    .pipe(gulp.dest(config.dir.export.images));

const exportFonts = () =>
  gulp.src(config.files.src.fonts)
    .pipe(gulp.dest(config.dir.export.fonts));

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
    .pipe(gulp.dest(config.dir.export.templates));

export const exportPatterns = gulp.series(
  cleanExport,
  gulp.parallel(exportCss, exportSass, exportSassVendor, exportImages, exportFonts, exportTemplates),
);

// Default

export default gulp.series(assemble, exportPatterns);

// Watchers

const watchLinks = () => gulp.watch([config.dir.src.fonts, config.dir.src.meta, config.dir.src.patterns], buildLinks);

const watchSass = () => gulp.watch(config.files.src.sass.concat([config.files.test.sass]), buildCss);

const watchSharedConfig = () => gulp.watch('libero-config/**/*', distributeSharedConfig);

export const watch = gulp.parallel(watchLinks, watchSass, watchSharedConfig);

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

export const server = gulp.series(initialiseServer, watchServer);

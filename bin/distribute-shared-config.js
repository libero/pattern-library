const Color = require('color');
const config = require('../libero-config/config');
const deepIterator = require('deep-iterator').default;
const flatten = require('flat');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const {promisify} = require('util');
const YAML = require('yamljs');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function getConfigData(filePath) {
  const rawFileData = await readFileAsync(filePath, {encoding: 'utf8'});
  return YAML.parse(rawFileData);
}

function getBreakpoints(data) {
  if (!data || !data.breakpoints || !Object.keys(data.breakpoints).length) {
    throw Error('No breakpoint data found');
  }

  return data.breakpoints;
}

function processBreakpointsForSass(breakpointData) {

  const processed = [];

  function formatBreakpoint(category, name, breakpointData) {
    return `$bkpt-${category}--${name}: ${breakpointData[category][name]};`;
  }

  function processCategory(category, breakpointData) {
    Object.keys(breakpointData[category]).forEach((name) => {
      processed.push(formatBreakpoint(category, name, breakpointData));
    });
  }

  Object.keys(breakpointData).forEach((category) => {
    processCategory(category, breakpointData);
  });

  return `${processed.join('\n')}\n`;
}

function processBreakpointsForJs(breakpointData) {
  return `${JSON.stringify(breakpointData)}\n`;
}

// Normalise the reported path to be from the project root
function reportFileWrite(path) {
  const reportedPath = path.replace(/(\.\.\/)*([^./])/, '\/$2');
  console.log(`Written config to ${reportedPath}`);
}

function writeFile(data, outPath) {
  return writeFileAsync(path.join(__dirname, outPath), data)
    .then(() => { reportFileWrite(outPath) })
    .catch(err => { throw err });
}

function getConfigPath(invocationArgs) {
  const sharedConfigLocalPath = minimist(
    invocationArgs, {
      default: {
        sharedConfig: './shared-config.yaml'
      }
    }
  )['sharedConfig'];

  return path.join(__dirname, `../${sharedConfigLocalPath}`);
}


const paths = {
  sharedConfig: getConfigPath(process.argv),
  out: {
    js: '../source/js/config--breakpoints.json',
    sass: '../source/css/sass/_variables--breakpoints.scss'
  }
};

function distributeBreakpointsToSass(breakpointData) {
  return writeFile(processBreakpointsForSass(breakpointData), paths.out.sass);
}

function distributeBreakpointsToJs(breakpointData) {
  return writeFile(processBreakpointsForJs(breakpointData), paths.out.js);
}

function distributeBreakpoints(breakpointData) {

  return Promise.all(
    [
      distributeBreakpointsToSass(breakpointData),
      distributeBreakpointsToJs(breakpointData),
    ]
  );

}

function processForSass(data) {

  data.forEach((item) => {
    for (let {parent, key, value} of deepIterator(item)) {
      if (value instanceof Color) {
        parent[key] = value.rgb().string();
      }
    }

  });

  let flattened = {};
  data.forEach((item) => {
    Object.assign(flattened, flatten(item, {delimiter: '-'}));
  });

  return Object.entries(flattened)
               .reduce((carry, pair) => {
                 const [key, value] = pair;
                 return `${carry}$${key}: ${value};\n`;
               }, '');
}

async function distributeToSass(data) {
  const processed = processForSass(data);
  return writeFile(processed, paths.out.sass);

}
function distribute() {

  // TODO: Changes to make / account for here:
  //  - config is now loaded as a dependency
  //  - run processForSass and generate appropriate files
  //  - do the same for js
  //  - do the same for twig

  return Promise.all(
    [
      distributeToSass(config.allocator.getAllocatedToSass()),
      // processForJs(config.allocator.getAllocatedToJs()),
      // processForTwig(config.allocator.getAllocatedToTwig())
    ]
  ).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  distribute,
  getBreakpoints,
  getConfigData,
  getConfigPath,
  processBreakpointsForJs,
  processBreakpointsForSass
};

distribute();

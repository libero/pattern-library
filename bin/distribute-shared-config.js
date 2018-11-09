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
    sassVariablesFileNameRoot: '../source/css/sass/_variables--',
  }
};

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

  for (let {parent, key, value} of deepIterator(data)) {
    if (value instanceof Color) {
      parent[key] = value.rgb().string();
    }
  }

  return Object.entries(flatten(data, {delimiter: '-'}))
               .reduce((carry, pair) => {
                 const [key, value] = pair;
                 return `${carry}$${key}: ${value};\n`;
               }, '');
}

function distributeToSass(data) {
  console.log('Distributing config to sass...');
  let fileWritePromises = [];
  // The top level property of each object in data defines a separate file
  data.forEach((item) => {
    const processedItemData = processForSass(item);
    const outFileName = `${paths.out.sassVariablesFileNameRoot}${Object.keys(item)[0]}.scss`;
    fileWritePromises.push(
      new Promise((resolve) => {
        resolve(writeFile(processedItemData, outFileName));
      })
    );
  });

  return Promise.all(fileWritePromises).catch(err => { throw err; } );

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
};

distribute();

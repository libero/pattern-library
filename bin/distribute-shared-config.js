const Color = require('color');
const config = require('../libero-config/config');
const deepIterator = require('deep-iterator').default;
const flatten = require('flat');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const {promisify} = require('util');

const writeFileAsync = promisify(fs.writeFile);

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

const paths = {
  out: {
    sassVariablesFileNameRoot: '../source/css/sass/_variables--',
    jsonFileName: '../source/js/configForJs.json'
  }
};

function processForSass(data) {
  const deepData = deepIterator(data);
  for (let {parent, key, value} of deepData) {
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

function distributeToSass(allocations, data) {
  let fileWritePromises = [];
  // Each allocation is written to a separate file
  allocations.forEach((allocation) => {
    let normalisedData = {};
    normalisedData[allocation] = data[allocation];
    const processedItemData = processForSass(normalisedData);
    const outFileName = `${paths.out.sassVariablesFileNameRoot}${allocation}.scss`;
    fileWritePromises.push(
      new Promise((resolve) => {
        resolve(writeFile(processedItemData, outFileName));
      })
    );
  });

  return Promise.all(fileWritePromises).catch(err => { throw err; } );

}

function processForJs(allocations, data) {
  const processed = {};
  allocations.forEach((allocation) => {
    processed[allocation] = data[allocation];
  });
  return JSON.stringify(processed);
}

function distributeToJs(allocations, data) {
  return writeFile(processForJs(allocations, data), paths.out.jsonFileName);
}

function distribute() {
  console.log('Distributing config...');
  return Promise.all(
    [
      distributeToSass(config.layerAllocations.sass, config.data),
      distributeToJs(config.layerAllocations.js, config.data),
    ]
  ).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  distribute,
};

if (require.main === module) {
  distribute();
}

const Color = require('color');
const deepIterator = require('deep-iterator').default;
const flatten = require('flat');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const writeFileAsync = promisify(fs.writeFile);

module.exports = class ConfigDistributor {

  constructor() {
    // Go full meta and extract into config?
    this.paths = {
      out: {
        sassVariablesFileNameRoot: '../../source/css/sass/_variables--',
        jsonFileName: '../../source/js/configForJs.json'
      }
    };
  }

  distribute(configPaths, configGenerator) {

    console.log('Distributing config...');

    return configGenerator.generateConfig(configPaths)

                          .then((config) => {
                            return Promise.all(
                              [
                                this.distributeToSass(config.layerAllocations.sass, config.data),
                                this.distributeToJs(config.layerAllocations.js, config.data),
                              ]
                            )
                          })

                          .catch(err => {
                            console.error(err.message);
                            process.exit(1);
                          });
  }

  distributeToJs(allocations, data) {
    return ConfigDistributor.writeFile(
      ConfigDistributor.processForJs(allocations, data),
      this.paths.out.jsonFileName
    );
  }

  distributeToSass(allocations, data) {

    const fileWritePromises = [];

    // Each allocation is written to a separate file
    allocations.forEach((allocation) => {
      const dataForAllocation = {};
      dataForAllocation[allocation] = data[allocation];
      const processedItemData = ConfigDistributor.processForSass(dataForAllocation);
      const outFileName =
        `${this.paths.out.sassVariablesFileNameRoot}${allocation}.scss`;
      fileWritePromises.push(
        new Promise((resolve) => {
          resolve(ConfigDistributor.writeFile(processedItemData, outFileName));
        })
      );
    });

    return Promise.all(fileWritePromises).catch(err => { throw err; } );

  }

  static processForJs(allocations, data) {
    const processed = {};
    allocations.forEach((allocation) => {
      processed[allocation] = data[allocation];
    });
    return JSON.stringify(processed);
  }

  static processForSass(data) {
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

  static writeFile(data, outPath) {
    return writeFileAsync(path.join(__dirname, outPath), data)
      .then(() => { ConfigDistributor.reportFileWrite(outPath) })
      .catch(err => { throw err });
  }

  // Normalise the reported path to be from the project root
  static reportFileWrite(path) {
    const reportedPath = path.replace(/(\.\.\/)*([^./])/, '\/$2');
    console.log(`Written config to ${reportedPath}`);
  }

};

const ConfigGenerator = require('./ConfigGenerator');
const ConfigDistributor = require('./ConfigDistributor');

const configPaths = [
  './config--libero',
  './config--custom'
];

// Combine all configs specified in configPaths into one config
const configGenerator = new ConfigGenerator(configPaths);

// Distribute defined parts of the config to specified technology layers
const configDistributor = new ConfigDistributor();
configDistributor.distribute(configPaths, configGenerator)
                 .catch((err) => { throw err; });

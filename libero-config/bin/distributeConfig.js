const ConfigGenerator = require('./ConfigGenerator');
const configDistributor = require('./configDistributor');

const configPaths = [
  './config--libero',
  './config--custom'
];

// Combine all configs specified in configPaths into one config
const configGenerator = new ConfigGenerator(configPaths);

// Distribute defined parts of the config to specified technology layers
configDistributor.distribute(configPaths, configGenerator)
                 .catch((err) => { throw err; });

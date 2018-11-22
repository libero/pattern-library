const ConfigGenerator = require('./ConfigGenerator');
const configDistributor = require('./configDistributor');

const configPaths = [
  './config--libero',
  './config--custom'
];

const configGenerator = new ConfigGenerator(configPaths);

configDistributor.distribute(configPaths, configGenerator)
                 .catch((err) => { throw err; });

const configDistributor = require('./configDistributor');

const configPaths = [
  './config--libero',
  './config--custom'
];

configDistributor.distribute(configPaths).catch((err) => { throw err; });

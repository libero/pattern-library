const coreConfig = require('./config--core');

let customConfig;
try {
  customConfig = require('./config--custom');
} catch(e) {
  customConfig = null;
}

function generateConfig() {
  return customConfig || coreConfig;
}

module.exports = generateConfig();

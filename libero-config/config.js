let config;

try {
  config = require('./config--custom');
  console.info('Using custom config.');
} catch(e) {
  config = require('./config--base');
  console.warn('No valid custom config available, using base config.');
}

function generateConfig() {
  return config;
}

module.exports = generateConfig();

const baseConfigModule = './config--base';
const customConfigModule = './config--custom';

let config;

try {
  config = require(customConfigModule);
  console.info(`Using custom config from ${require.resolve(customConfigModule)}`);
} catch(e) {
  config = require(baseConfigModule);
  console.warn(`No valid custom config available, using base config from ${require.resolve(baseConfigModule)}`);
  console.error(e);
}

function generateConfig() {
  return config;
}

module.exports = generateConfig();

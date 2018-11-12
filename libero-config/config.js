const deepMerge = require('deepmerge');

// Load any number of configs in order
const allConfigs = [
  require('./config--base'),
  require('./config--custom')
];

function getPropertyFromAllConfigs(property, allConfigs) {
  return allConfigs.map((config) => {
    return config[property] || {};
  });
}

function getDataFromAllConfigs(allConfigs) {
  return getPropertyFromAllConfigs('data', allConfigs);
}

function getAllocationsFromAllConfigs(allConfigs) {
  return getPropertyFromAllConfigs('layerAllocations', allConfigs);}

function allocateToLayers() {
  const accumulatedAllocations = deepMerge.all(getAllocationsFromAllConfigs(allConfigs));
  Object.keys(accumulatedAllocations).forEach((key) => {
    accumulatedAllocations[key] = Array.from(new Set(accumulatedAllocations[key]));
  });
  return accumulatedAllocations;
}

function generateConfig() {
  return {
    data: deepMerge.all(getDataFromAllConfigs(allConfigs)),
    layerAllocations: allocateToLayers()
  }
}

console.log('generateConfig() returns', generateConfig());

module.exports = generateConfig();

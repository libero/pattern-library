const Color = require('color');
const deepMerge = require('deepmerge');
// Load any number of configs in order
const allConfigs = [
  require('./config--base'),
  // require('./config--custom')
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

function allocateToLayers(allConfigs) {
  const accumulatedAllocations = deepMerge.all(getAllocationsFromAllConfigs(allConfigs));
  Object.keys(accumulatedAllocations).forEach((key) => {
    accumulatedAllocations[key] = Array.from(new Set(accumulatedAllocations[key]));
  });
  return accumulatedAllocations;
}

function isMergeableObject(value) {

  function isNonNullObject(value) {
    return !!value && typeof value === 'object'
  }

  function isSpecial(value) {
    const stringValue = Object.prototype.toString.call(value);

    return stringValue === '[object RegExp]'
           || stringValue === '[object Date]';
  }

  return isNonNullObject(value) &&
         !isSpecial(value) &&
         !(value instanceof Color);
}

function generateConfig() {
  return {
    data: deepMerge.all(getDataFromAllConfigs(allConfigs), { isMergeableObject }),
    layerAllocations: allocateToLayers(allConfigs)
  }
}

module.exports = generateConfig();

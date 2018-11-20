const deepIterator = require('deep-iterator').default;
const deepMerge = require('deepmerge');
const isMergeableObject = require('./isMergeableObject');
const jexl = require('jexl');

// Load any number of configs in order.
const allConfigs = [
  require('./config--libero'),
  require('./config--custom')
];

function getPropertyFromAllConfigs(property, allConfigs) {
  return allConfigs.map((config) => {
    return config[property] || {};
  });
}

function getDataFromConfigs(allConfigs) {
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

async function processExpression(expression, context) {
  const normalised = expression.replace('!expression', '');
  return await jexl.eval(normalised, context);
}

async function processDeferredConfig(config) {
  const deepData = deepIterator(config);
  for (let {parent, key, value} of deepData) {
    if (typeof value === 'string' && value.indexOf('!expression ') > -1) {
      parent[key] = await processExpression(value, config);
    }
  }

  return config;
}

async function generateConfig(allConfigs) {
  const mergedConfig = deepMerge.all(getDataFromConfigs(allConfigs), { isMergeableObject });
  const data = await processDeferredConfig(mergedConfig);

  return {
    data: data,
    layerAllocations: allocateToLayers(allConfigs)
  };
}

module.exports = {
  generateConfig: function() {
    return generateConfig(allConfigs);
  },
  processDeferredConfig
};

if (require.main === module) {
  generateConfig(allConfigs);
}

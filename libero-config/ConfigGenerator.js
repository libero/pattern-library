const deepIterator = require('deep-iterator').default;
const deepMerge = require('deepmerge');
const isMergeableObject = require('./isMergeableObject');
const jexl = require('jexl');

module.exports = class ConfigGenerator {

  constructor(allConfigPaths) {
    const defaultConfigPaths = [
      './config--libero',
      './config--custom'
    ];
    const configPaths = allConfigPaths || defaultConfigPaths;
    const configs = [];
    configPaths.forEach((configPath) => {
      configs.push(require(configPath));
    });

    this.allConfigs = configs;
  }

  getPropertyFromAllConfigs(property, configs) {
    return configs.map((config) => {
      return config[property] || {};
    });
  }

  getDataFromConfigs(configs) {
    return this.getPropertyFromAllConfigs('data', configs);
  }

  getAllocationsFromAllConfigs(configs) {
    return this.getPropertyFromAllConfigs('layerAllocations', configs);
  }

  getAllConfigs() {
    return this.allConfigs;
  }

  allocateToLayers(configs) {
    const accumulatedAllocations = deepMerge.all(this.getAllocationsFromAllConfigs(configs));
    Object.keys(accumulatedAllocations).forEach((key) => {
      accumulatedAllocations[key] = Array.from(new Set(accumulatedAllocations[key]));
    });
    return accumulatedAllocations;
  }

  mergeConfigs(configs) {
    return deepMerge.all(this.getDataFromConfigs(configs), { isMergeableObject });
  }

  async generateConfig() {
    const mergedConfig = this.mergeConfigs(this.getAllConfigs());
    const data = await ConfigGenerator.processDeferredConfig(mergedConfig);

    return {
      data: data,
      layerAllocations: this.allocateToLayers(this.getAllConfigs())
    };
  }

  static async processExpression(expression, context) {
    const normalised = expression.replace('!expression', '');
    return await jexl.eval(normalised, context);
  }

  static async processDeferredConfig(config) {
    const deepData = deepIterator(config);
    for (let {parent, key, value} of deepData) {
      if (typeof value === 'string' && value.indexOf('!expression ') > -1) {
        parent[key] = await ConfigGenerator.processExpression(value, config);
      }
    }

    return config;
  }

};

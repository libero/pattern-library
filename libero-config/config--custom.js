// Used when colour values are specified
const Color = require('color');

// Each config file will need a config object with a data property
const config = {
  data: {
    color: { primary: {} },
    baselinegrid: { space: {} }
  }
};

// Add your custom config.data properties
config.data.color.primary.normal = Color('#F00CA1');
config.data.customThing = 'custom thing';
config.data.deep = { custom: { thing: ['deep', 'custom', 'thing'] } };
config.data.breakpoints = {
  site: {
    'x_wide': 1400,
    'xx_wide': 1600
  }
};

config.data.baselinegrid.space.extra_large_in_px = '!expression baselinegrid.space.small_in_px * 500';


config.layerAllocations = {
  sass: ['color'],
  template: ['color']
};

// KEEP THIS LINE
module.exports = config;

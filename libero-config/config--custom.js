// Used when colour values are specified
const Color = require('color');

// Override / specify additional config properties on the config.data property
const config = {
  data: {
    color: { primary: {} },
    baselinegrid: { space: {} }
  }
};

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


// Define which top level config.data properties should be distributed to which layer (sass, js & template)
// This augments those allocated from any prior-loaded config
config.layerAllocations = {
  sass: ['color'],
  // js: ['baselinegridgrid'],
  template: ['color']
};

// KEEP THIS LINE
module.exports = config;

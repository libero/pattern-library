const config = require('./config--base');

// Add your custom config.data properties
config.data.deep = { custom: { thing: ['deep', 'custom', 'thing'] } };

// Use the allocator to allocate properties to layers (sass, js and twig)
config.allocator.allocateToTwig(['deep']);

// Any config.data property not allocated to a layer is still available as config, but not included
// in any layer-specific generated artefact

config.data.customThing = 'custom thing';


// KEEP THIS LINE
module.exports = config;

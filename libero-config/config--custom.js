const config = require('./config--core');

// Add your custom config properties to 'config' here.
config.customThing = 'custom thing';
config.deep = { custom: { thing: ['deep', 'custom', 'thing'] } };

// KEEP THIS LINE
module.exports = config;

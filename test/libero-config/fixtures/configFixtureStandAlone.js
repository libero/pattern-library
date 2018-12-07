const Color = require('color');

const config = {data: {}};

config.data.baseline_grid = {space: {}};
config.data.baseline_grid.space.extra_small_in_px = 12;
config.data.baseline_grid.space.small_in_px = '!expression baseline_grid.space.extra_small_in_px * 2';

config.data.breakpoints = {site: {}};
config.data.breakpoints.site.x_small = 320;
config.data.breakpoints.site.small = 480;

config.data.color = {primary: {}, text: {}};
config.data.color.text.normal = Color('#212121');

config.layerAllocations = {
  sass: ['baseline_grid', 'breakpoints', 'color'],
  js: ['color', 'breakpoints'],
  template: ['breakpoints'],
};

module.exports = config;

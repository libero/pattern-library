const Color = require('color');

const config = { data: {} };

config.data.baselinegrid = {space: {}};
config.data.baselinegrid.space.extra_small_in_px = 12;
config.data.baselinegrid.space.small_in_px = config.data.baselinegrid.space.extra_small_in_px * 2;
config.data.baselinegrid.space.smallish_in_px = config.data.baselinegrid.space.small_in_px * 1.5;
config.data.baselinegrid.space.medium_in_px = config.data.baselinegrid.space.small_in_px * 2;
config.data.baselinegrid.space.large_in_px = config.data.baselinegrid.space.small_in_px * 3;
config.data.baselinegrid.space.extra_large_in_px = config.data.baselinegrid.space.small_in_px * 5;

config.data.breakpoints = {site: {}};
config.data.breakpoints.site.x_small = 320;
config.data.breakpoints.site.small = 480;
config.data.breakpoints.site.medium = 730;
config.data.breakpoints.site.wide = 900;
config.data.breakpoints.site.x_wide = 1200;

config.data.color = { primary: {}, text: {} };
config.data.color.primary.normal = Color('#0288D1');
config.data.color.primary.light = config.data.color.primary.normal.lighten(0.1);
config.data.color.primary.dark = Color('#0277bd');
config.data.color.text.normal = Color('#212121');
config.data.color.text.reverse = Color('#fff');
config.data.color.text.secondary = Color('#888');
config.data.color.text.secondary__reverse = Color('#9e9e9e');
config.data.color.text.placeholder = Color('#bdbdbd');
config.data.color.text.dividers = Color('#e0e0e0');
config.data.color.text.dividers__reverse = Color('#616161');
config.data.color.text.ui_background = Color('#fff');
config.data.color.text.ui_background_hue = Color('#f5f5f5');
config.data.color.text.ui_code = Color('#f7f7f7');
config.data.color.text.ui_background__reverse = Color('#212121');
config.data.color.text.ui_background_hue__reverse = Color('#333');
config.data.color.information = Color('#0288d1');
config.data.color.success = Color('#629f43');
config.data.color.success_dark = Color('#569037');
config.data.color.attention = Color('#cf0c4e');
config.data.color.warning = Color('#e65100');

// Specify the top level properties to be distributed to layers (sass, js & templates)
config.layerAllocations = {
  sass: ['baselinegrid', 'breakpoints', 'color'],
  js: ['color', 'breakpoints'],
  template: ['breakpoints']
};

module.exports = config;

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

config.data.color = { primary: {} };
config.data.color.primary.normal = Color('#0288D1');
config.data.color.primary.light = config.data.color.primary.normal.lighten(0.1);

// Specify the top level properties to be distributed to layers (sass, js & templates)
config.layerAllocations = {
  sass: ['baselinegrid', 'breakpoints', 'color'],
  js: ['color', 'breakpoints'],
  template: ['breakpoints']
};

/*libero:
    color:
        primary:
            light: '#b3e5fc'
normal: '#0288d1'
dark: '#0277bd'
text:
    normal: '#212121'
reverse: '#fff'
secondary: '#888'
secondary_reverse: '#9e9e9e'
placeholder: '#bdbdbd'
dividers: '#e0e0e0'
dividers_reverse: '#616161'
background: '#fff'
background_hue: '#f5f5f5'
ui_code: '#f7f7f7'
ui_background__reverse: '#212121'
ui_background_hue__reverse: '#333'
information: '#0288d1'
success: '#629f43'
success_dark: '#569037'
attention: '#cf0c4e'*/

module.exports = config;

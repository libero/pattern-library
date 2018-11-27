
Libero pattern library  
======================  
  
## Developing patterns with the pattern library  
[This section is a work in progress. Likely to be updated to use Docker.]   
To get things up and running for local development using default configuration, run `/bin/dev`.  
  
### Configuration
N.B. When configuration files are changed, the config needs to be regenerated, either by running `node ./libero-config/bin/distributeConfig.js` or the Gulp task `distributeConfig`.  
  
#### Uses of configuration  
Configuration is used for two things:  
  
1. to be the single source of truth for knowledge that needs to be shared across across front end technology boundaries. For example, media query breakpoint values need to exist in the styling layer, but they are also often needed by JavaScript.  
  
1. whilst enabling the single source of truth, configuration must also be able to be changed as required in a manageable way. The breakpoints, colors, baseline grid measures etc may not be the same between implementations, whilst enabling the ability to easily reuse most of the config and only tweak the odd value if a light touch is needed.  
  
#### Anatomy of configuration  
(All config file code examples are taken from `/libero-config/config--libero-default.js`.)  

##### Simple example
`config.data` is where you define your configuration data.
Here `config.data` defines the the `small` and `medium` site breakpoints:  
  
```  
config.data.breakpoint = {site: {}};  
config.data.breakpoint.site.small = 480;  
config.data.breakpoint.site.medium = 730;  
```  
   
`config.layerAllocations` specifies which technology layers the properties of `config.data` are distributed to. Continuing the above example:  
```  
config.layerAllocations = {  
 sass: ['breakpoint'],
 js: ['breakpoint'],
 template: ['breakpoint'] };
 ```  
specifies that the `breakpoint` config must be distributed to all three available layers: the sass, JavaScript and the templating layer.  

##### Advanced example
Sometimes configuration values depend on other configuration values, for example measures in a grid system. To be able to maintain these relationships even when the underlying predicate value may be modified by a later-loading config file, the calculation of the final value determined by these relationships must be deferred until all specified configurations are loaded and parsed. This is achieved by specifying these simple mathematical expressions in the format:
```
'!expression [some simple mathematical expression]'
```
Using this we can specify the baseline grid as:
```
config.data.baselinegrid = {space: {}};  
config.data.baselinegrid.space.extra_small_in_px = 12;  
config.data.baselinegrid.space.small_in_px = '!expression baselinegrid.space.extra_small_in_px * 2';  
config.data.baselinegrid.space.smallish_in_px = '!expression baselinegrid.space.small_in_px * 1.5';  
config.data.baselinegrid.space.medium_in_px = '!expression baselinegrid.space.small_in_px * 2';
...
```
The result is that `config.data.baselinegrid.space.small_in_px` will have the value twice that of whatever the final value of `config.data.baselinegrid.space.extra_small_in_px`is, *even if `config.data.baselinegrid.space.extra_small_in_px` is modified by a later loading config*. This provides a way of reusing the essentials of the baseline grid system, but basing it on a different key value as required.

#### Distributing configuration  
##### Distributing to SASS  
Each property of `config.data` specified in `config.layerAllocations.sass` is eventually written as a SASS file to  `/source/css/sass/derived-from-config/_variables--[propertyname].sass`. Each of these files contains the SASS variables describing the config for that property. Looking at the `breakpoint` example again, this config  
  
```  
// specified in a config file  
config.data.breakpoint = {site: {}};  
config.data.breakpoint.site.small = 480;  
config.data.breakpoint.site.medium = 730;  
  
config.layerAllocations.sass = ['breakpoint'];  
```  
  
generates this file:  
```  
// /source/css/sass/derived-from-config/_variables--breakpoint.sass  
$breakpoint-site-small: 480;  
$breakpoint-site-medium: 730;  
```   
##### Distributing to JavaScript  
Each property of `config.data` specified in `config.layerAllocations.jss` is eventually written to `/source/js/derived-from-config/configForJs.json`.  Looking at the `breakpoint` example again, this config:    
  
```js  
// specified in a config file  
config.data.breakpoint = {site: {}};  
config.data.breakpoint.site.small = 480;
config.data.breakpoint.site.medium = 730;  
config.layerAllocations.js = ['breakpoint'];
```  
  
adds this into `configForJs.json`:  
```  
// /source/js/derived-from-config/configForJs.json  
...  
{"breakpoint":{"site":{"small":480,"medium":730}}}  
...  
```  
  ##### Distributing to templates
  [Not yet implemented]
  
#### Modifying configuration
##### Default configuration  
Default configuration is supplied by `/libero-config/config--libero-default.js`. If this is sufficient, the rest of this section may be safely ignored.  
  
##### Changing configuration  
Do not change the contents of the default config file `/libero-config/config--libero-default.js` directly.  
  
Any changes to the configuration should be effected by placing one or more custom configuration files into `/libero-config/`, and registering the file name(s) in `/libero-config/configsRegister.json`. Any files listed here are loaded as config files. The order of the files listed  defines their load order. This is important when namespace clashes occur: when this happens the clashing name that was loaded last wins. This is how specific configuration properties are overridden.  
  
##### Swapping out configuration wholesale  
Supply your own config file(s), add appropriate references to `/libero-config/configRegister.js`, and remove mention of `configs--libero.js` from `/libero-config/configRegister.js`.   
  
##### Keep default configuration but augment or override some of its properties  
Supply your own config file(s), add appropriate references to `/libero-config/configRegister.js`.

## Pipeline  
  
The build process uses a Node.js container image to build all assets, and copy them out of the container into `export/`.  
  
`export/` can then be packaged to be released on Github, or reused elsewhere.

Libero pattern library  
======================  

## Developing with the pattern library
Developer quick start: running `docker-compose down --volumes && docker-compose up --build` will set up the pattern environment, run gulp and start the pattern library web server. The UI is available at http://localhost:8889/.  

### Configuration
 
#### Uses of configuration  
Configuration is used to be the single source of truth for knowledge that needs to be shared across across front end technology boundaries. For example, media query breakpoint values need to exist in the styling layer, but they are also often needed by JavaScript. Note that for flexibility all configuration could be maintained using this system in order to make it easier to later distribute configuration if it suddenly becomes necessary.  
  
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
Each property of `config.data` specified in `config.layerAllocations.sass` is eventually written as a SASS file to  `/source/css/sass/variables/[propertyname].sass`. Each of these files contains the SASS variables describing the config for that property. Looking at the `breakpoint` example again, this config  
  
```  
// specified in a config file  
config.data.breakpoint = {site: {}};  
config.data.breakpoint.site.small = 480;  
config.data.breakpoint.site.medium = 730;  
  
config.layerAllocations.sass = ['breakpoint'];  
```  
  
generates this file:  
```  
// /source/css/sass/variables/breakpoint.sass  
$breakpoint-site-small: 480;  
$breakpoint-site-medium: 730;  
```   
##### Distributing to JavaScript  
Each property of `config.data` specified in `config.layerAllocations.jss` is eventually written to `/source/js/derivedConfig.json`.  Looking at the `breakpoint` example again, this config:    
  
```js  
// specified in a config file  
config.data.breakpoint = {site: {}};  
config.data.breakpoint.site.small = 480;
config.data.breakpoint.site.medium = 730;  
config.layerAllocations.js = ['breakpoint'];
```  
  
adds this into `configForJs.json`:  
```  
// /source/js/derivedConfig.json  
...  
{"breakpoint":{"site":{"small":480,"medium":730}}}  
...  
```  
  ##### Distributing to templates
  [Not yet implemented]
  
## Pipeline  
  
The build process uses a Node.js container image to build all assets, and copy them out of the container into `export/`.  
  
`export/` can then be packaged to be released on Github, or reused elsewhere.

## Using the grid
The grid is implemented using CSS grid. Non-supporting browsers will display a single column constrained to the specified max width.

The grid comprises a full-viewport-width CSS grid within which is a central section of 12 columns. The central 12 columns are collectively known as the `main` part of the grid, which holds the content of the page. The full width of the grid from viewport edge to viewport edge is known as the `full` width grid. The `full` width grid exists in order to allow items of content to give the impression of breaking out of the (`main` part of the) grid. It should also make it easier to implement subgrids when they get browser support.  

[image]

In order to preserve these capabilities of seeming to break out of the grid, and of supporting sub grids, every level of a page layout grid applied must span the `full` width of the grid using the CSS class `grid-item-span-full`, or the mixin it employs: `grid-span-full`.

### `page-grid`
The page grid is the the top level page grid. It in turn includes a lower-level grid into which the page text actually loads (by default this lower-level grid is `single-column-grid`). It also has the facility to apply a `full` width keyline above and / or below a grid item using the classes `page-grid-item--has-keyline-start` and `page-grid-item--has-keyline-end`.    

### `single-column-grid`
The single column grid will set content across the `main` part of the grid.

### `content-grid`
The grid for all content pages (i.e. not listing pages). In addition to the `main` and `full` designations, this grid defines parts for `primaryContent`, `secondaryContent`, and `tertiaryContent`. Whether or not there is any `secondaryContent` determines the behavior of `primaryContent` on the grid. An absence of `tertiaryContent` does not affect the behaviour of the `primaryContent` nor any `tertiaryContent`.      

Getting help
------------

- Report a bug or request a feature on [GitHub](https://github.com/libero/libero/issues/new/choose).
- Ask a question on the [Libero Community Slack](https://libero-community.slack.com/).
- Read the [code of conduct](https://libero.pub/code-of-conduct).

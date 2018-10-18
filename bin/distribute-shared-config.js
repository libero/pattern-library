const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const {promisify} = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function getConfigData(filePath) {
  const rawFileData = await readFileAsync(filePath, {encoding: 'utf8'});
  return Promise.resolve(JSON.parse(rawFileData));
}

function getBreakpoints(data) {
  return data.breakpoints;
}

function processBreakpointsForSass(breakpointData) {
  const processed = breakpointData.map((breakpoint) => {
    return `$${breakpoint.name}: ${breakpoint.threshold};`;
  });
  return `${processed.join('\n')}\n`;
}

function processBreakpointsForJs(breakpointData) {

  const formatName = function formatName(name) {
    return (name.replace(/^bkpt-site--/, '')).replace( /-[a-z]/g,(match) => {
      return match.toUpperCase().substring(1);
    } );
  };

  const wrapper = { breakpoints: {} };

  breakpointData.forEach((breakpoint) => {
    wrapper.breakpoints[formatName(breakpoint.name)] = breakpoint.threshold;
  });

  return `${JSON.stringify(wrapper)}\n`;
}

// Normalise the reported path to be from the project root
function reportFileWrite(path) {
  const reportedPath = path.replace(/(\.\.\/)*([^./])/, '\/$2');
  console.log(`written config to ${reportedPath}`);
}

function writeFile(data, outPath) {
  return writeFileAsync(path.join(__dirname, outPath), data)
    .then(() => {
      reportFileWrite(outPath);
    })
    .catch((err) => {
      throw err;
    });
}

function getConfigPath(invocationArgs) {
  const sharedConfigLocalPath = minimist(
    invocationArgs, {
      default: {
        sharedConfig: './shared-config.json'
      }
    }
  )['sharedConfig'];

  return path.join(__dirname, `../${sharedConfigLocalPath}`);
}


const paths = {
  sharedConfig: getConfigPath(process.argv),
  out: {
    js: '../source/js/config--breakpoints.json',
    sass: '../source/css/sass/_variables--breakpoints.scss'
  }
};

function distributeBreakpointsToSass(breakpointData) {
  return writeFile(processBreakpointsForSass(breakpointData), paths.out.sass);
}

function distributeBreakpointsToJs(breakpointData) {
  return writeFile(processBreakpointsForJs(breakpointData), paths.out.js);
}

function distributeBreakpoints(breakpointData) {
  return Promise.all(
    [
      distributeBreakpointsToSass(breakpointData),
      distributeBreakpointsToJs(breakpointData)
    ]
  );
}

// callback useful when running via Gulp
function distribute(callback) {
  getConfigData(paths.sharedConfig)
    .then((data) => {
      distributeBreakpoints(getBreakpoints(data));
    })
    .then(() => {
      if (typeof callback === 'function')  {
        callback();
      }
    })
    .catch((err) => {
      throw err;
    });
}

module.exports = {
  distribute,
  getConfigPath,
  processBreakpointsForJs,
  processBreakpointsForSass
};

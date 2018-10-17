const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const {promisify} = require('util');

const readFileAsync = promisify(fs.readFile);

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

function writeFile(data, outPath) {
  fs.writeFile(path.join(__dirname, outPath), data, (err) => {
    if (err) {
      throw err;
    }

    // Normalise the reported path to be from the project root
    const outPathReported = outPath.replace(/(\.\.\/)*([^./])/, '\/$2');
    console.log(`written config to ${outPathReported}`);
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
  writeFile(processBreakpointsForSass(breakpointData), paths.out.sass);
}

function distributeBreakpointsToJs(breakpointData) {
  writeFile(processBreakpointsForJs(breakpointData), paths.out.js);
}

function distributeBreakpoints(breakpointData) {
  distributeBreakpointsToSass(breakpointData);
  distributeBreakpointsToJs(breakpointData);
}

function distribute() {
  getConfigData(paths.sharedConfig).then((data) => {
    distributeBreakpoints(getBreakpoints(data));
  });
}

module.exports = {
  distribute,
  getConfigPath,
  processBreakpointsForJs,
  processBreakpointsForSass
};

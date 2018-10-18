const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const fs = require('fs');
const tmp = require('tmp');

const distribute = require('./distribute-shared-config');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('distribute-shared-config', () => {

  describe('processing the breakpoint data', () => {

    let breakpointData;

    beforeEach(() => {
      breakpointData = [
        {
          "name": "bkpt-site--x-narrow",
          "threshold": 320
        },
        {
          "name": "bkpt-site--narrow",
          "threshold": 480
        }
      ]
    });

    describe('processBreakpointsForSass() function', () => {

      it('processes the breakpoint data as Sass variables', () => {
        const observed = distribute.processBreakpointsForSass(breakpointData);
        const expected = ""
                         + "$bkpt-site--x-narrow: 320;\n"
                         + "$bkpt-site--narrow: 480;"
                         + "\n";
        expect(observed).to.equal(expected);
      });

    });

    describe('processBreakpointsForJs function', () => {

      it('processes the breakpoint data as js-friendly json', () => {
        const observed = distribute.processBreakpointsForJs(breakpointData);
        const expected = `${JSON.stringify(
          {
            "breakpoints": {
              "xNarrow": 320,
              "narrow": 480
            }
          })
          }\n`;
        expect(observed).to.equal(expected);
      });

    });

  });

  describe('getConfigPath() function', () => {

    it('by default returns a file path with the filename component of "shared-config.json"', () => {
      expect(distribute.getConfigPath([])).to.match(/^.*[^\/]*shared-config.json$/);
    });

    it('can be overridden to return a different filename component', () => {
      const customFilenameArgs = ['--sharedConfig=some-non-default-file.json'];
      expect(distribute.getConfigPath(customFilenameArgs)).to.match(/^.*[^\/]*some-non-default-file.json$/);
    });

  });

  describe('getConfigData() function', () => {

    it('Rejects the Promise if the config file does not exist', () => {
      return expect(distribute.getConfigData('./path/to/nowhere.json')).to.be.rejected;
    });

    it('Rejects the Promise if the config file contains invalid JSON', () => {
      const tmpFile = tmp.fileSync();
      fs.writeFileSync(tmpFile.name, 'This is not JSON data.');
      return expect(distribute.getConfigData(tmpFile.name)).to.be.rejectedWith('Unexpected token T in JSON at position 0');
    });

  });

});

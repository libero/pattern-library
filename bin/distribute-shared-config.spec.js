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
      breakpointData = {
        'category-a': {
          'a-1': 400,
          'a2': 500
        },
        'category-b': {
          'b-1': 900,
          'b2': 1200
        }
      };
    });

    describe('getBreakpoints() function', () => {

      context('when there is no breakpoint data', () => {

        it('errors with the message: "No breakpoint data found"', () => {
          const failingValues = [
            null,
            { breakpoints: null },
            { breakpoints: {} },
          ];

          failingValues.forEach((value) => {
            expect(() => {
              distribute.getBreakpoints(value);
            }).to.throw('No breakpoint data found');
          });
        });

      });

    });

    describe('processBreakpointsForSass() function', () => {

      it('processes the breakpoint data as Sass variables', () => {
        const observed = distribute.processBreakpointsForSass(breakpointData);
        const expected = ""
                         + "$bkpt-category-a--a-1: 400;\n"
                         + "$bkpt-category-a--a2: 500;\n"
                         + "$bkpt-category-b--b-1: 900;\n"
                         + "$bkpt-category-b--b2: 1200;\n";
        expect(observed).to.equal(expected);
      });

    });

    describe('processBreakpointsForJs function', () => {

      it('processes the breakpoint data as js-friendly json', () => {
        const observed = distribute.processBreakpointsForJs(breakpointData);
        const expected = `${JSON.stringify(
          {
            "category-a": {
              "a-1": 400,
              "a2": 500
            },
            "category-b": {
              "b-1": 900,
              "b2": 1200
            }
          })
          }\n`;
        expect(observed).to.equal(expected);
      });

    });

  });

  describe('getConfigPath() function', () => {

    it('by default returns a file path with the filename component of "shared-config.yaml"', () => {
      expect(distribute.getConfigPath([])).to.match(/^.*[^\/]*shared-config.yaml$/);
    });

    it('can be overridden to return a different filename component', () => {
      const customFilenameArgs = ['--sharedConfig=some-non-default-file.yaml'];
      expect(distribute.getConfigPath(customFilenameArgs)).to.match(/^.*[^\/]*some-non-default-file.yaml$/);
    });

  });

  describe('getConfigData() function', () => {

    it('Rejects the Promise if the config file does not exist', () => {
      return expect(distribute.getConfigData('./path/to/nowhere.json')).to.be.rejected;
    });

  });

});

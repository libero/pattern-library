const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const expect = chai.expect;
chai.use(chaiAsPromised);


const configGenerator = require('../../libero-config/configGenerator');

describe('the processDeferredConfig function', () => {

  context('when passed config containing a value not beginning "!expression"', () => {

    let configWithNoDeferrals;

    beforeEach(() => {

      configWithNoDeferrals = {
        stringProperty: 'string property',
        nestedStringProperty: {
          nested: {
            string: {
              property: 'nested string property value'
            }
          }
        }
      };

    });

    it('passes that value through unchanged', () => {
      expect(
        configGenerator.processDeferredConfig(configWithNoDeferrals)
      ).to.eventually.deep.equal(configWithNoDeferrals)
    });

  });

  context('when passed config containing a value beginning "!expression"', () => {

    let configWithDeferrals;

    beforeEach(() => {

      configWithDeferrals = {
        rootValue: 10,
        derivedValue: '!expression rootValue * 30'
      };

    });

    it('evaluates that expression within the context of config', () => {
      expect(configGenerator.processDeferredConfig(configWithDeferrals)).to.eventually.have.own.property('rootValue', 10);
      expect(configGenerator.processDeferredConfig(configWithDeferrals)).to.eventually.have.own.property('derivedValue', 300);
    });

  });

});

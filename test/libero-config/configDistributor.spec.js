const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const Color = require('color');
const fixtures = require('./fixtures/configFixtures');
const configDistributor = require('../../libero-config/bin/configDistributor');

const spy = sinon.spy;

chai.use(chaiAsPromised);
const expect = chai.expect;

const standAloneConfigFixtureFilePath = './fixtures/configFixtureStandAlone';
const standAloneConfigFixture = require(standAloneConfigFixtureFilePath);

describe('A shared config distribution module', () => {

  describe('distribute function', () => {

    let configPaths;

    it('initiates config generation with the config paths supplied', () => {
      const configGeneratorMock = {
        generateConfig: () => {
          return Promise.resolve(standAloneConfigFixture);
        }
      };
      spy(configGeneratorMock, 'generateConfig');

      const configPaths = fixtures.configPaths;
      return configDistributor.distribute(configPaths, configGeneratorMock).then(() => {
        expect(configGeneratorMock.generateConfig.calledOnceWithExactly(configPaths)).to.be.true;
      });
    });

  });

  describe('processForSass function', () => {

    context('when supplied with a JavaScript object defining data for SASS variables', () => {

      let sassConfigFixture;

      beforeEach(() => {
        sassConfigFixture = fixtures.sassConfigToProcess.input;
      });

      it('correctly converts the JavaScript into a string wrapping corresponding SASS variable declarations', () => {
        const processed = configDistributor.processForSass(sassConfigFixture);
        expect(processed).to.deep.equal(fixtures.sassConfigToProcess.expected);
      });

    });


  });

  describe('processForJs function function', () => {

    context('when supplied with a JavaScript object defining data for the JavaScript layer', () => {

      let jsConfigFixture;

      beforeEach(() => {
        jsConfigFixture = fixtures.jsConfigToProcess.input;
      });

      it('correctly converts the JavaScript into the appropriate JSON', () => {
        const processed = configDistributor.processForJs(['breakpoints'], jsConfigFixture);
        expect(processed).to.deep.equal(JSON.stringify(fixtures.jsConfigToProcess.input));
      });

    });

  });

});

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const expect = chai.expect;
chai.use(chaiAsPromised);

const Color = require('color');
const configGenerator = require('../../libero-config/configGenerator');

describe('A configGenerator module', () => {

  describe('processDeferredConfig function', () => {

    let configWithNoDeferrals;
    let configWithDeferrals;

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

      configWithDeferrals = {
        rootValue: 10,
        derivedValue: '!expression rootValue * 30'
      };

    });

    context('when passed config containing a value beginning "!expression"', () => {

      it('evaluates that expression within the context of config', () => {
        return expect(
          configGenerator.processDeferredConfig(configWithDeferrals)
        ).to.eventually.have.own.property('derivedValue', 300);
      });

    });

    context('when passed config containing a value beginning "!expression"', () => {

      it('passes that value through unchanged', () => {
        return expect(
          configGenerator.processDeferredConfig(configWithDeferrals)
        ).to.eventually.have.own.property('rootValue', 10);
      });

    });

  });

  describe('mergeConfig function', () => {

    let firstConfig;
    let secondConfig;
    let colorIn;
    let merged;

    beforeEach(() => {

      colorIn = Color('#663399');

      firstConfig = {
        data: {
          clash: 'config 1 clashing value',
          objects: [
            {
              id: 1
            },
            {
              id: 2
            },
            {
              id: 3
            }
          ],
          color: colorIn
        }
      };

      secondConfig = {
        data: {
          clash: 'config 2 clashing value',
          additionalProperty: 'I am only in one of the configs',
          objects: [
            {
              id: 4
            },
            {
              id: 5
            },
            {
              id: 6
            }
          ]
        }
      };

      merged = configGenerator.mergeConfig([firstConfig, secondConfig]);

    });

    it('performs a deep merge using a list of config objects', () => {
      expect(merged.objects).to.have.lengthOf(6);
      expect(merged.objects[0]).to.deep.equal(firstConfig.data.objects[0]);
      expect(merged.objects[1]).to.deep.equal(firstConfig.data.objects[1]);
      expect(merged.objects[2]).to.deep.equal(firstConfig.data.objects[2]);
      expect(merged.objects[3]).to.deep.equal(secondConfig.data.objects[0]);
      expect(merged.objects[4]).to.deep.equal(secondConfig.data.objects[1]);
      expect(merged.objects[5]).to.deep.equal(secondConfig.data.objects[2]);
      expect(merged.objects[6]).to.deep.equal(secondConfig.data.objects[3]);
      expect(merged.additionalProperty).to.equal(secondConfig.data.additionalProperty);
    });

    it('ignores instances of Color', () => {
      expect(merged.color).to.be.an.instanceOf(Color);
    });

    context('when passed object properties that would cause a merge conflict', () => {

      it('the one passed last wins', () => {
        expect(merged.clash).to.equal(secondConfig.data.clash);
      });

    });

  });

  describe('allocateToLayers function', () => {

    let allConfigsAllocations;
    let mergedAllocations;

    beforeEach(() => {
      allConfigsAllocations = [
        {
          layerAllocations: {
            sass: ['breakpoints', 'colors'],
            js: ['breakpoints'],
            template: ['grid']
          }
        },
        {
          layerAllocations: {
            sass: ['breakpoints', 'colors', 'grid'],
            js: ['breakpoints', 'colors']
          }
        }
      ];

      mergedAllocations = configGenerator.allocateToLayers(allConfigsAllocations);
    });

    it('correctly merges allocations from all configs', () => {
      expect(mergedAllocations.sass).to.be.an('array').that.has.a.lengthOf(3);
      expect(mergedAllocations.sass).to.include('breakpoints');
      expect(mergedAllocations.sass).to.include('colors');
      expect(mergedAllocations.sass).to.include('grid');

      expect(mergedAllocations.js).to.be.an('array').that.has.a.lengthOf(2);
      expect(mergedAllocations.js).to.include('breakpoints');
      expect(mergedAllocations.js).to.include('colors');

      expect(mergedAllocations.template).to.be.an('array').that.has.a.lengthOf(1);
      expect(mergedAllocations.template).to.include('grid');
    });

  });

});

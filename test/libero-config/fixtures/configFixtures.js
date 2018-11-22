const Color = require('color');

module.exports = {

  configWithNoDeferrals: {
    stringProperty: 'string property',
    nestedStringProperty: {
      nested: {
        string: {
          property: 'nested string property value'
        }
      }
    }
  },

  configWithDeferrals: {
    rootValue: 10,
    derivedValue: '!expression rootValue * 30'
  },

  configsToMerge: {

    firstConfig: {
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
        color: Color('#663399')
      }
    },

    secondConfig: {
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
    }
  },

  configLayerAllocations: [
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
  ]

};





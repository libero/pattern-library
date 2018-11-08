module.exports = class PropertyLayerAllocator {

  constructor (configData) {

    this.configData = configData;

    this.forSass = [];
    this.forJs = [];
    this.forTwig = [];
  }

  allocateToSass(propertyNames) {
    propertyNames.forEach((propertyName) => {
      this._allocatePropertyToLayer(propertyName, this.forSass);
    });
  }

  allocateToJs(propertyNames) {
    propertyNames.forEach((propertyName) => {
      this._allocatePropertyToLayer(propertyName, this.forJs);
    });
  }

  allocateToTwig(propertyNames) {
    propertyNames.forEach((propertyName) => {
      this._allocatePropertyToLayer(propertyName, this.forTwig);
    });
  }

  getAllocatedToSass() {
    return this.forSass;
  }

  getAllocatedToJs() {
    return this.forJs;
  }

  getAllocatedToTwig() {
    return this.forTwig;
  }

  _allocatePropertyToLayer(propertyName, layer) {
    const property = {};
    property[propertyName] = this.configData[propertyName];
    layer.push(property);
  }

};

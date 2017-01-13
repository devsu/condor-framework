const Builder = require('./builder');

module.exports = class {
  constructor() {
    this._builder = new Builder();
  }

  addService() {
    this._builder.addService(...arguments);
    return this;
  }

  addMiddleware() {
    this._builder.addMiddleware(...arguments);
    return this;
  }

  addErrorHandler() {
    this._builder.addErrorHandler(...arguments);
    return this;
  }
};

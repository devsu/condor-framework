const Builder = require('./builder');

module.exports = class {
  constructor() {
    this._builder = new Builder();
  }

  _addService() {
    this._builder._addService(...arguments);
    return this;
  }

  _addMiddleware() {
    this._builder._addMiddleware(...arguments);
    return this;
  }

  _addErrorHandler() {
    this._builder._addErrorHandler(...arguments);
    return this;
  }
};

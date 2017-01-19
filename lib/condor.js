const Builder = require('./builder');
const Server = require('./server');

module.exports = class {
  constructor(options) {
    this._builder = new Builder();
    this._options = options;
  }

  addService() {
    this._validateServerHasNotStarted();
    this._builder.addService(...arguments);
    return this;
  }

  addMiddleware() {
    this._validateServerHasNotStarted();
    this._builder.addMiddleware(...arguments);
    return this;
  }

  addErrorHandler() {
    this._validateServerHasNotStarted();
    this._builder.addErrorHandler(...arguments);
    return this;
  }

  start() {
    this._server = new Server(this._builder, this._options).start();
    return this;
  }

  _hasStarted() {
    if (this._server) {
      return this._server._hasStarted();
    }
    return false;
  }
  _validateServerHasNotStarted() {
    if (this._hasStarted()) {
      throw new Error('Cannot perform operation: Server has already started');
    }
  }

  getOptions() {
    return this._server && this._server.getOptions();
  }

  stop(callback) {
    this._server.stop(callback);
  }

  forceStop() {
    this._server.forceStop();
  }
};

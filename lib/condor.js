const Builder = require('./builder');
const Server = require('./server');

module.exports = class {
  constructor(options) {
    this._builder = new Builder();
    this._options = options;
  }

  _addService() {
    if (this._hasStarted()) {
      throw new Error('Cannot add service: Server has already started');
    }
    this._builder._addService(...arguments);
    return this;
  }

  _addMiddleware() {
    if (this._hasStarted()) {
      throw new Error('Cannot add middleware: Server has already started');
    }
    this._builder._addMiddleware(...arguments);
    return this;
  }

  _addErrorHandler() {
    if (this._hasStarted()) {
      throw new Error('Cannot add error handler: Server has already started');
    }
    this._builder._addErrorHandler(...arguments);
    return this;
  }

  _start() {
    this._server = new Server(this._builder, this._options)._start();
    return this;
  }

  _hasStarted() {
    if (this._server) {
      return this._server._hasStarted();
    }
    return false;
  }

  _getOptions() {
    return this._server && this._server._getOptions();
  }
};

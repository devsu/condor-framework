const Builder = require('./builder');
const Server = require('./server');

module.exports = class {
  constructor(options) {
    this._builder = new Builder();
    this._options = options;
  }

  addService() {
    if (this._hasStarted()) {
      throw new Error('Cannot add service: Server has already started');
    }
    this._builder.addService(...arguments);
    return this;
  }

  addMiddleware() {
    if (this._hasStarted()) {
      throw new Error('Cannot add middleware: Server has already started');
    }
    this._builder.addMiddleware(...arguments);
    return this;
  }

  addErrorHandler() {
    if (this._hasStarted()) {
      throw new Error('Cannot add error handler: Server has already started');
    }
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

  getOptions() {
    return this._server && this._server.getOptions();
  }
};

const Builder = require('./builder');
const Server = require('./server');

module.exports = class {
  constructor(customOptions) {
    const options = Object.assign({}, customOptions);
    if (!options.listen) {
      const host = options.host || '0.0.0.0';
      const port = options.port || '50051';
      options.listen = `${host}:${port}`;
      delete options.host;
      delete options.port;
    }
    this._builder = new Builder(options);
    this._options = options;
  }

  add() {
    this._validateServerHasNotStarted();
    this._builder.add(...arguments);
    return this;
  }

  addService() {
    this._validateServerHasNotStarted();
    this._builder.addService(...arguments);
    return this;
  }

  use() {
    this._validateServerHasNotStarted();
    this._builder.use(...arguments);
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

  hasStarted() {
    if (this._server) {
      return this._server.hasStarted();
    }
    return false;
  }
  _validateServerHasNotStarted() {
    if (this.hasStarted()) {
      throw new Error('Cannot perform operation: Server has already started');
    }
  }

  stop(callback) {
    return this._server.stop(callback);
  }

  forceStop() {
    this._server.forceStop();
  }
};

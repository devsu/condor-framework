const grpc = require('grpc');
const _ = require('lodash');
const chalk = require('chalk');
const Builder = require('./builder');
const Proxy = require('./proxy');
const defaultOptions = {
  'host': '0.0.0.0',
  'port': 3000,
  'creds': grpc.ServerCredentials.createInsecure(),
};

module.exports = class {
  constructor(builder, options) {
    this._validateBuilder(builder);
    this._isStarted = false;
    this._options = defaultOptions;
    _.assign(this._options, options);
    this._middleware = builder.getMiddleware();
    this._errorHandlers = builder.getErrorHandlers();
    this._grpcServer = new grpc.Server();

    builder.getServices().forEach((serviceDefinition) => {
      this._addProtoService(serviceDefinition);
    });
  }

  _addProtoService(serviceDefinition) {
    const grpcObject = grpc.load(serviceDefinition.protoFilePath);
    const proxy = new Proxy(serviceDefinition, this._middleware, this._errorHandlers);
    const service = this._getServiceFromName(grpcObject, serviceDefinition.serviceFullName);
    this._grpcServer.addProtoService(service, proxy);
  }

  _getServiceFromName(grpcObject, serviceFullName) {
    let service = grpcObject;
    const serviceNameComponents = serviceFullName.split('.');
    serviceNameComponents.forEach((component) => {
      service = service[component];
    });
    return service.service;
  }

  getOptions() {
    return this._options;
  }

  start() {
    const serverUrl = `${this._options.host}:${this._options.port}`;
    this._grpcServer.bind(serverUrl, this._options.creds);
    this._grpcServer.start();
    this._isStarted = this._grpcServer.started;
    console.log(chalk.green(`Condor GRPC Server is listening at ${serverUrl}`)); // eslint-disable-line
    return this;
  }

  stop(callback) {
    this._validateServerIsRunning();
    this._grpcServer.tryShutdown(() => {
      this._isStarted = false;
      if (callback) {
        callback();
      }
    });
  }

  forceStop() {
    this._validateServerIsRunning();
    this._grpcServer.forceShutdown();
    this._isStarted = false;
  }

  _hasStarted() {
    return this._isStarted;
  }

  _validateBuilder(builder) {
    if (!(builder instanceof Builder)) {
      throw new Error('Cannot start server: Server should be constructed with a builder');
    }
    if (builder.getServices().length === 0) {
      throw new Error('Cannot start server: No services have been defined');
    }
  }

  _validateServerIsRunning() {
    if (!this._hasStarted()) {
      throw new Error('Cannot stop server: server is not running');
    }
  }

};

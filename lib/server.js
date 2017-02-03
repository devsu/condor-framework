const grpc = require('grpc');
const fs = require('fs');
const Promise = require('bluebird');
const _ = require('lodash');
const chalk = require('chalk');
const Builder = require('./builder');
const Proxy = require('./proxy');

module.exports = class {
  constructor(builder, options) {
    const defaultOptions = {
      'host': '0.0.0.0',
      'port': 3000,
    };

    this._validateBuilder(builder);
    this._creds = grpc.ServerCredentials.createInsecure();
    if (this._hasSslOptions(options)) {
      this._validateSslOptions(options);
      this._creds = this._getOptionsWithSslCredentials(options);
    }
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
    this._grpcServer.bind(serverUrl, this._creds);
    this._grpcServer.start();
    this._isStarted = this._grpcServer.started;
    console.log(chalk.green(`Condor GRPC Server is listening at ${serverUrl}`)); // eslint-disable-line
    return this;
  }

  stop() {
    this._validateServerIsRunning();
    return new Promise((resolve, reject) => {
      this._grpcServer.tryShutdown((error) => {
        if (error) {
          return reject(error);
        }
        this._isStarted = false;
        resolve();
      });
    });
  }

  forceStop() {
    this._validateServerIsRunning();
    this._grpcServer.forceShutdown();
    this._isStarted = false;
  }

  hasStarted() {
    return this._isStarted;
  }

  _validateBuilder(builder) {
    if (!(builder instanceof Builder)) {
      throw new Error('Cannot perform operation: Server should be constructed with a builder');
    }
    if (builder.getServices().length === 0) {
      throw new Error('Cannot perform operation: No services have been defined');
    }
  }

  _validateServerIsRunning() {
    if (!this.hasStarted()) {
      throw new Error('Cannot perform operation: Server is not running');
    }
  }

  _hasSslOptions(options) {
    return options && (options.rootCert || options.certChain || options.privateKey);
  }

  _validateSslOptions(options) {
    if (!(options.certChain && options.privateKey)) {
      throw new Error('Cannot perform operation: privateKey and certChain' +
        ' are required when using ssl');
    }
  }

  _getOptionsWithSslCredentials(options) {
    let rootCert;
    if (options.rootCert) {
      rootCert = this._getFileBuffer(options.rootCert);
    }

    return grpc.ServerCredentials.createSsl(rootCert, [
      {
        'cert_chain': this._getFileBuffer(options.certChain),
        'private_key': this._getFileBuffer(options.privateKey),
      },
    ]);
  }

  _getFileBuffer(path) {
    if (!fs.existsSync(path)) {
      throw new Error(`Cannot perform operation: File not found: ${path}`);
    }
    return fs.readFileSync(path);
  }
};

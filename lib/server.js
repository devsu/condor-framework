const grpc = require('grpc');
const _ = require('lodash');
const Builder = require('./builder');
const Proxy = require('./proxy');
const defaultOptions = {
  'host': '0.0.0.0',
  'port': 3000,
  'creds': grpc.credentials.createInsecure(),
};

module.exports = class {
  constructor(builder, options) {
    if (!(builder instanceof Builder)) {
      throw new Error('Cannot start server: Server should be constructed with a builder');
    }
    if (builder._getServices().length === 0) {
      throw new Error('Cannot start server: No services have been defined');
    }
    this._isStarted = false;
    this._options = defaultOptions;
    _.assign(this._options, options);

    this._grpcServer = new grpc.Server();

    builder._getServices().forEach((serviceDefinition) => {
      this._addProtoService(serviceDefinition);
    });
  }

  _addProtoService(serviceDefinition) {
    const grpcObject = grpc.load(serviceDefinition.protoFilePath);
    const proxy = new Proxy(serviceDefinition);
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

  _getOptions() {
    return this._options;
  }

  _start() {
    const serverUrl = `${this._options.host}:${this._options.port}`;
    this._grpcServer.bind(serverUrl, this._options.creds);
    this._isStarted = true;
    this._grpcServer.start();
    return this;
  }

  _hasStarted() {
    return this._isStarted;
  }
};

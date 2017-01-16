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
    if (builder.getServices().length === 0) {
      throw new Error('Cannot start server: No services have been defined');
    }

    this._options = defaultOptions;
    _.assign(this._options, options);

    const grpcServer = new grpc.Server();

    builder.getServices().forEach((serviceDefinition) => {
      addProtoService(grpcServer, serviceDefinition);
    });
  }

  getOptions() {
    return this._options;
  }
};

function addProtoService(grpcServer, serviceDefinition) {
  const grpcObject = grpc.load(serviceDefinition.protoFilePath);
  const proxy = new Proxy(serviceDefinition);
  const service = getServiceFromName(grpcObject, serviceDefinition.serviceFullName);
  grpcServer.addProtoService(service, proxy);
}

function getServiceFromName(grpcObject, serviceFullName) {
  let service = grpcObject;
  const serviceNameComponents = serviceFullName.split('.');
  serviceNameComponents.forEach((component) => {
    service = service[component];
  });
  return service.service;
}

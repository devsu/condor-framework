const Builder = require('./builder');
const grpc = require('grpc');
const Proxy = require('./proxy');

module.exports = class {
  constructor(builder) {
    if (!(builder instanceof Builder)) {
      throw new Error('Cannot start server: Server should be constructed with a builder');
    }
    if (builder.getServices().length === 0) {
      throw new Error('Cannot start server: No services have been defined');
    }
    const grpcServer = new grpc.Server();

    builder.getServices().forEach((serviceDefinition) => {
      const grpcObject = grpc.load(serviceDefinition.protoFilePath);
      const proxy = new Proxy(serviceDefinition.implementation);
      const service = getServiceFromName(grpcObject, serviceDefinition.serviceFullName);
      grpcServer.addProtoService(service, proxy);
    });
  }
};

function getServiceFromName(grpcObject, serviceFullName) {
  let service = grpcObject;
  const serviceNameComponents = serviceFullName.split('.');
  serviceNameComponents.forEach((component) => {
    service = service[component];
  });
  return service.service;
}

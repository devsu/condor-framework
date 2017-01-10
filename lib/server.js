const grpc = require('grpc');

module.exports = class Server {
  constructor(builder) {
    this.server = new grpc.Server();
    const services = builder.getServices();
    for (let i = 0; i < services.length; i++) {
      const proto = grpc.load(services[i].protoPath);
      const properties = services[i].protoService.split('.');
      let realProto = proto;
      for (let j = 0; j < properties.length; j++) {
        realProto = realProto[properties[j]];
      }
      this.server.addProtoService(realProto.service, services[i].implementation);
    }

    const options = builder.getOptions();
    this.server.bind(options.port, options.creds);

    // const middlewares = builder.getMiddlewares();
    // for (let i = 0; i < middlewares.length; i++) {
    //   server.addProtoService(proto[services[i].proto_service].service, services[i].implementation);
    // }
  }

  start() {
    this.server.start();
  }
};

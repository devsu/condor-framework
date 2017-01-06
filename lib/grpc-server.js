const grpc = require('grpc');

module.exports = class {

  constructor() {
    this.server = grpc.Server();
  }

  registerServices(path, serviceName) {
    grpc.load(path);
    let proto = grpc.load(path);
    let serviceNameArray = serviceName.split('.');
    //for(let i=0; i < )
    proto[serviceNameArray[0]][]
    this.server.addProtoService(proto.)
  }

  listen(port) {
    return
  }

};

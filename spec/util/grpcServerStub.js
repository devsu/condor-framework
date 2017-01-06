const Spy = require('./spy');

class GrpcServerStub {
}

GrpcServerStub.addProtoService = Spy.create('server');

module.exports = GrpcServerStub;

const Spy = require('./spy');

class GrpcStub {
}

GrpcStub.load = Spy.create('load');
GrpcStub.Server = Spy.create('Server');
module.exports = GrpcStub;

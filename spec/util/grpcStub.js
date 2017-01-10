const Spy = require('./spy');

const GrpcStub = {};

GrpcStub.load = Spy.returnValue({
  'testapp': {
    'PersonService': {
      'service': 'service',
    },
  },
}, 'load');

GrpcStub.ServerMocks = {
  'addProtoService': Spy.create('addProtoService'),
  'bind': Spy.create('bind'),
  'start': Spy.create('start'),
};

GrpcStub.Server = function() {
  this.addProtoService = GrpcStub.ServerMocks.addProtoService;
  this.bind = GrpcStub.ServerMocks.bind;
  this.start = GrpcStub.ServerMocks.start;
};

module.exports = GrpcStub;

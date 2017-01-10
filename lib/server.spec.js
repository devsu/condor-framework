const grpcStub = require('../spec/util/grpcStub');
const PROTO_PATH = '../spec/person.proto';
const PersonServiceSpy = require('../spec/util/person-service-spy');
const BuilderStub = require('../spec/util/builder-stub');
const proxyquire = require('proxyquire');

describe('server', () => {
  let app, Server, options;
  beforeEach(() => {
    Server = proxyquire('./server', {'grpc': grpcStub});
    app = new Server(BuilderStub);
    options = BuilderStub.getOptions();
  });

  describe('new Server', () => {
    it('should create a new Server instance', () => {
      expect(grpcStub.load).toHaveBeenCalledTimes(1);
      expect(grpcStub.load).toHaveBeenCalledWith(PROTO_PATH);
      expect(grpcStub.ServerMocks.addProtoService).toHaveBeenCalledTimes(1);
      expect(grpcStub.ServerMocks.addProtoService).toHaveBeenCalledWith('service',
        new PersonServiceSpy());
      expect(grpcStub.ServerMocks.bind).toHaveBeenCalledTimes(1);
      expect(grpcStub.ServerMocks.bind).toHaveBeenCalledWith(options.port, options.creds);
    });
  });

  describe('start Server', () => {
    beforeEach(() => {
      app.start();
    });

    it('should start the server', () => {
      expect(grpcStub.ServerMocks.start).toHaveBeenCalledTimes(1);
    });
  });
});

const PROTO_PATH = '../spec/protos/person.proto';
const PROTO_PACKAGE = 'testapp';
const PROTO_SERVICE_NAME = `${PROTO_PACKAGE}.PersonService`;

const proxyquire = require('proxyquire');
const PersonServiceSpy = require('../spec/util/person-service-spy');
const grpcStub = require('../spec/util/grpcStub');
const grpcServerStub = require('../spec/util/grpcServerStub');

describe('grpc-server', () => {
  let GrpcServer;
  let app;

  beforeAll(()=>{
    GrpcServer = proxyquire('./grpc-server', { 'grpc': grpcStub });
    app = new GrpcServer();
  });

  it('should return an instance of GrpcServer', () => {
    expect(app instanceof GrpcServer).toBeTruthy();
  });

  it('should create a grpc.Server', () => {
    expect(grpcStub.Server).toHaveBeenCalledTimes(1);
  });

  describe('registerServices', () => {
    beforeEach(() => {
      app.registerServices(PROTO_PATH, PROTO_SERVICE_NAME, new PersonServiceSpy())
    });

    it('should load proto file', () => {
      expect(grpcStub.load).toHaveBeenCalledWith(PROTO_PATH);
    });

    /*it('should add proto service', () => {
      expect(grpcServerStub.addProtoService).toHaveBeenCalledWith(p);
    });*/
  });
});

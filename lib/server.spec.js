const proxyquire = require('proxyquire');
const PROTO_PATH = '../spec/protos/person.proto';
const PROTO_PACKAGE = 'testapp';
const PROTO_SERVICE =  `${PROTO_PACKAGE}.PersonService`;
const Builder = require('./builder');
const Mocks = require('../spec/util/mocks');

describe('Server class', () => {
  let app, Server, options, builder, personServiceMock, middlewareSpy, grpcMock, serverMock;

  beforeEach(() => {
    serverMock = Mocks.getServer();
    grpcMock = Mocks.getGrpc(serverMock);
    personServiceMock = Mocks.getPersonService();
    Server = proxyquire('./server', {'grpc': grpcMock});
    builder = new Builder();
    middlewareSpy = jasmine.createSpy('middlewareSpy');
    builder.addService(PROTO_PATH, PROTO_SERVICE, personServiceMock);
    builder.addMiddleware(PROTO_PACKAGE, middlewareSpy);
    options = {
      'host': '5.0.0.0',
      'port': 4000,
    };
    builder.setOptions(options);
    app = new Server(builder);
  });

  describe('constructor', () => {

    describe('create server instance', () => {

      it('should load proto files', () => {
        expect(grpcMock.load).toHaveBeenCalledTimes(1);
        expect(grpcMock.load).toHaveBeenCalledWith(PROTO_PATH);
      });

      // it('should add the proto services with the proxy object', () => {
      //   expect(serverMock.addProtoService).toHaveBeenCalledTimes(1);
      //   let arguments = serverMock.addProtoService.calls.argsFor(0);
      //   expect(arguments[0]).toEqual('service');
      //   expect(arguments[1]).toEqual(jasmine.any(Object));
      // });

      // describe('proxy object', () => {
      //   let proxyObject;
      //
      //   beforeEach(() => {
      //     const arguments = serverMock.addProtoService.calls.argsFor(0);
      //     proxyObject = arguments[1];
      //   });
      //
      //   it('should have a method for each service method defined in the implementation class', () => {
      //     expect(proxyObject).toEqual({
      //       'list': jasmine.any(Function),
      //       'get': jasmine.any(Function),
      //     });
      //   });
      //
      //   describe('each method', () => {
      //     let call;
      //     let callback;
      //
      //     beforeEach(() => {
      //       call = { 'a': '123123123' };
      //       callback = jasmine.createSpy('callback');
      //     });
      //
      //     it('should call the implementation', () => {
      //       proxyObject.list(call, callback);
      //
      //     });
      //   });
      //
      // });

      // it('should bind to the getServer', () => {
      //   expect(serverMock.bind).toHaveBeenCalledTimes(1);
      //   expect(serverMock.bind).toHaveBeenCalledWith(`${options.host}:${options.port}`,
      //     options.creds);
      // });

    });
  });

  // describe('start', () => {
  //   beforeEach(() => {
  //     app.start();
  //   });
  //
  //   it('should start the getServer', () => {
  //     expect(serverMock.start).toHaveBeenCalledTimes(1);
  //   });
  // });
});

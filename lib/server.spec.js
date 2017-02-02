const proxyquire = require('proxyquire');
const grpc = require('grpc');
const Builder = require('./builder');
const Mocks = require('../spec/util/mocks');

describe('Server:', () => {
  let Server, server, serverMock, grpcMock, personServiceMock, greeterServiceMock, builder;
  const protoFilePath = 'spec/protos/person.proto';
  const protoFilePath2 = 'spec/protos/greeter.proto';

  beforeEach(() => {
    serverMock = Mocks.getServer();
    grpcMock = Mocks.getGrpc(serverMock);
    personServiceMock = Mocks.getPersonService();
    greeterServiceMock = Mocks.getGreeterService();
    Server = proxyquire('./server', {'grpc': grpcMock});
    builder = new Builder();
    builder.addService(protoFilePath, 'testapp.PersonService', personServiceMock);
    builder.addService(protoFilePath2, 'testapp.greeter.GreeterService', greeterServiceMock);
    server = new Server(builder);
  });

  describe('constructor()', () => {
    it('should return an instance of the server class', () => {
      expect(server instanceof Server).toBeTruthy();
    });

    describe('getOptions()', () => {
      describe('when server was initialized without options', () => {
        it('should return the default options', () => {
          const defaultOptions = {
            'host': '0.0.0.0',
            'port': 3000,
          };
          expect(server.getOptions()).toEqual(defaultOptions);
        });
      });

      describe('when server was initialized with options', () => {
        beforeEach(() => {
          const options = {'host': '1.1.1.1'};
          server = new Server(builder, options);
        });

        it('should return the options merged with the default options', () => {
          const expectedOptions = {
            'host': '1.1.1.1',
            'port': 3000,
          };
          expect(server.getOptions()).toEqual(expectedOptions);
        });
      });

      describe('when server was initialized with ssl options', () => {
        describe('only with rootCert', () => {
          it('throw an error', () => {
            const options = {'rootCert': '/path/to/cert'};
            expect(() => {
              server = new Server(builder, options);
            }).toThrowError('Cannot perform operation: privateKey and certChain' +
              ' are required when using ssl');
          });
        });

        describe('only with privateKey', () => {
          it('throw an error', () => {
            const options = {'privateKey': '/path/to/private/key'};
            expect(() => {
              server = new Server(builder, options);
            }).toThrowError('Cannot perform operation: privateKey and certChain' +
              ' are required when using ssl');
          });
        });

        describe('only with certChain', () => {
          it('throw an error', () => {
            const options = {'certChain': '/path/to/cert/chain'};
            expect(() => {
              server = new Server(builder, options);
            }).toThrowError('Cannot perform operation: privateKey and certChain' +
              ' are required when using ssl');
          });
        });

        describe('without rootCert', () => {
          it('should create ssl creds', () => {
            const expectedOptions = {
              'host': '0.0.0.0',
              'port': 3000,
              'certChain': 'spec/ssl/server.pem',
              'privateKey': 'spec/ssl/server.key',
            };
            const options = {
              'certChain': 'spec/ssl/server.pem',
              'privateKey': 'spec/ssl/server.key',
            };
            server = new Server(builder, options);
            expect(server.getOptions()).toEqual(expectedOptions);
          });
        });

        describe('all ssl options passed', () => {
          describe('when ssl options are not file paths', () => {
            it('should throw an error', () => {
              const options = {
                'rootCert': '/path/to/certificate',
                'certChain': '/path/to/cert/chain',
                'privateKey': '/path/to/private/key',
              };
              expect(() => {
                server = new Server(builder, options);
              }).toThrowError('Cannot perform operation: File not found: /path/to/certificate');
            });
          });

          describe('when ssl options are files paths', () => {
            const expectedOptions = {
              'host': '0.0.0.0',
              'port': 3000,
              'rootCert': 'spec/ssl/ca.pem',
              'certChain': 'spec/ssl/server.pem',
              'privateKey': 'spec/ssl/server.key',
            };
            it('should create ssl credentials', () => {
              const options = {
                'rootCert': 'spec/ssl/ca.pem',
                'certChain': 'spec/ssl/server.pem',
                'privateKey': 'spec/ssl/server.key',
              };
              server = new Server(builder, options);
              expect(server.getOptions()).toEqual(expectedOptions);
            });
          });
        });
      });
    });

    describe('when builder is not set', () => {
      it('should throw an error', () => {
        expect(() => {
          new Server(); // eslint-disable-line
        }).toThrowError('Cannot perform operation: Server should be constructed with a builder');
      });
    });

    describe('when the passed argument is not an instance of Builder class', () => {
      it('should throw an error', () => {
        expect(() => {
          new Server({}); // eslint-disable-line
        }).toThrowError('Cannot perform operation: Server should be constructed with a builder');
      });
    });

    describe('when builder has no services defined', () => {
      it('should throw an error', () => {
        expect(() => {
          new Server(new Builder()); // eslint-disable-line
        }).toThrowError('Cannot perform operation: No services have been defined');
      });
    });

    it('should create a grpc server object', () => {
      expect(grpcMock.Server).toHaveBeenCalledTimes(1);
    });

    it('should add each proto service defined with the service interface and the proxy', () => {
      const expectedService = {'a': 1};
      const expectedProxy = {
        'list': jasmine.any(Function),
        'get': jasmine.any(Function),
      };
      const expectedService2 = {'a': 2};
      const expectedProxy2 = {
        'sayHello': jasmine.any(Function),
        'sayGoodbye': jasmine.any(Function),
      };
      expect(serverMock.addProtoService).toHaveBeenCalledTimes(2);
      expect(serverMock.addProtoService).toHaveBeenCalledWith(expectedService, expectedProxy);
      expect(serverMock.addProtoService).toHaveBeenCalledWith(expectedService2, expectedProxy2);
    });
  });

  describe('start()', () => {
    it('should have not started', () => {
      expect(server.hasStarted()).toEqual(false);
    });

    it('should return an instance of server', () => {
      const instance = server.start();
      expect(instance).toBe(server);
    });

    it('should bind the default options to the grpc server', () => {
      const serverUrl = '0.0.0.0:3000';
      server.start();
      expect(serverMock.bind).toHaveBeenCalledTimes(1);
      expect(serverMock.bind).toHaveBeenCalledWith(serverUrl,
        grpc.ServerCredentials.createInsecure());
    });

    it('should bind the options passed to the grpc server', () => {
      const options = {
        'host': '127.0.0.1',
        'port': '9090',
      };
      server = new Server(builder, options);
      const serverUrl = `${options.host}:${options.port}`;
      server.start();
      expect(serverMock.bind).toHaveBeenCalledTimes(1);
      expect(serverMock.bind).toHaveBeenCalledWith(serverUrl,
        grpc.ServerCredentials.createInsecure());
    });

    it('should start the server', () => {
      server.start();
      expect(server.hasStarted()).toEqual(true);
      expect(serverMock.start).toHaveBeenCalledTimes(1);
    });

    it('should pass the ssl credentials to grpc server', () => {
      const creds = grpc.ServerCredentials.createSsl(new Buffer('rootCert'), [
        {
          'cert_chain': new Buffer('cert_chain'),
          'private_key': new Buffer('private_key'),
        },
      ]);
      server = new Server(builder, {
        'cert_chain': '/path/to/cert/chain.pem',
        'private_key': '/path/to/private/key.key',
      });
      server.start();
      expect(serverMock.bind).toHaveBeenCalledTimes(1);
      expect(serverMock.bind).toHaveBeenCalledWith(jasmine.any(String), creds);
    });
  });

  describe('stop()', () => {
    it('should try to stop the server', (done) => {
      server.start();
      server.stop().finally(() => {
        expect(serverMock.tryShutdown).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('when server is shut down', () => {
      it('should set hasStarted flag to false', (done) => {
        server.start();
        server.stop().then(() => {
          expect(server.hasStarted()).toEqual(false);
          done();
        });
      });
    });

    describe('when there was an error shutting down the server', () => {
      it('should reject with error', (done) => {
        const expectedError = 'Error shutting down';
        serverMock.tryShutdown = (callback) => {
          callback(expectedError);
        };
        server.start();
        server.stop().catch((error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });
    });

    describe('when server is not running', () => {
      it('should throw an error', () => {
        expect(() => {
          server.stop();
        }).toThrowError('Cannot perform operation: Server is not running');
      });
    });
  });

  describe('forceStop()', () => {
    it('should force the server to stop', () => {
      server.start();
      server.forceStop();
      expect(serverMock.forceShutdown).toHaveBeenCalledTimes(1);
      expect(server.hasStarted()).toEqual(false);
    });

    describe('when server is not running', () => {
      it('should throw an error', () => {
        expect(() => {
          server.forceStop();
        }).toThrowError('Cannot perform operation: Server is not running');
      });
    });
  });
});

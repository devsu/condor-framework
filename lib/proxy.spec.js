const Proxy = require('./proxy');
const Response = require('./response');
const Mocks = require('../spec/util/mocks');
const Spy = require('../spec/util/spy');

/* eslint max-lines: "off" */
describe('Proxy:', () => {
  let serviceDefinition, proxy, personServiceMock, middlewareMock, middleware, errorHandlerMock,
    errorHandlers, call, expectedError, expectedResponse;

  beforeEach(() => {
    middlewareMock = Mocks.getMiddleware();
    personServiceMock = Mocks.getPersonService();
    errorHandlerMock = Mocks.getErrorHandler();
    serviceDefinition = {
      'protoFilePath': 'spec/protos/person.proto',
      'serviceFullName': 'testapp.PersonService',
      'implementation': personServiceMock,
    };
    middleware = middlewareMock.middleware;
    errorHandlers = errorHandlerMock.errorHandlers;
    proxy = new Proxy(serviceDefinition, middleware, errorHandlers);
    call = {'a': 1};
  });

  it('should return an object', () => {
    expect(proxy instanceof Proxy).toBeFalsy();
    expect(proxy instanceof Object).toBeTruthy();
  });

  it('should have a method for each method defined in the proto service definition', () => {
    expect(Object.getOwnPropertyNames(proxy).length).toEqual(2);
    expect(proxy.list).toEqual(jasmine.any(Function));
    expect(proxy.get).toEqual(jasmine.any(Function));

    const greeterServiceMock = Mocks.getGreeterService();
    const greeterServiceDefinition = {
      'protoFilePath': 'spec/protos/greeter.proto',
      'serviceFullName': 'testapp.greeter.GreeterService',
      'implementation': greeterServiceMock,
    };
    proxy = new Proxy(greeterServiceDefinition);
    expect(Object.getOwnPropertyNames(proxy).length).toEqual(2);
    expect(proxy.sayHello).toEqual(jasmine.any(Function));
    expect(proxy.sayGoodbye).toEqual(jasmine.any(Function));
  });

  describe('when passed implementation class inherits methods from other classes', () => {
    it('inherited methods should be treated as any other method', () => {
      const getGreeterSubSubClassMock = Mocks.getGreeterSubSubclass();
      const serviceDefinition = {
        'protoFilePath': 'spec/protos/greeter.proto',
        'serviceFullName': 'testapp.greeter.GreeterService',
        'implementation': getGreeterSubSubClassMock,
      };
      proxy = new Proxy(serviceDefinition);
      expect(Object.getOwnPropertyNames(proxy).length).toEqual(2);
      expect(proxy.sayHello).toEqual(jasmine.any(Function));
      expect(proxy.sayGoodbye).toEqual(jasmine.any(Function));
    });
  });

  describe('when passed implementation is a simple object', () => {
    it('should be treated as any class instance', () => {
      const implementation = {
        'sayHello': () => {}, // eslint-disable-line
        'sayGoodbye': () => {}, // eslint-disable-line
      };
      const serviceDefinition = {
        'protoFilePath': 'spec/protos/greeter.proto',
        'serviceFullName': 'testapp.greeter.GreeterService',
        'implementation': implementation,
      };
      proxy = new Proxy(serviceDefinition);
      expect(Object.getOwnPropertyNames(proxy).length).toEqual(2);
      expect(proxy.sayHello).toEqual(jasmine.any(Function));
      expect(proxy.sayGoodbye).toEqual(jasmine.any(Function));
    });
  });

  describe('each method', () => {
    describe('when no middleware nor error handler is defined', () => {
      const expectedObject = {'message': 'Listing'};

      beforeEach(() => {
        proxy = new Proxy(serviceDefinition);
      });

      it('should call the implementation method', (done) => {
        proxy.list(call, () => {
          expect(personServiceMock.list).toHaveBeenCalledTimes(1);
          expect(personServiceMock.list).toHaveBeenCalledWith(call);
          done();
        });
      });

      it('should return with an object', (done) => {
        personServiceMock.list = Spy.returnValue(expectedObject);
        proxy.list(call, (error, value) => {
          expect(value).toEqual(expectedObject);
          expect(error).toBeNull();
          done();
        });
      });

      describe('when implementation returns undefined', () => {
        it('should return an empty object', (done) => {
          personServiceMock.list = Spy.returnValue();
          proxy.list(call, (error, value) => {
            expect(value).toEqual({});
            expect(error).toBeNull();
            done();
          });
        });
      });

      describe('when throws an error', () => {
        it('should return the error', (done) => {
          personServiceMock.list = Spy.throwError('Error');
          proxy.list(call, (error) => {
            expect(error).toEqual(new Error('Error'));
            done();
          });
        });
      });

      describe('when returns a promise', () => {
        it('should wait for the promise to resolve and return with the value', (done) => {
          personServiceMock.list = Spy.resolve('result');
          proxy.list(call, (error, value) => {
            expect(value).toEqual('result');
            expect(error).toBeNull();
            done();
          });
        });

        it('should wait for the promise to resolve and return undefined', (done) => {
          personServiceMock.list = Spy.resolve();
          proxy.list(call, (error, value) => {
            expect(value).toEqual({});
            expect(error).toBeNull();
            done();
          });
        });

        it('should wait for the promise to reject and return with the error', (done) => {
          personServiceMock.list = Spy.reject('Error');
          proxy.list(call, (error) => {
            expect(error).toEqual('Error');
            done();
          });
        });
      });
    });

    describe('callback is undefined (streams)', () => {
      let stream;

      beforeEach(() => {
        stream = {'emit': Spy.create('emit')};
      });

      it('should not throw an error', (done) => {
        personServiceMock.list = Spy.returnValue('anything');
        proxy.list(stream).then(() => {
          done();
        });
      });

      describe('implementation throws an error', () => {
        it('should emit the error', (done) => {
          expectedError = new Error('My Internal Server Error');
          personServiceMock.list = Spy.throwError('My Internal Server Error');
          proxy.list(stream).then(() => {
            expect(stream.emit).toHaveBeenCalledTimes(1);
            expect(stream.emit).toHaveBeenCalledWith('error', expectedError);
            done();
          });
        });
      });

      describe('error handler throws an error', () => {
        it('should emit the error', (done) => {
          expectedError = 'secondError';
          personServiceMock.list = Spy.throwError('My Internal Server Error');
          errorHandlerMock.globalErrorHandler.method = Spy.reject(expectedError);
          proxy.list(stream).then(() => {
            expect(stream.emit).toHaveBeenCalledTimes(1);
            expect(stream.emit).toHaveBeenCalledWith('error', expectedError);
            done();
          });
        });
      });
    });

    describe('when middleware is added', () => {
      it('should call all global middleware', (done) => {
        proxy.list(call, () => {
          expect(middlewareMock.globalMiddleware.method).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should call corresponding package middleware', (done) => {
        proxy.list(call, () => {
          expect(middlewareMock.packageMiddleware.method).toHaveBeenCalledTimes(1);
          expect(middlewareMock.packageMiddleware2.method).not.toHaveBeenCalled();
          done();
        });
      });

      it('should call corresponding service middleware', (done) => {
        proxy.list(call, () => {
          expect(middlewareMock.serviceMiddleware.method).toHaveBeenCalledTimes(1);
          expect(middlewareMock.serviceMiddleware2.method).not.toHaveBeenCalled();
          done();
        });
      });

      it('should call corresponding method middleware', (done) => {
        proxy.list(call, () => {
          expect(middlewareMock.methodMiddleware.method).toHaveBeenCalledTimes(1);
          expect(middlewareMock.methodMiddleware2.method).not.toHaveBeenCalled();
          done();
        });
      });
    });

    describe('when error handlers are added', () => {
      beforeEach(() => {
        middlewareMock.globalMiddleware.method = Spy.throwError('Error handler');
      });

      it('should call all global error handlers', (done) => {
        proxy.list(call, () => {
          expect(errorHandlerMock.globalErrorHandler.method).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should call corresponding package error handlers', (done) => {
        proxy.list(call, () => {
          expect(errorHandlerMock.packageErrorHandler.method).toHaveBeenCalledTimes(1);
          expect(errorHandlerMock.packageErrorHandler2.method).not.toHaveBeenCalled();
          done();
        });
      });

      it('should call corresponding service error handlers', (done) => {
        proxy.list(call, () => {
          expect(errorHandlerMock.serviceErrorHandler.method).toHaveBeenCalledTimes(1);
          expect(errorHandlerMock.serviceErrorHandler2.method).not.toHaveBeenCalled();
          done();
        });
      });

      it('should call corresponding method error handlers', (done) => {
        proxy.list(call, () => {
          expect(errorHandlerMock.methodErrorHandler.method).toHaveBeenCalledTimes(1);
          expect(errorHandlerMock.methodErrorHandler2.method).not.toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('each middleware', () => {
    beforeEach(() => {
      expectedResponse = new Response({'message': 'message'});
      expectedError = new Error('Middleware Error');
    });

    describe('sends response', () => {
      beforeEach(() => {
        middlewareMock.globalMiddleware.method.and.callFake((context) => {
          context.send(expectedResponse);
        });
      });

      it('should not call the implementation', (done) => {
        proxy.list(call, () => {
          expect(personServiceMock.list).not.toHaveBeenCalled();
          done();
        });
      });

      it('should return the value', (done) => {
        proxy.list(call, (error, value) => {
          expect(value).toEqual(expectedResponse.getGrpcObject());
          expect(error).toBeNull();
          done();
        });
      });

      describe('and another middleware changes response', () => {
        const expectedResponse2 = new Response('response');

        it('should return the value', (done) => {
          middlewareMock.globalMiddleware.method.and.callFake((context, next) => {
            return next().then(() => {
              context.send(expectedResponse2);
            });
          });
          middlewareMock.packageMiddleware.method.and.callFake((context) => {
            context.send(expectedResponse);
          });
          proxy.list(call, (error, value) => {
            expect(value).toEqual(expectedResponse2.getGrpcObject());
            expect(error).toBeNull();
            done();
          });
        });
      });
    });

    describe('throws an error', () => {
      it('should return the error', (done) => {
        middlewareMock.globalMiddleware.method = Spy.throwError('Middleware Error');
        proxy.list(call, (error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });
    });

    describe('creates an error', () => {
      it('should return the error', (done) => {
        middlewareMock.globalMiddleware.method.and.callFake((context, next) => {
          return next(expectedError);
        });
        proxy.list(call, (error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });
    });
  });

  describe('each error handler', () => {
    beforeEach(() => {
      expectedResponse = new Response({'message': 'message'});
      expectedError = new Error('Middleware Error');
      middlewareMock.globalMiddleware.method = Spy.throwError('Middleware Error');
    });

    describe('propagates the error', () => {
      it('should callback with the error', (done) => {
        proxy.list(call, (error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });
    });

    describe('handles the error', () => {
      it('should return the result', (done) => {
        errorHandlerMock.globalErrorHandler.method.and.callFake((error, context, next) => {
          return next();
        });
        personServiceMock.list = Spy.returnValue(expectedResponse);
        proxy.list(call, (error, value) => {
          expect(error).toBeNull();
          expect(value).toEqual(expectedResponse.getGrpcObject());
          done();
        });
      });
    });

    describe('send response', () => {
      it('should return the response sent', (done) => {
        errorHandlerMock.globalErrorHandler.method.and.callFake((error, context) => {
          context.send(expectedResponse);
        });
        proxy.list(call, (error, value) => {
          expect(error).toBeNull();
          expect(value).toEqual(expectedResponse.getGrpcObject());
          done();
        });
      });
    });
  });
});

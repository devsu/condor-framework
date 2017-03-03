const Proxy = require('./proxy');
const Response = require('./response');
const Mocks = require('../spec/util/mocks');
const Spy = require('../spec/util/spy');

/* eslint max-lines: "off" */
describe('Proxy:', () => {
  let serviceDefinition, proxy, personServiceMock, middlewareMock, middleware, errorHandlerMock,
    errorHandlers, call;

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
        const expectedObject = {'message': 'Listing'};
        personServiceMock.list = Spy.returnValue(expectedObject);
        proxy.list(call, (error, value) => {
          expect(value).toEqual(new Response(expectedObject));
          expect(error).toBeNull();
          done();
        });
      });

      it('should return with a Response instance', (done) => {
        const response = new Response({'message': 'Listing'});
        personServiceMock.list = Spy.returnValue(response);
        proxy.list(call, (error, value) => {
          expect(value instanceof Response).toBeTruthy();
          expect(value).toEqual(response);
          done();
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
            expect(value).toEqual(new Response('result'));
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
  });

  describe('each middleware', () => {
    let expectedResponse, expectedError;

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
          expect(value).toEqual(expectedResponse);
          expect(error).toBeNull();
          done();
        });
      });

      describe('and another middleware changes response', () => {
        it('should return the value', (done) => {
          const expectedResponse2 = new Response('response');
          middlewareMock.globalMiddleware.method.and.callFake((context, next) => {
            return next().then(() => {
              context.send(expectedResponse2);
            });
          });
          middlewareMock.packageMiddleware.method.and.callFake((context) => {
            context.send(expectedResponse);
          });
          proxy.list(call, (error, value) => {
            expect(value).toEqual(expectedResponse2);
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
});

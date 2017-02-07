const Proxy = require('./proxy');
const Mocks = require('../spec/util/mocks');
const Spy = require('../spec/util/spy');
const grpc = require('grpc');

/* eslint max-lines: "off" */
describe('Proxy:', () => {
  let serviceDefinition, proxy, personServiceMock, middlewareMock, middleware, errorHandlerMock,
    errorHandlers, call;

  beforeEach(() => {
    middlewareMock = Mocks.getMiddleware();
    errorHandlerMock = Mocks.getErrorHandler();
    personServiceMock = Mocks.getPersonService();
    serviceDefinition = {
      'protoFilePath': 'spec/protos/person.proto',
      'serviceFullName': 'testapp.PersonService',
      'implementation': personServiceMock,
    };
    middleware = middlewareMock.middleware;
    errorHandlers = errorHandlerMock.errorHandlers;
    proxy = new Proxy(serviceDefinition, middleware, errorHandlers);
    call = {'a': 1, 'metadata': new grpc.Metadata()};
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
    beforeEach(() => {
      personServiceMock.list.and.callFake((call, res) => {
        res.resolve('anything');
      });
    });

    it('should call the corresponding method of the service implementation', (done) => {
      proxy.list(call, () => {
        expect(personServiceMock.list).toHaveBeenCalledTimes(1);
        expect(personServiceMock.list).toHaveBeenCalledWith(call, jasmine.objectContaining({
          'resolve': jasmine.any(Function),
        }));
        done();
      });
    });

    describe('when res.resolve() method is called', () => {
      it('should callback with null and the resolved value', (done) => {
        proxy.list(call, (error, value) => {
          expect(value).toEqual('anything');
          expect(error).toBeNull();
          done();
        });
      });
    });

    describe('when res.reject() method is called', () => {
      it('should callback with the error and undefined', (done) => {
        const expectedError = new Error('error');
        personServiceMock.list.and.callFake((call, res) => {
          res.reject(expectedError);
        });
        proxy.list(call, (error, value) => {
          expect(value).toBeUndefined();
          expect(error).toEqual(expectedError);
          done();
        });
      });
    });

    describe('implementation throws an error', () => {
      it('should callback with error', (done) => {
        const expectedError = new Error('My Internal Server Error');
        personServiceMock.list.and.callFake(() => {
          throw expectedError;
        });
        proxy.list(call, (error, value) => {
          expect(error).toEqual(expectedError);
          expect(value).toBeUndefined();
          done();
        });
      });
    });

    describe('callback is undefined (streams)', () => {
      let stream;

      beforeEach(() => {
        stream = {
          'emit': Spy.create('emit'),
          'end': Spy.create('end'),
        };
      });

      it('should not throw an error', (done) => {
        personServiceMock.list = Spy.returnValue('anything');
        expect(() => {
          proxy.list(stream).then(() => {
            done();
          });
        }).not.toThrowError();
      });

      describe('implementation throws an error', () => {
        let expectedError;

        beforeEach(() => {
          expectedError = new Error('My Internal Server Error');
          personServiceMock.list = Spy.throwError('My Internal Server Error');
        });

        it('should emit the error', (done) => {
          proxy.list(stream).then(() => {
            expect(stream.emit).toHaveBeenCalledTimes(1);
            expect(stream.emit).toHaveBeenCalledWith('error', expectedError);
            done();
          });
        });

        it('should end the stream', (done) => {
          proxy.list(stream).then(() => {
            expect(stream.end).toHaveBeenCalledTimes(1);
            done();
          });
        });
      });
    });
  });
});

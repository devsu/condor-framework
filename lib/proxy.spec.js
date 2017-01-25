const Proxy = require('./proxy');
const Mocks = require('../spec/util/mocks');
const Spy = require('../spec/util/spy');
const Promise = require('bluebird');

/* eslint max-lines: "off" */
describe('Proxy:', () => {
  let serviceDefinition, proxy, personServiceMock, middlewareMock, middleware, errorHandlerMock,
    errorHandlers, call, callback;

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
    call = {'a': 1};
    callback = Spy.create('callback');
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

  describe('each method', () => {
    it('should call the corresponding method of the service implementation', (done) => {
      proxy.list(call, (error, value) => {
        expect(personServiceMock.list).toHaveBeenCalledTimes(1);
        expect(personServiceMock.list).toHaveBeenCalledWith(call);
        expect(value).not.toBeNull();
        expect(error).toBeNull();
        done();
      });
    });

    describe('implementation method does not return a promise', () => {
      it('should callback with the result', (done) => {
        personServiceMock.list = Spy.returnValue('anything');
        proxy.list(call, (error, value) => {
          expect(value).toEqual('anything');
          expect(error).toBeNull();
          done();
        });
      });
    });

    describe('implementation method returns a promise', () => {
      describe('resolve', () => {
        it('should wait for the promise and callback with the result', (done) => {
          personServiceMock.list = Spy.resolve('anything');
          proxy.list(call, (error, value) => {
            expect(value).toEqual('anything');
            expect(error).toBeNull();
            done();
          });
        });
      });

      describe('reject', () => {
        it('should wait for the promise and callback with the error', (done) => {
          const expectedError = {
            'code': 101,
            'details': 'whatever',
          };
          personServiceMock.list = Spy.reject(expectedError);
          proxy.list(call, (error) => {
            expect(error).toEqual(expectedError);
            done();
          });
        });
      });
    });

    describe('implementation method returns a Bluebird promise', () => {
      it('should wait for the promise and callback with the result', (done) => {
        personServiceMock.list = Spy.returnValue(Promise.resolve('anything'));
        proxy.list(call, (error, value) => {
          expect(value).toEqual('anything');
          expect(error).toBeNull();
          done();
        });
      });
    });

    describe('implementation throws an error', () => {
      it('should callback with error', (done) => {
        const expectedError = new Error('My Internal Server Error');
        personServiceMock.list = Spy.throwError('My Internal Server Error');
        proxy.list(call, (error) => {
          expect(error).toEqual(expectedError);
          done();
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
        it('should call the error', (done) => {
          const expectedError = new Error('My Internal Server Error');
          personServiceMock.list = Spy.throwError('My Internal Server Error');
          proxy.list(stream).then(() => {
            expect(stream.emit).toHaveBeenCalledTimes(1);
            expect(stream.emit).toHaveBeenCalledWith('error', expectedError);
            done();
          });
        });
      });
    });

    it('should call all global middleware methods', (done) => {
      proxy.list(call, (error) => {
        expect(middlewareMock.globalMiddleware.method).toHaveBeenCalledTimes(1);
        expect(middlewareMock.globalMiddleware.method).toHaveBeenCalledWith(call);
        expect(error).toBeNull();
        done();
      });
    });

    it('should call all the corresponding package middleware methods', (done) => {
      proxy.list(call, (error) => {
        expect(middlewareMock.packageMiddleware.method).toHaveBeenCalledTimes(1);
        expect(middlewareMock.packageMiddleware.method).toHaveBeenCalledWith(call);
        expect(error).toBeNull();
        done();
      });
    });

    it('should call all the corresponding service middleware methods', (done) => {
      proxy.list(call, (error) => {
        expect(middlewareMock.serviceMiddleware.method).toHaveBeenCalledTimes(1);
        expect(middlewareMock.serviceMiddleware.method).toHaveBeenCalledWith(call);
        expect(error).toBeNull();
        done();
      });
    });

    it('should call all the corresponding method middleware methods', (done) => {
      proxy.list(call, (error) => {
        expect(middlewareMock.methodMiddleware.method).toHaveBeenCalledTimes(1);
        expect(middlewareMock.methodMiddleware.method).toHaveBeenCalledWith(call);
        expect(error).toBeNull();
        done();
      });
    });

    it('should not call middleware methods of other packages', (done) => {
      proxy.list(call, (error) => {
        expect(middlewareMock.packageMiddleware2.method).not.toHaveBeenCalled();
        expect(middlewareMock.packageMiddleware3.method).not.toHaveBeenCalled();
        expect(error).toBeNull();
        done();
      });
    });

    it('should not call middleware methods of other services', (done) => {
      proxy.list(call, (error) => {
        expect(middlewareMock.serviceMiddleware2.method).not.toHaveBeenCalled();
        expect(error).toBeNull();
        done();
      });
    });

    it('should not call middleware methods of other methods', (done) => {
      proxy.list(call, (error) => {
        expect(middlewareMock.methodMiddleware2.method).not.toHaveBeenCalled();
        expect(error).toBeNull();
        done();
      });
    });
  });

  describe('middleware', () => {
    it('should be called before the implementation', () => {
      middlewareMock.globalMiddleware.method.and.callFake(() => {
        expect(personServiceMock.list).not.toHaveBeenCalled();
      });
      middlewareMock.packageMiddleware.method.and.callFake(() => {
        expect(personServiceMock.list).not.toHaveBeenCalled();
      });
      proxy.list(call, callback);
    });

    it('should be called in order', () => {
      middlewareMock.globalMiddleware.method.and.callFake(() => {
        expect(middlewareMock.packageMiddleware.method).not.toHaveBeenCalled();
      });
      proxy.list(call, callback);
    });

    describe('when call object is modified by a middleware', () => {
      it('should pass the modified call to the next middleware', (done) => {
        middlewareMock.globalMiddleware.method = (call) => {
          call.modified = true;
        };
        proxy.list(call, (error) => {
          expect(middlewareMock.packageMiddleware.method.calls.argsFor(0)[0].modified)
            .toEqual(true);
          expect(error).toBeNull();
          done();
        });
      });

      it('should pass the modified call to the implementation', (done) => {
        middlewareMock.globalMiddleware.method = (call) => {
          call.modified = true;
        };
        proxy.list(call, (error) => {
          expect(personServiceMock.list.calls.argsFor(0)[0].modified).toEqual(true);
          expect(error).toBeNull();
          done();
        });
      });
    });

    describe('when call metadata is modified by a middleware', () => {
      it('should pass the modified call to the implementation', (done) => {
        middlewareMock.globalMiddleware.method = (call) => {
          call.metadata = {'data': true};
        };
        proxy.list(call, (error) => {
          expect(personServiceMock.list.calls.argsFor(0)[0].metadata.data)
            .toEqual(true);
          expect(error).toBeNull();
          done();
        });
      });
    });

    describe('returns nothing (undefined)', () => {
      it('should wait to continue to the next middleware', (done) => {
        middlewareMock.globalMiddleware.method = Spy.returnValue();
        proxy.list(call, (error) => {
          expect(middlewareMock.packageMiddleware.method).toHaveBeenCalledTimes(1);
          expect(error).toBeNull();
          done();
        });
      });

      it('should wait to continue to the implementation', (done) => {
        middlewareMock.packageMiddleware.method = Spy.returnValue();
        proxy.list(call, (error) => {
          expect(personServiceMock.list).toHaveBeenCalledTimes(1);
          expect(error).toBeNull();
          done();
        });
      });
    });

    describe('returns a value', () => {
      it('should stop the middleware chain', (done) => {
        middlewareMock.globalMiddleware.method = Spy.returnValue('value');
        proxy.list(call, () => {
          expect(middlewareMock.packageMiddleware.method).not.toHaveBeenCalled();
          done();
        });
      });
      it('the implementation should not be called', (done) => {
        middlewareMock.globalMiddleware.method = Spy.returnValue('value');
        proxy.list(call, () => {
          expect(personServiceMock.list).not.toHaveBeenCalled();
          done();
        });
      });
    });

    describe('returns a promise', () => {
      describe('that resolves', () => {
        describe('with nothing', () => {
          it('should wait to continue to the next middleware', (done) => {
            const promise = new Promise((resolve) => {
              process.nextTick(() => {
                resolve();
              });
            });
            middlewareMock.globalMiddleware.method = Spy.returnValue(promise);
            proxy.list(call, (error) => {
              expect(middlewareMock.packageMiddleware.method).toHaveBeenCalledTimes(1);
              expect(error).toBeNull();
              done();
            });
          });

          it('should wait to continue to the implementation', (done) => {
            const promise = new Promise((resolve) => {
              expect(personServiceMock.list).not.toHaveBeenCalled();
              resolve();
            });
            middlewareMock.packageMiddleware.method = Spy.returnValue(promise);
            proxy.list(call, (error) => {
              expect(personServiceMock.list).toHaveBeenCalledTimes(1);
              expect(error).toBeNull();
              done();
            });
          });
        });
        describe('with a value', () => {
          it('should stop the middleware chain', (done) => {
            const promise = new Promise((resolve) => {
              resolve('do not continue with middleware');
            });
            middlewareMock.globalMiddleware.method = Spy.returnValue(promise);
            proxy.list(call, () => {
              expect(middlewareMock.packageMiddleware.method).not.toHaveBeenCalled();
              done();
            });
          });

          it('the implementation should not be called', (done) => {
            const promise = new Promise((resolve) => {
              resolve('do not continue with middleware');
            });
            middlewareMock.globalMiddleware.method = Spy.returnValue(promise);
            proxy.list(call, () => {
              expect(personServiceMock.list).not.toHaveBeenCalled();
              done();
            });
          });
        });
      });
      describe('that rejects', () => {
        describe('with nothing', () => {
          it('should callback with error', (done) => {
            const promise = new Promise((resolve, reject) => {
              reject();
            });
            const defaultError = new Error('Undefined error');
            middlewareMock.globalMiddleware.method = Spy.returnValue(promise);
            proxy.list(call, (error) => {
              expect(error).toEqual(defaultError);
              done();
            });
          });
        });
        describe('with an error', () => {
          it('should callback with an specific error', (done) => {
            const promise = new Promise((resolve, reject) => {
              reject('error');
            });
            const expectedError = 'error';
            middlewareMock.globalMiddleware.method = Spy.returnValue(promise);
            proxy.list(call, (error) => {
              expect(error).toEqual(expectedError);
              done();
            });
          });
        });
        it('should stop the middleware chain', (done) => {
          const expectedError = 'do not continue with middleware';
          const promise = new Promise((resolve, reject) => {
            reject('do not continue with middleware');
          });
          middlewareMock.globalMiddleware.method = Spy.returnValue(promise);
          proxy.list(call, (error) => {
            expect(middlewareMock.packageMiddleware.method).not.toHaveBeenCalled();
            expect(personServiceMock.list).not.toHaveBeenCalled();
            expect(error).toEqual(expectedError);
            done();
          });
        });
      });
    });

    describe('throws an error', () => {
      it('should callback with error', (done) => {
        const expectedError = new Error('error');
        middlewareMock.globalMiddleware.method = Spy.throwError('error');
        proxy.list(call, (error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });
    });
  });

  describe('error handlers', () => {
    beforeEach(() => {
      call = {'a': 1};
      personServiceMock.list = Spy.throwError('error');
    });

    describe('when implementation throws an error', () => {
      it('should call the error handler', (done) => {
        proxy.list(call, () => {
          expect(errorHandlerMock.globalErrorHandler.method).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('when middleware throws an error', () => {
      beforeEach(() => {
        middlewareMock.globalMiddleware.method = Spy.throwError('error');
      });

      it('should call the error handler', (done) => {
        proxy.list(call, () => {
          expect(errorHandlerMock.globalErrorHandler.method).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should not call next middleware', (done) => {
        proxy.list(call, () => {
          expect(middlewareMock.packageMiddleware.method).not.toHaveBeenCalled();
          expect(middlewareMock.serviceMiddleware.method).not.toHaveBeenCalled();
          expect(middlewareMock.methodMiddleware.method).not.toHaveBeenCalled();
          done();
        });
      });

      it('should not call implementation', (done) => {
        proxy.list(call, () => {
          expect(personServiceMock.list).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it('should call all global error handlers', (done) => {
      const expectedError = new Error('error');
      proxy.list(call, (error) => {
        expect(errorHandlerMock.globalErrorHandler.method).toHaveBeenCalledTimes(1);
        expect(errorHandlerMock.globalErrorHandler.method)
          .toHaveBeenCalledWith(expectedError, call);
        expect(error).toEqual(expectedError);
        done();
      });
    });

    it('should call all the corresponding package error handler methods', (done) => {
      const expectedError = new Error('error');
      proxy.list(call, (error) => {
        expect(errorHandlerMock.packageErrorHandler.method).toHaveBeenCalledTimes(1);
        expect(errorHandlerMock.packageErrorHandler.method)
          .toHaveBeenCalledWith(expectedError, call);
        expect(error).toEqual(expectedError);
        done();
      });
    });

    it('should call all the corresponding service error handler methods', (done) => {
      const expectedError = new Error('error');
      proxy.list(call, (error) => {
        expect(errorHandlerMock.serviceErrorHandler.method).toHaveBeenCalledTimes(1);
        expect(errorHandlerMock.serviceErrorHandler.method)
          .toHaveBeenCalledWith(expectedError, call);
        expect(error).toEqual(expectedError);
        done();
      });
    });

    it('should call all the corresponding error handler methods', (done) => {
      const expectedError = new Error('error');
      proxy.list(call, (error) => {
        expect(errorHandlerMock.methodErrorHandler.method).toHaveBeenCalledTimes(1);
        expect(errorHandlerMock.methodErrorHandler.method)
          .toHaveBeenCalledWith(expectedError, call);
        expect(error).toEqual(expectedError);
        done();
      });
    });

    it('should not call error handler methods of other packages', (done) => {
      proxy.list(call, () => {
        expect(errorHandlerMock.packageErrorHandler2.method).not.toHaveBeenCalled();
        expect(errorHandlerMock.packageErrorHandler3.method).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not call error handler methods of other services', (done) => {
      proxy.list(call, () => {
        expect(errorHandlerMock.serviceErrorHandler2.method).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not call error handler methods of other methods', (done) => {
      proxy.list(call, () => {
        expect(errorHandlerMock.methodErrorHandler2.method).not.toHaveBeenCalled();
        done();
      });
    });

    describe('when error object is modified by an error handler', () => {
      let expectedError;
      beforeEach(() => {
        errorHandlerMock.globalErrorHandler.method = (error) => {
          error.modified = true;
        };
        expectedError = jasmine.objectContaining({
          'modified': true,
        });
      });

      it('should pass the modified error to the next error handler', (done) => {
        proxy.list(call, () => {
          expect(errorHandlerMock.packageErrorHandler.method)
            .toHaveBeenCalledWith(expectedError, call);
          done();
        });
      });

      it('should pass the modified error to the callback', (done) => {
        proxy.list(call, (error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });
    });

    it('should be called in order', (done) => {
      errorHandlerMock.globalErrorHandler.method.and.callFake(() => {
        expect(errorHandlerMock.packageErrorHandler.method).not.toHaveBeenCalled();
      });
      proxy.list(call, () => {
        expect(errorHandlerMock.packageErrorHandler.method).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('when error handler returns a promise', () => {
      describe('resolve', () => {
        it('should wait before continuing to the next error handler', (done) => {
          errorHandlerMock.globalErrorHandler.method = () => {
            return new Promise((resolve) => {
              process.nextTick(() => {
                expect(errorHandlerMock.packageErrorHandler.method).not.toHaveBeenCalled();
                resolve();
              });
            });
          };
          proxy.list(call, () => {
            expect(errorHandlerMock.packageErrorHandler.method).toHaveBeenCalledTimes(1);
            done();
          });
        });
      });
    });

    describe('returns nothing (undefined)', () => {
      it('should wait to continue to the next error handler', (done) => {
        errorHandlerMock.globalErrorHandler.method = Spy.returnValue();
        proxy.list(call, () => {
          expect(errorHandlerMock.packageErrorHandler.method).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('returns a value', () => {
      it('should stop the error handler chain', (done) => {
        errorHandlerMock.globalErrorHandler.method = Spy.returnValue('value');
        proxy.list(call, () => {
          expect(errorHandlerMock.packageErrorHandler.method).not.toHaveBeenCalled();
          done();
        });
      });
      it('should callback with the result', (done) => {
        personServiceMock.list = Spy.throwError();
        errorHandlerMock.globalErrorHandler.method = Spy.returnValue('value');
        proxy.list(call, (error, result) => {
          expect(error).toBeNull();
          expect(result).toEqual('value');
          done();
        });
      });
    });

    describe('returns a promise', () => {
      describe('that resolves', () => {
        describe('with nothing', () => {
          it('should wait to continue to the next error handler', (done) => {
            const promise = new Promise((resolve) => {
              process.nextTick(() => {
                resolve();
              });
            });
            errorHandlerMock.globalErrorHandler.method = Spy.returnValue(promise);
            proxy.list(call, () => {
              expect(errorHandlerMock.packageErrorHandler.method).toHaveBeenCalledTimes(1);
              done();
            });
          });
        });
        describe('with a value', () => {
          it('should stop the middleware chain', (done) => {
            const promise = new Promise((resolve) => {
              resolve('do not continue with middleware');
            });
            errorHandlerMock.globalErrorHandler.method = Spy.returnValue(promise);
            proxy.list(call, () => {
              expect(errorHandlerMock.packageErrorHandler.method).not.toHaveBeenCalled();
              done();
            });
          });
        });
      });
      describe('that rejects', () => {
        describe('with nothing', () => {
          it('should callback with error', (done) => {
            const promise = new Promise((resolve, reject) => {
              reject();
            });
            const defaultError = new Error('Undefined error');
            errorHandlerMock.globalErrorHandler.method = Spy.returnValue(promise);
            proxy.list(call, (error) => {
              expect(error).toEqual(defaultError);
              done();
            });
          });
        });
        describe('with an error', () => {
          it('should callback with an specific error', (done) => {
            const promise = new Promise((resolve, reject) => {
              reject('error');
            });
            const expectedError = 'error';
            middlewareMock.globalMiddleware.method = Spy.returnValue(promise);
            proxy.list(call, (error) => {
              expect(error).toEqual(expectedError);
              done();
            });
          });
        });
      });
    });

    describe('throws an error', () => {
      it('should callback with error', (done) => {
        const expectedError = new Error('error');
        errorHandlerMock.globalErrorHandler.method = Spy.throwError('error');
        proxy.list(call, (error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });
      it('should stop the middleware chain', (done) => {
        const promise = new Promise((resolve) => {
          resolve('do not continue with middleware');
        });
        errorHandlerMock.globalErrorHandler.method = Spy.returnValue(promise);
        proxy.list(call, () => {
          expect(errorHandlerMock.packageErrorHandler.method).not.toHaveBeenCalled();
          done();
        });
      });
    });
  });
});

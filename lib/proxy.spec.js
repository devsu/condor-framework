const Proxy = require('./proxy');
const Mocks = require('../spec/util/mocks');
const Spy = require('../spec/util/spy');
const Promise = require('bluebird');

/* eslint max-lines: "off" */
describe('Proxy:', () => {
  let serviceDefinition, proxy, personServiceMock, middleware, globalMiddleware, packageMiddleware,
    serviceMiddleware, methodMiddleware, packageMiddleware2, packageMiddleware3,
    serviceMiddleware2, methodMiddleware2;

  beforeEach(() => {
    personServiceMock = Mocks.getPersonService();
    serviceDefinition = {
      'protoFilePath': 'path',
      'serviceFullName': 'testapp.PersonService',
      'implementation': personServiceMock,
    };
    globalMiddleware = {'scope': '*', 'method': Spy.create()};
    packageMiddleware = {'scope': 'testapp', 'method': Spy.create()};
    packageMiddleware2 = {'scope': 'greeter', 'method': Spy.create()};
    packageMiddleware3 = {'scope': 'PersonService', 'method': Spy.create()};
    serviceMiddleware = {'scope': 'testapp.PersonService', 'method': Spy.create()};
    serviceMiddleware2 = {'scope': 'testapp.GreeterService', 'method': Spy.create()};
    methodMiddleware = {'scope': 'testapp.PersonService.list', 'method': Spy.create()};
    methodMiddleware2 = {'scope': 'testapp.PersonService.get', 'method': Spy.create()};
    middleware = [
      globalMiddleware, packageMiddleware, packageMiddleware2, packageMiddleware3,
      serviceMiddleware, serviceMiddleware2, methodMiddleware, methodMiddleware2,
    ];
    proxy = new Proxy(serviceDefinition, middleware);
  });

  it('should return an object', () => {
    expect(proxy instanceof Proxy).toBeFalsy();
    expect(proxy instanceof Object).toBeTruthy();
  });

  it('should have a method for each method in the implementation class', () => {
    expect(Object.getOwnPropertyNames(proxy).length).toEqual(2);
    expect(proxy.list).toEqual(jasmine.any(Function));
    expect(proxy.get).toEqual(jasmine.any(Function));

    const greeterServiceMock = Mocks.getGreeterService();
    const greeterServiceDefinition = {
      'protoFilePath': 'path',
      'serviceFullName': 'testapp.GreeterService',
      'implementation': greeterServiceMock,
    };
    proxy = new Proxy(greeterServiceDefinition);
    expect(Object.getOwnPropertyNames(proxy).length).toEqual(2);
    expect(proxy.sayHello).toEqual(jasmine.any(Function));
    expect(proxy.sayGoodbye).toEqual(jasmine.any(Function));
  });

  describe('each method', () => {
    let call, callback;

    beforeEach(() => {
      call = {'a': 1};
      callback = Spy.create('callback');
    });

    it('should call the corresponding method of the service implementation', (done) => {
      proxy.list(call, callback);
      setTimeout(() => {
        expect(personServiceMock.list).toHaveBeenCalledTimes(1);
        expect(personServiceMock.list).toHaveBeenCalledWith(call);
        done();
      }, 1);
    });

    describe('implementation method does not return a promise', () => {
      it('should callback with the result', (done) => {
        personServiceMock.list = Spy.returnValue('anything');
        const list = Promise.promisify(proxy.list);
        list(call).then((value) => {
          expect(value).toEqual('anything');
          done();
        });
      });
    });

    describe('implementation method returns a promise', () => {
      describe('resolve', () => {
        it('should wait for the promise and callback with the result', (done) => {
          const list = Promise.promisify(proxy.list);
          personServiceMock.list = Spy.resolve('anything');
          list(call).then((value) => {
            expect(value).toEqual('anything');
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
          const list = Promise.promisify(proxy.list);
          personServiceMock.list = Spy.reject(expectedError);
          list(call).catch((error) => {
            expect(error).toEqual(expectedError);
            done();
          });
        });
      });
    });

    describe('implementation method returns a Bluebird promise', () => {
      it('should wait for the promise and callback with the result', (done) => {
        personServiceMock.list = Spy.returnValue(Promise.resolve('anything'));
        const list = Promise.promisify(proxy.list);
        list(call).then((value) => {
          expect(value).toEqual('anything');
          done();
        });
      });
    });

    describe('implementation throws an error', () => {
      it('should callback with error', (done) => {
        const expectedError = new Error('My Internal Server Error');
        const list = Promise.promisify(proxy.list);
        personServiceMock.list = Spy.throwError('My Internal Server Error');
        list(call).catch((error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });
    });

    it('should call all global middleware methods', (done) => {
      const list = Promise.promisify(proxy.list);
      list(call).then(() => {
        expect(globalMiddleware.method).toHaveBeenCalledTimes(1);
        expect(globalMiddleware.method).toHaveBeenCalledWith(call);
        done();
      });
    });

    it('should call all the corresponding package middleware methods', (done) => {
      const list = Promise.promisify(proxy.list);
      list(call).then(() => {
        expect(packageMiddleware.method).toHaveBeenCalledTimes(1);
        expect(packageMiddleware.method).toHaveBeenCalledWith(call);
        done();
      });
    });

    it('should call all the corresponding service middleware methods', (done) => {
      const list = Promise.promisify(proxy.list);
      list(call).then(() => {
        expect(serviceMiddleware.method).toHaveBeenCalledTimes(1);
        expect(serviceMiddleware.method).toHaveBeenCalledWith(call);
        done();
      });
    });

    it('should call all the corresponding method middleware methods', (done) => {
      const list = Promise.promisify(proxy.list);
      list(call).then(() => {
        expect(methodMiddleware.method).toHaveBeenCalledTimes(1);
        expect(methodMiddleware.method).toHaveBeenCalledWith(call);
        done();
      });
    });

    it('should not call middleware methods of other packages', (done) => {
      const list = Promise.promisify(proxy.list);
      list(call).then(() => {
        expect(packageMiddleware2.method).not.toHaveBeenCalled();
        expect(packageMiddleware3.method).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not call middleware methods of other services', (done) => {
      const list = Promise.promisify(proxy.list);
      list(call).then(() => {
        expect(serviceMiddleware2.method).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not call middleware methods of other methods', (done) => {
      const list = Promise.promisify(proxy.list);
      list(call).then(() => {
        expect(methodMiddleware2.method).not.toHaveBeenCalled();
        done();
      });
    });

    describe('each middleware', () => {
      it('should be called before the implementation', () => {
        middleware = [globalMiddleware, packageMiddleware];
        globalMiddleware.method.and.callFake(() => {
          expect(personServiceMock.list).not.toHaveBeenCalled();
        });
        packageMiddleware.method.and.callFake(() => {
          expect(personServiceMock.list).not.toHaveBeenCalled();
        });
        proxy.list(call, callback);
      });

      it('should be called in order', () => {
        middleware = [globalMiddleware, packageMiddleware];
        globalMiddleware.method.and.callFake(() => {
          expect(packageMiddleware.method).not.toHaveBeenCalled();
        });
        proxy.list(call, callback);
      });

      describe('when call object is modified by a middleware', () => {
        it('should pass the modified call to the next middleware', (done) => {
          const list = Promise.promisify(proxy.list);
          globalMiddleware.method = (call) => {
            call.modified = true;
          };
          middleware = [globalMiddleware, packageMiddleware];
          list(call).then(() => {
            expect(packageMiddleware.method.calls.argsFor(0)[0].modified).toEqual(true);
            done();
          });
        });

        it('should pass the modified call to the implementation', (done) => {
          const list = Promise.promisify(proxy.list);
          globalMiddleware.method = (call) => {
            call.modified = true;
          };
          middleware = [globalMiddleware, packageMiddleware];
          list(call).then(() => {
            expect(personServiceMock.list.calls.argsFor(0)[0].modified).toEqual(true);
            done();
          });
        });
      });

      describe('when middleware method does not return a promise', () => {
        it('should call the next middleware', (done) => {
          middleware = [globalMiddleware, packageMiddleware];
          const list = Promise.promisify(proxy.list);
          globalMiddleware.method = Spy.returnValue('anything');
          list(call).then(() => {
            expect(packageMiddleware.method).toHaveBeenCalledTimes(1);
            done();
          });
        });
      });

      describe('when middleware method returns a promise', () => {
        describe('resolve', () => {
          it('should wait to continue to the next middleware', (done) => {
            middleware = [globalMiddleware, packageMiddleware];
            const list = Promise.promisify(proxy.list);
            const promise = new Promise((resolve) => {
              process.nextTick(() => {
                expect(packageMiddleware.method).not.toHaveBeenCalled();
                resolve();
              });
            });
            list(call).then(() => {
              expect(packageMiddleware.method).toHaveBeenCalledTimes(1);
              done();
            });
            globalMiddleware.method = Spy.returnValue(promise);
          });

          it('should wait to continue to the implementation', (done) => {
            middleware = [globalMiddleware, packageMiddleware];
            const list = Promise.promisify(proxy.list);
            const promise = new Promise((resolve) => {
              process.nextTick(() => {
                expect(personServiceMock.list).not.toHaveBeenCalled();
                resolve();
              });
            });
            list(call).then(() => {
              expect(personServiceMock.list).toHaveBeenCalledTimes(1);
              done();
            });
            packageMiddleware.method = Spy.returnValue(promise);
          });
        });

        describe('reject', () => {
          it('should stop the middleware chain', (done) => {
            middleware = [globalMiddleware, packageMiddleware];
            const promise = new Promise((resolve, reject) => {
              reject();
            });
            const list = Promise.promisify(proxy.list);
            globalMiddleware.method = Spy.returnValue(promise);
            list(call).then(() => {
              expect(packageMiddleware.method).not.toHaveBeenCalled();
              expect(personServiceMock.list).not.toHaveBeenCalled();
              done();
            });
          });

          it('should callback with error', (done) => {
            middleware = [globalMiddleware, packageMiddleware];
            const promise = new Promise((resolve, reject) => {
              reject('error');
            });
            const expectedError = new Error('error');
            const list = Promise.promisify(proxy.list);
            globalMiddleware.method = Spy.returnValue(promise);
            list(call).catch((error) => {
              expect(error).toEqual(expectedError);
              done();
            });
          });
        });
      });

      describe('when middleware throws an error', () => {
        it('should callback with error', (done) => {
          middleware = [globalMiddleware, packageMiddleware];
          const list = Promise.promisify(proxy.list);
          const expectedError = new Error('error');
          globalMiddleware.method = Spy.throwError('error');
          list(call).catch((error) => {
            expect(error).toEqual(expectedError);
            done();
          });
        });
      });
    });
  });
});

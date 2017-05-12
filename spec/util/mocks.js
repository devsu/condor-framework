const Spy = require('./spy');

class PersonServiceMock {
  list() {} // eslint-disable-line
  get() {} // eslint-disable-line
  delete() {} // eslint-disable-line
}

class GreeterServiceMock {
  sayHello() {} // eslint-disable-line
  sayGoodbye() {} // eslint-disable-line
}

class GreeterSubclassServiceMock extends GreeterServiceMock {
  sayGoodDay() {} // eslint-disable-line
  sayGoodNight() {} // eslint-disable-line
}

class GreeterSubSubclassServiceMock extends GreeterSubclassServiceMock {}

class MiddlewareMock {
  constructor() {
    this.globalMiddleware = {'scope': '*', 'method': Spy.callFake(middleware)};
    this.packageMiddleware = {'scope': 'testapp', 'method': Spy.callFake(middleware)};
    this.packageMiddleware2 = {'scope': 'greeter', 'method': Spy.callFake(middleware)};
    this.packageMiddleware3 = {'scope': 'PersonService', 'method': Spy.callFake(middleware)};
    this.serviceMiddleware = {'scope': 'testapp.PersonService', 'method': Spy.callFake(middleware)};
    this.serviceMiddleware2 = {'scope': 'testapp.GreeterService',
      'method': Spy.callFake(middleware)};
    this.methodMiddleware = {'scope': 'testapp.PersonService.list',
      'method': Spy.callFake(middleware)};
    this.methodMiddleware2 = {'scope': 'testapp.PersonService.get',
      'method': Spy.callFake(middleware)};
    this.middleware = [
      this.globalMiddleware, this.packageMiddleware, this.packageMiddleware2,
      this.packageMiddleware3, this.serviceMiddleware, this.serviceMiddleware2,
      this.methodMiddleware, this.methodMiddleware2,
    ];
  }
}

class ErrorHandlerMock {
  constructor() {
    this.globalErrorHandler = {'scope': '*', 'method': Spy.callFake(errorHandler)};
    this.packageErrorHandler = {'scope': 'testapp', 'method': Spy.callFake(errorHandler)};
    this.packageErrorHandler2 = {'scope': 'greeter', 'method': Spy.callFake(errorHandler)};
    this.packageErrorHandler3 = {'scope': 'PersonService',
      'method': Spy.callFake(errorHandler)};
    this.serviceErrorHandler = {'scope': 'testapp.PersonService',
      'method': Spy.callFake(errorHandler)};
    this.serviceErrorHandler2 = {'scope': 'testapp.GreeterService',
      'method': Spy.callFake(errorHandler)};
    this.methodErrorHandler = {'scope': 'testapp.PersonService.list',
      'method': Spy.callFake(errorHandler)};
    this.methodErrorHandler2 = {'scope': 'testapp.PersonService.get',
      'method': Spy.callFake(errorHandler)};
    this.errorHandlers = [
      this.globalErrorHandler, this.packageErrorHandler, this.packageErrorHandler2,
      this.packageErrorHandler3, this.serviceErrorHandler, this.serviceErrorHandler2,
      this.methodErrorHandler, this.methodErrorHandler2,
    ];
  }
}

module.exports = class Mocks {
  static getServer() {
    return {
      'addService': Spy.create('addService'),
      'bind': Spy.create('bind'),
      'start': Spy.create('start'),
      'started': true,
      'tryShutdown': Spy.create('tryShutdown').and.callFake((callback) => {
        callback();
      }),
      'forceShutdown': Spy.create('forceShutdown'),
    };
  }

  static getGrpc(serverMock) {
    return {
      'load': (filePath) => {
        if (filePath === 'spec/protos/person.proto') {
          return {
            'testapp': {
              'PersonService': {
                'service': {'a': 1},
              },
            },
          };
        }
        return {
          'testapp': {
            'greeter': {
              'GreeterService': {
                'service': {'a': 2},
              },
            },
          },
        };
      },
      'Server': Spy.returnValue(serverMock),
    };
  }

  static getPersonService() {
    const personServiceMock = new PersonServiceMock();
    spyOn(personServiceMock, 'list');
    spyOn(personServiceMock, 'get');
    spyOn(personServiceMock, 'delete');
    return personServiceMock;
  }

  static getGreeterService() {
    const greeterServiceMock = new GreeterServiceMock();
    spyOn(greeterServiceMock, 'sayHello');
    spyOn(greeterServiceMock, 'sayGoodbye');
    return greeterServiceMock;
  }

  static getGreeterSubSubclass() {
    return new GreeterSubSubclassServiceMock();
  }

  static getMiddleware() {
    return new MiddlewareMock();
  }

  static getErrorHandlers() {
    return new ErrorHandlerMock();
  }
};

function middleware(context, next) {
  return next();
}

function errorHandler(error, context, next) {
  return next(error);
}

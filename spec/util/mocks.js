const Spy = require('./spy');

class PersonServiceMock {
  list() {} // eslint-disable-line
  get() {} // eslint-disable-line
}

class GreeterServiceMock {
  sayHello() {} // eslint-disable-line
  sayGoodbye() {} // eslint-disable-line
}

class MiddlewareMock {
  constructor() {
    this.globalMiddleware = {'scope': '*', 'method': Spy.create()};
    this.packageMiddleware = {'scope': 'testapp', 'method': Spy.create()};
    this.packageMiddleware2 = {'scope': 'greeter', 'method': Spy.create()};
    this.packageMiddleware3 = {'scope': 'PersonService', 'method': Spy.create()};
    this.serviceMiddleware = {'scope': 'testapp.PersonService', 'method': Spy.create()};
    this.serviceMiddleware2 = {'scope': 'testapp.GreeterService', 'method': Spy.create()};
    this.methodMiddleware = {'scope': 'testapp.PersonService.list', 'method': Spy.create()};
    this.methodMiddleware2 = {'scope': 'testapp.PersonService.get', 'method': Spy.create()};
    this.middleware = [
      this.globalMiddleware, this.packageMiddleware, this.packageMiddleware2,
      this.packageMiddleware3, this.serviceMiddleware, this.serviceMiddleware2,
      this.methodMiddleware, this.methodMiddleware2,
    ];
  }
}

class ErrorHandlerMock {
  constructor() {
    this.globalErrorHandler = {'scope': '*', 'method': Spy.create()};
    this.packageErrorHandler = {'scope': 'testapp', 'method': Spy.create()};
    this.packageErrorHandler2 = {'scope': 'greeter', 'method': Spy.create()};
    this.packageErrorHandler3 = {'scope': 'PersonService', 'method': Spy.create()};
    this.serviceErrorHandler = {'scope': 'testapp.PersonService', 'method': Spy.create()};
    this.serviceErrorHandler2 = {'scope': 'testapp.GreeterService', 'method': Spy.create()};
    this.methodErrorHandler = {'scope': 'testapp.PersonService.list', 'method': Spy.create()};
    this.methodErrorHandler2 = {'scope': 'testapp.PersonService.get', 'method': Spy.create()};
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
      'addProtoService': Spy.create('addProtoService'),
      'bind': Spy.create('bind'),
      'start': Spy.create('start'),
    };
  }

  static getGrpc(serverMock) {
    return {
      'load': (filePath) => {
        if (filePath === 'protoFilePath') {
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
    return personServiceMock;
  }

  static getGreeterService() {
    const greeterServiceMock = new GreeterServiceMock();
    spyOn(greeterServiceMock, 'sayHello');
    spyOn(greeterServiceMock, 'sayGoodbye');
    return greeterServiceMock;
  }

  static getMiddleware() {
    return new MiddlewareMock();
  }

  static getErrorHandler() {
    return new ErrorHandlerMock();
  }
};


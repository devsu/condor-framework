const Spy = require('./spy');

class PersonServiceMock {
  list() {} // eslint-disable-line
  get() {} // eslint-disable-line
}

class GreeterServiceMock {
  sayHello() {} // eslint-disable-line
  sayGoodbye() {} // eslint-disable-line
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

};


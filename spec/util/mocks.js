const Spy = require('./spy');

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
      'load': Spy.returnValue({
        'testapp': {
          'PersonService': {
            'service': 'service',
          },
        },
      }),
      'Server': Spy.returnValue(serverMock)
    }
  }

  static getPersonService() {
    let mock = new Function();
    mock.prototype.list = jasmine.createSpy('list');
    mock.prototype.get = jasmine.createSpy('get');
    return mock;
  }
};

const Spy = require('./spy');

module.exports = class GrpcStub {

  constructor(serverStub) {
    this.serverStub = serverStub;
  }

  load() {
    return {
      'testapp': {
        'PersonService': {
          'service': 'service',
        },
      },
    };
  }

  Server() {
    return this.serverStub;
  }
};

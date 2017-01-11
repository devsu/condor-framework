const PersonServiceSpy = require('./person-service-spy');
const Spy = require('./spy');
module.exports = {
  'getServices': function() {
    return [{
      'protoPath': '../spec/protos/person.proto',
      'protoService': 'testapp.PersonService',
      'implementation': new PersonServiceSpy(),
    }];
  },

  'getMiddlewares': function() {
    return [{
      'path': 'testapp',
      'middleware': this.middlewareMock
    }];
  },

  'getOptions': function() {
    return {
      'port': '3000',
      'host': '0.0.0.0',
    };
  },

  'middlewareMock': Spy.resolve(null, 'middleware'),
};


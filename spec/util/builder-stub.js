const PersonServiceSpy = require('./person-service-spy');

module.exports = {
  'getServices': function() {
    return [{
      'protoPath': '../spec/person.proto',
      'protoService': 'testapp.PersonService',
      'implementation': new PersonServiceSpy(),
    }];
  },

  'getMiddlewares': function() {
    return [{
      'path': 'testapp',
      'middleware': function(call) {
        return call;
      },
    }];
  },

  'getOptions': function() {
    return {
      'port': '3000',
    };
  },
};

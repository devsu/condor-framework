const GrpcServer = require('../../lib/grpc-server');
const PersonService = require('./person-service');

module.exports = class {
  constructor() {
    this.app = new GrpcServer();
  }

  run() {
    this.app.registerServices('./spec/person.proto', 'myapp.PersonService', new PersonService());
    this.app.listen(9090);
  }
};

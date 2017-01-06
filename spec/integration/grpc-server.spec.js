const grpc = require('grpc');
const personProto = grpc.load('./spec/person.proto');
const client = new personProto.testapp.PersonService('127.0.0.1:9090', grpc.credentials.createInsecure());
const peopleJson = require('./people.json');
const Server = require('./server');

describe('grpc-server', () => {
  let server;

  beforeAll(() =>{
    server = new Server();
    server.run();
  });

  it('Should work with simple methods', (done) => {
    client.list({}, function (error, people) {
      expect(people).toEqual(peopleJson);
      done();
    });
  });
});

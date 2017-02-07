const grpc = require('grpc');
const fs = require('fs');
const Condor = require('../../lib/condor');
const Repeater = require('./repeater');

describe('ssl certificates', () => {
  let condor, repeaterClient, message;

  beforeAll(() => {
    // start server
    const options = {
      'certChain': 'spec/ssl/server.crt',
      'privateKey': 'spec/ssl/server.key',
    };
    condor = new Condor(options)
      .addService('spec/protos/repeater.proto', 'testapp.repeater.RepeaterService',
        new Repeater())
      .start();

    const sslCreds = grpc.credentials.createSsl(fs.readFileSync('spec/ssl/server.crt'));
    const repeaterProto = grpc.load('spec/protos/repeater.proto');
    repeaterClient = new repeaterProto.testapp.repeater.RepeaterService('localhost:3000',
      sslCreds);
  });

  afterAll((done) => {
    condor.stop().then(() => {
      done();
    });
  });

  it('should use ssl credentials between client/server communication', (done) => {
    repeaterClient.simple(message, (error) => {
      expect(error).toBeNull();
      done();
    });
  });
});

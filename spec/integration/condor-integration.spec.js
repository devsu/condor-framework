const grpc = require('grpc');
const PROTO_PATH = '../person.proto';
const PROTO_PACKAGE = 'testapp';
const PROTO_SERVICE_NAME = `${PROTO_PACKAGE}.PersonService`;
const PersonService = require('./person-service');
const condor = require('../../index');
const options = {
  'port': 3000,
  'creds': grpc.ServerCredentials.createInsecure(),
};

// describe('condor-framework', () => {
//   let builder, server;
//   describe('set server', () => {
//     beforeEach(() => {
//       builder = new condor.Builder();
//       builder.registerService(PROTO_PATH, PROTO_SERVICE_NAME, new PersonService());
//       builder.setOptions(options);
//       server = new condor.Server(builder);
//       server.start();
//     });
//
//     it('', () => {
//
//     });
//   });
// });

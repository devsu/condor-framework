const grpc = require('grpc');
const PROTO_PATH = '../protos/person.proto';
const PROTO_PACKAGE = 'testapp';
const PROTO_SERVICE_NAME = `${PROTO_PACKAGE}.PersonService`;
const PersonService = require('./person-service');
const condor = require('../../index');
const options = {
  'port': 3000,
  'creds': grpc.ServerCredentials.createInsecure(),
};

// describe('condor-framework', () => {
//   let builder, getServer;
//   describe('set getServer', () => {
//     beforeEach(() => {
//       builder = new condor.Builder();
//       builder.registerService(PROTO_PATH, PROTO_SERVICE_NAME, new PersonService());
//       builder.setOptions(options);
//       getServer = new condor.Server(builder);
//       getServer.start();
//     });
//
//     it('', () => {
//
//     });
//   });
// });

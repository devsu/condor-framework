const grpc = require('grpc');
const PROTO_PATH = './spec/person.proto';
const PROTO_PACKAGE = 'testapp';
const PROTO_SERVICE_NAME = `${PROTO_PACKAGE}.PersonService`;
const PersonService = require('./spec/integration/person-service');
const condor = require('./index');
const options = {
  'port': 3000,
  'host': '0.0.0.0',
  'creds': grpc.ServerCredentials.createInsecure(),
};

let builder, server;
builder = new condor.Builder();
builder.registerService(PROTO_PATH, PROTO_SERVICE_NAME, PersonService);
builder.setOptions(options);
server = new condor.Server(builder);
server.start();

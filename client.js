const grpc = require('grpc');
const personProto = grpc.load('./spec/protos/person.proto');
const client =
  new personProto.testapp.PersonService('0.0.0.0:3800', grpc.credentials.createInsecure());

function printResponse(error, response) {
  if (error) {
    console.log('Error: ', error);
    return;
  }
  console.log(response);
}

function listPeople() {
  client.list({}, function(error, people) {
    printResponse(error, people);
  });
}

function insertPerson(id, name, email) {
  // Send metadata
  console.log(id, name, email);
  const person = {
    'id': parseInt(id, 10),
    'name': name,
    'email': email,
  };
  client.insert(person, {}, function(error, empty) {
    printResponse(error, empty);
  });
}

function getPerson(id) {
  client.get({
    'id': parseInt(id, 10),
  }, function(error, person) {
    printResponse(error, person);
  });
}

function deletePerson(id) {
  client.delete({
    'id': parseInt(id, 10),
  }, function(error, empty) {
    printResponse(error, empty);
  });
}

const processName = process.argv.shift();
const scriptName = process.argv.shift();
const command = process.argv.shift();

if (command === 'list') {
  listPeople();
} else if (command === 'insert') {
  insertPerson(process.argv[0], process.argv[1], process.argv[2]);
} else if (command === 'get') {
  getPerson(process.argv[0]);
} else if (command === 'delete') {
  deletePerson(process.argv[0]);
}

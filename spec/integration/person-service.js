const grpc = require('grpc');
const people = require('./people.json');
let peopleStream;

module.exports = class {
  list() {
    return Promise.resolve(people);
  }

  insert(call) {
    people.push(call.request);
    const person = call.request.person;
    if (peopleStream) {
      peopleStream.write(person);
    }
    return Promise.resolve(person);
  }

  get(call) {
    const personFound = people.find((element) => {
      return element.id === call.request.id;
    });

    if (personFound) {
      return Promise.resolve(personFound);
    }

    Promise.reject({
      'code': grpc.status.NOT_FOUND,
      'details': 'Not found',
    });
  }

  delete(call) {
    for (let i = 0; i < people.length; i++) {
      if (people[i].id === call.request.id) {
        people.splice(i, 1);
        return Promise.resolve({});
      }
    }
    Promise.reject({
      'code': grpc.status.NOT_FOUND,
      'details': 'Not found',
    });
  }

  watch(stream) {
    peopleStream = stream;
  }
};

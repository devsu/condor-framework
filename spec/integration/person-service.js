const grpc = require('grpc');
const people = require('./people.json');
let peopleStream;

module.exports = class Person {
  static list() {
    return Promise.resolve(people);
  }

  static insert(call) {
    people.push(call.request);
    const person2 = call.request.person;
    console.log(person, person2, call.request);
    if (peopleStream) {
      peopleStream.write(person2);
    }
    return Promise.resolve(person2);
  }

  static get(call) {
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

  static delete(call) {
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

  static watch(stream) {
    peopleStream = stream;
  }

  static watch2(stream) {
    peopleStream = stream;
  }

  static insertMultiple(stream) {
    peopleStream = stream;
  }


};

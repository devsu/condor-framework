const Condor = require('../../lib/condor');
const grpc = require('grpc');

class Person {
  list() {} // eslint-disable-line

  get() {} // eslint-disable-line
}
class Greeter {
  sayGoodbye() {} // eslint-disable-line

  sayHello(call) {
    const response = {'greeting': call.request.greeting};
    return Promise.resolve(response);
  }
}

class Car {
  list() {
    return [{'id': 1, 'name': 'ford fiesta'}];
  }
}

describe('condor framework', () => {
  let condor;
  beforeAll(() => {
    const options = {
      'host': '127.0.0.1',
      'port': '9999',
    };
    condor = new Condor(options)
      .addService('spec/protos/greeter.proto', 'testapp.greeter.GreeterService', new Greeter())
      .addService('spec/protos/person.proto', 'testapp.PersonService', new Person())
      .addService('spec/protos/car.proto', 'transport.land.CarService', new Car())
      .start();
  });

  it('should receive client request and respond with the same request object', (done) => {
    const greeterProto = grpc.load('spec/protos/greeter.proto');
    const client = new greeterProto.testapp.greeter.GreeterService('127.0.0.1:9999',
      grpc.credentials.createInsecure());
    const greeter = {'greeting': 'hola greeting'};
    client.sayHello(greeter, (error, greeting) => {
      expect(greeting).toEqual(greeter);
      expect(error).toBeNull();
      done();
    });
  });

  afterAll(() => {
    condor.stop();
  });
});


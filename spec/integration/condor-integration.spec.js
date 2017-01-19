const Condor = require('../../lib/condor');
const grpc = require('grpc');


class Person {
  list() {} // eslint-disable-line
  get() {} // eslint-disable-line
}
class Greeter {
  sayGoodbye(call) {} // eslint-disable-line
  sayHello(call) {
    const response = {'greeting': call.request.greeting};
    return Promise.resolve(response);
  }
}

class Car {
  insert(call) {
    const car = call.request;
    if (this._carStream) {
      this._carStream.write(car);
    }
    return Promise.resolve(call.request);
  }

  carLog(stream) {
    this._carStream = stream;
  }

  log(stream) {
    stream.on('data', function(data) {});
    stream.on('end', function() {
      stream.sendMetadata(stream.metadata);
    });
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
    const greeterClient = new greeterProto.testapp.greeter.GreeterService('127.0.0.1:9999',
      grpc.credentials.createInsecure());
    const expectedGreeter = {'greeting': 'hello greeting'};
    greeterClient.sayHello(expectedGreeter, (error, greeterResponse) => {
      expect(greeterResponse).toEqual(expectedGreeter);
      expect(error).toBeNull();
      done();
    });
  });

  it('should receive client object and respond with a stream', (done) => {
    const carProto = grpc.load('spec/protos/car.proto');
    const carClient = new carProto.transport.land.CarService('127.0.0.1:9999',
      grpc.credentials.createInsecure());
    const expectedCar = {'id': 1, 'name': 'mustang'};
    const stream = carClient.carLog(expectedCar);
    stream.on('data', (carResponse) => {
      expect(carResponse).toEqual(expectedCar);
      done();
    });
    carClient.insert(expectedCar, (error, carResponse) => {
      expect(carResponse).toEqual(expectedCar);
      expect(error).toBeNull();
    });
  });

  it('should receive a stream and respond with an object', (done) => {
    const expectedCar = {'id': 1, 'name': 'mustang'};
    const car = new Car();
    car.log = (stream) => {
      stream.on('data', function(data) {
        console.log('steaming');
        expect(data).toEqual(expectedCar);
      });
      stream.on('end', function(data) {
        // expect(data).not.toBeUndefined();
        console.log('data', data);
        done();
      });
    };
    condor = new Condor()
      .addService('spec/protos/car.proto', 'transport.land.CarService', car)
      .start();

    const carProto = grpc.load('spec/protos/car.proto');
    const carClient = new carProto.transport.land.CarService('127.0.0.1:9999',
      grpc.credentials.createInsecure());
    const stream = carClient.log({}, (error, value) => {
      expect(error).toBeNull();
      console.log('value', value, 'value');
    });
    stream.write(expectedCar);
    stream.end();
  });

  afterAll(() => {
    condor.stop();
  });
});


const grpc = require('grpc');
const Condor = require('../../lib/condor');
const Repeater = require('./repeater');
const Car = require('./car');

describe('condor framework', () => {
  let condor, repeaterClient, carClient, message, expectedResponse, count, countErrors;

  beforeAll(() => {
    // start server
    const options = {
      'host': '127.0.0.1',
      'port': '9999',
    };
    condor = new Condor(options)
      .addService('spec/protos/repeater.proto', 'testapp.repeater.RepeaterService', new Repeater())
      .addService('spec/protos/car.proto', 'transport.land.CarService', new Car())
      .addMiddleware('testapp.repeater', () => {
        count++;
      })
      .addMiddleware(() => {
        count++;
      })
      .addErrorHandler(() => {
        countErrors++;
      })
      .addErrorHandler('transport.land.CarService.insert', () => {
        countErrors++;
      })
      .start();

    // start client
    const repeaterProto = grpc.load('spec/protos/repeater.proto');
    repeaterClient = new repeaterProto.testapp.repeater.RepeaterService('127.0.0.1:9999',
      grpc.credentials.createInsecure());

    const carProto = grpc.load('spec/protos/car.proto');
    carClient = new carProto.transport.land.CarService('127.0.0.1:9999',
      grpc.credentials.createInsecure());
  });

  afterAll((done) => {
    condor.stop().then(() => {
      done();
    });
  });

  beforeEach(() => {
    message = {'message': 'Welcome to Ecuador!'};
    expectedResponse = {'message': 'You sent: \'Welcome to Ecuador!\'.'};
  });

  describe('simple call', () => {
    it('should respond with the right message', (done) => {
      repeaterClient.simple(message, (error, response) => {
        expect(error).toBeNull();
        expect(response).toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('stream to server', () => {
    it('should respond with the right message', (done) => {
      const expectedResponse = {
        'message': 'You sent: \'Welcome to Ecuador! Bienvenido a Ecuador! Saludos!\'.',
      };
      const stream = repeaterClient.streamToServer((error, response) => {
        expect(response).toEqual(expectedResponse);
        done();
      });
      stream.write('Welcome to Ecuador! ');
      stream.write('Bienvenido a Ecuador! ');
      stream.write('Saludos!');
      stream.end();
    });
  });

  describe('stream to client', () => {
    it('should respond with the right messages', (done) => {
      const stream = repeaterClient.streamToClient(message);
      let count = 0;
      stream.on('data', (data) => {
        expect(data).toEqual(expectedResponse);
        count++;
      });
      stream.on('end', () => {
        expect(count).toEqual(2);
        done();
      });
    });
  });

  describe('bidirectional stream', () => {
    it('should respond with the right messages', (done) => {
      const expectedResponse1 = {'message': 'You sent: \'Welcome!\'.'};
      const expectedResponse2 = {'message': 'You sent: \'Bienvenido!\'.'};
      const stream = repeaterClient.bidirectionalStream();
      let count = 0;
      stream.on('data', (data) => {
        switch (count) {
          case 0:
            expect(data).toEqual(expectedResponse1);
            break;
          case 1:
            expect(data).toEqual(expectedResponse2);
            break;
          default:
            done.fail();
        }
        count++;
      });
      stream.on('end', () => {
        done();
      });
      stream.write('Welcome!');
      stream.write('Bienvenido!');
      stream.end();
    });
  });

  describe('middleware', () => {
    beforeEach(() => {
      count = 0;
    });

    it('should call middleware added', (done) => {
      repeaterClient.simple(message, (error) => {
        expect(error).toBeNull();
        expect(count).toEqual(2);
        done();
      });
    });
  });

  describe('error handlers', () => {
    beforeEach(() => {
      countErrors = 0;
    });

    it('should call error handlers added', (done) => {
      const expectedError = new Error('Method not implemented yet');
      carClient.insert({'name': 'mustang'}, (error) => {
        expect(error).toEqual(expectedError);
        expect(countErrors).toEqual(2);
        done();
      });
    });
  });
});


const proxyquire = require('proxyquire');
const Builder = require('./builder');
const Mocks = require('../spec/util/mocks');
const Spy = require('../spec/util/spy');

/* eslint no-underscore-dangle: "off" */

describe('Condor:', () => {
  const protoFilePath = 'spec/protos/testapp/person.proto';
  let Condor, condor, emptyMethod, personServiceMock, serverMock, ServerStub,
    serverCount, options;

  beforeEach(() => {
    serverMock = Mocks.getServer();
    serverCount = 0;
    options = {};
    ServerStub = class {
      constructor(builder, opt) {
        serverCount++;
        serverMock.receivedBuilder = builder;
        serverMock.receivedOptions = opt;
        return serverMock;
      }
    };
    Condor = proxyquire('./condor', {'./server': ServerStub});
    condor = new Condor();
    emptyMethod = () => {}; // eslint-disable-line
    personServiceMock = Mocks.getPersonService();
  });

  describe('constructor()', () => {
    it('should return a Condor instance', () => {
      expect(condor instanceof Condor).toBeTruthy();
    });

    it('should create a Builder', () => {
      expect(condor._builder instanceof Builder).toBeTruthy();
    });
  });

  describe('add()', () => {
    beforeEach(() => {
      spyOn(condor._builder, 'add');
    });

    it('should return the instance', () => {
      const instance = condor.add('a', 'b', {});
      expect(instance).toBe(condor);
    });

    it('should call builder.add', () => {
      condor.add('a', 'b', {});
      expect(condor._builder.add).toHaveBeenCalledTimes(1);
      expect(condor._builder.add).toHaveBeenCalledWith('a', 'b', {});
      condor._builder.add.calls.reset();
      condor.add('a', 'b', {}, 'd');
      expect(condor._builder.add).toHaveBeenCalledTimes(1);
      expect(condor._builder.add).toHaveBeenCalledWith('a', 'b', {}, 'd');
    });
  });

  describe('addService()', () => {
    beforeEach(() => {
      spyOn(condor._builder, 'addService');
    });

    it('should return the instance', () => {
      const instance = condor.addService('a', 'b', {});
      expect(instance).toBe(condor);
    });

    it('should call builder.addService', () => {
      condor.addService('a', 'b', {});
      expect(condor._builder.addService).toHaveBeenCalledTimes(1);
      expect(condor._builder.addService).toHaveBeenCalledWith('a', 'b', {});
      condor._builder.addService.calls.reset();
      condor.addService('a', 'b', {}, 'd');
      expect(condor._builder.addService).toHaveBeenCalledTimes(1);
      expect(condor._builder.addService).toHaveBeenCalledWith('a', 'b', {}, 'd');
    });
  });

  describe('addMiddleware()', () => {
    beforeEach(() => {
      spyOn(condor._builder, 'use');
    });

    it('should return the instance', () => {
      const instance = condor.use(emptyMethod);
      expect(instance).toBe(condor);
    });

    it('should call builder.use', () => {
      condor.use(emptyMethod);
      expect(condor._builder.use).toHaveBeenCalledTimes(1);
      expect(condor._builder.use).toHaveBeenCalledWith(emptyMethod);
      condor._builder.use.calls.reset();
      condor.use('a', 'b', {}, 'd');
      expect(condor._builder.use).toHaveBeenCalledTimes(1);
      expect(condor._builder.use).toHaveBeenCalledWith('a', 'b', {}, 'd');
    });
  });

  describe('addErrorHandler()', () => {
    beforeEach(() => {
      spyOn(condor._builder, 'addErrorHandler');
    });

    it('should return the instance', () => {
      const instance = condor.addErrorHandler(emptyMethod);
      expect(instance).toBe(condor);
    });

    it('should call builder.addErrorHandler', () => {
      condor.addErrorHandler(emptyMethod);
      expect(condor._builder.addErrorHandler).toHaveBeenCalledTimes(1);
      expect(condor._builder.addErrorHandler).toHaveBeenCalledWith(emptyMethod);
      condor._builder.addErrorHandler.calls.reset();
      condor.addErrorHandler('a', 'b', {}, 'd');
      expect(condor._builder.addErrorHandler).toHaveBeenCalledTimes(1);
      expect(condor._builder.addErrorHandler).toHaveBeenCalledWith('a', 'b', {}, 'd');
    });
  });

  describe('start()', () => {
    beforeEach(() => {
      condor.addService(protoFilePath, 'testapp.PersonService', personServiceMock);
    });

    it('should have not started', () => {
      expect(condor.hasStarted()).toEqual(false);
    });

    it('should return a Condor instance', () => {
      const instance = condor.start();
      expect(instance).toBe(condor);
    });

    it('should create a new server with the builder and options, and start it', () => {
      condor.start();
      expect(serverCount).toEqual(1);
      expect(serverMock.start).toHaveBeenCalledTimes(1);
      expect(serverMock.start).toHaveBeenCalledWith();
    });
  });

  describe('when options are passed', () => {
    describe('options.listen is passed', () => {
      beforeEach(() => {
        options = {
          'listen': '127.0.0.1:9090',
          'creds': 'Credentials',
        };
        condor = new Condor(options)
          .addService(protoFilePath, 'testapp.PersonService', personServiceMock)
          .start();
      });

      it('should start with options', () => {
        expect(serverCount).toEqual(1);
        expect(serverMock.receivedBuilder instanceof Builder).toBeTruthy();
        expect(serverMock.receivedOptions).toEqual(options);
        expect(serverMock.start).toHaveBeenCalledTimes(1);
        expect(serverMock.start).toHaveBeenCalledWith();
      });
    });

    describe('no options.listen', () => {
      describe('with options.host', () => {
        beforeEach(() => {
          options = {'host': '1.1.1.1'};
          condor = new Condor(options)
            .addService(protoFilePath, 'testapp.PersonService', personServiceMock)
            .start();
        });

        it('should use the given host, default port', () => {
          options = {'listen': '1.1.1.1:50051'};
          expect(serverCount).toEqual(1);
          expect(serverMock.receivedBuilder instanceof Builder).toBeTruthy();
          expect(serverMock.receivedOptions).toEqual(options);
          expect(serverMock.start).toHaveBeenCalledTimes(1);
          expect(serverMock.start).toHaveBeenCalledWith();
        });
      });

      describe('with options.port', () => {
        beforeEach(() => {
          options = {'port': '12345'};
          condor = new Condor(options)
            .addService(protoFilePath, 'testapp.PersonService', personServiceMock)
            .start();
        });

        it('should use the 0.0.0.0 address with given port', () => {
          options = {'listen': '0.0.0.0:12345'};
          expect(serverCount).toEqual(1);
          expect(serverMock.receivedBuilder instanceof Builder).toBeTruthy();
          expect(serverMock.receivedOptions).toEqual(options);
          expect(serverMock.start).toHaveBeenCalledTimes(1);
          expect(serverMock.start).toHaveBeenCalledWith();
        });
      });

      describe('with options.host and options.port', () => {
        beforeEach(() => {
          options = {'host': '2.2.2.2', 'port': '12345'};
          condor = new Condor(options)
            .addService(protoFilePath, 'testapp.PersonService', personServiceMock)
            .start();
        });

        it('should use the given host and port', () => {
          options = {'listen': '2.2.2.2:12345'};
          expect(serverCount).toEqual(1);
          expect(serverMock.receivedBuilder instanceof Builder).toBeTruthy();
          expect(serverMock.receivedOptions).toEqual(options);
          expect(serverMock.start).toHaveBeenCalledTimes(1);
          expect(serverMock.start).toHaveBeenCalledWith();
        });
      });
    });
  });

  describe('after server has started', () => {
    beforeEach(() => {
      condor
        .addService(protoFilePath, 'testapp.PersonService', personServiceMock)
        .start();
      serverMock.hasStarted = Spy.returnValue(true);
    });

    describe('when adding a service', () => {
      it('should throw an error', () => {
        expect(() => {
          condor.addService(protoFilePath, 'testapp.PersonService', personServiceMock);
        }).toThrowError('Cannot perform operation: Server has already started');
      });
    });

    describe('when adding a middleware', () => {
      it('should throw an error', () => {
        expect(() => {
          condor.use(emptyMethod);
        }).toThrowError('Cannot perform operation: Server has already started');
      });
    });

    describe('when adding an error handler', () => {
      it('should throw an error', () => {
        expect(() => {
          condor.addErrorHandler(emptyMethod);
        }).toThrowError('Cannot perform operation: Server has already started');
      });
    });

    describe('stop()', () => {
      beforeEach(() => {
        condor.start();
        condor._server.stop = Spy.resolve();
      });

      it('should call server.stop()', (done) => {
        condor.stop().then(() => {
          expect(condor._server.stop).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('forceStop()', () => {
      it('should call server.stop()', () => {
        condor.start();
        condor.forceStop();
        expect(condor._server.forceStop).toHaveBeenCalledTimes(1);
      });
    });
  });
});

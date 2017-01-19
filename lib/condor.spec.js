const Builder = require('./builder');
const Mocks = require('../spec/util/mocks');
const proxyquire = require('proxyquire');

/* eslint no-underscore-dangle: "off" */

describe('Condor:', () => {
  let Condor, condor, emptyMethod, personServiceMock, serverMock, grpcMock;
  const protoFilePath = 'spec/protos/person.proto';

  beforeEach(() => {
    serverMock = Mocks.getServer();
    grpcMock = Mocks.getGrpc(serverMock);
    Condor = proxyquire('./condor', {'./server': proxyquire('./server', {'grpc': grpcMock})});
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
      spyOn(condor._builder, 'addMiddleware');
    });

    it('should return the instance', () => {
      const instance = condor.addMiddleware(emptyMethod);
      expect(instance).toBe(condor);
    });

    it('should call builder.addMiddleware', () => {
      condor.addMiddleware(emptyMethod);
      expect(condor._builder.addMiddleware).toHaveBeenCalledTimes(1);
      expect(condor._builder.addMiddleware).toHaveBeenCalledWith(emptyMethod);
      condor._builder.addMiddleware.calls.reset();
      condor.addMiddleware('a', 'b', {}, 'd');
      expect(condor._builder.addMiddleware).toHaveBeenCalledTimes(1);
      expect(condor._builder.addMiddleware).toHaveBeenCalledWith('a', 'b', {}, 'd');
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
      expect(condor._hasStarted()).toEqual(false);
    });

    it('should return a Condor instance', () => {
      const instance = condor.start();
      expect(instance).toBe(condor);
    });

    it('should start server', () => {
      condor.start();
      expect(condor._hasStarted()).toEqual(true);
    });
  });

  describe('when options are passed', () => {
    const options = {
      'host': '127.0.0.1',
      'port': '9090',
      'creds': 'Credentials',
    };

    beforeEach(() => {
      condor = new Condor(options)
        .addService(protoFilePath, 'testapp.PersonService', personServiceMock)
        .start();
    });

    it('should start with options', () => {
      condor.start();
      expect(condor.getOptions()).toEqual(options);
    });
  });

  describe('after server has started', () => {
    beforeEach(() => {
      condor
        .addService(protoFilePath, 'testapp.PersonService', personServiceMock)
        .start();
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
          condor.addMiddleware(emptyMethod);
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
        spyOn(condor._server, 'stop');
      });

      it('should call server.stop()', () => {
        condor.stop();
        expect(condor._server.stop).toHaveBeenCalledTimes(1);
      });

      describe('when callback is passed', () => {
        it('should call the callback', () => {
          condor.stop(emptyMethod);
          expect(condor._server.stop).toHaveBeenCalledTimes(1);
          expect(condor._server.stop).toHaveBeenCalledWith(emptyMethod);
        });
      });
    });

    describe('forceStop()', () => {
      it('should call server.stop()', () => {
        condor.start();
        spyOn(condor._server, 'forceStop');
        condor.forceStop();
        expect(condor._server.forceStop).toHaveBeenCalledTimes(1);
      });
    });
  });
});

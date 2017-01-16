const Builder = require('./builder');
const Mocks = require('../spec/util/mocks');
const proxyquire = require('proxyquire');

/* eslint no-underscore-dangle: "off" */

describe('Condor:', () => {
  let Condor, condor, emptyMethod, personServiceMock, serverMock, grpcMock;

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

  describe('_addService()', () => {
    beforeEach(() => {
      spyOn(condor._builder, '_addService');
    });

    it('should return the instance', () => {
      const instance = condor._addService('a', 'b', {});
      expect(instance).toBe(condor);
    });

    it('should call builder._addService', () => {
      condor._addService('a', 'b', {});
      expect(condor._builder._addService).toHaveBeenCalledTimes(1);
      expect(condor._builder._addService).toHaveBeenCalledWith('a', 'b', {});
      condor._builder._addService.calls.reset();
      condor._addService('a', 'b', {}, 'd');
      expect(condor._builder._addService).toHaveBeenCalledTimes(1);
      expect(condor._builder._addService).toHaveBeenCalledWith('a', 'b', {}, 'd');
    });
  });

  describe('_addMiddleware()', () => {
    beforeEach(() => {
      spyOn(condor._builder, '_addMiddleware');
    });

    it('should return the instance', () => {
      const instance = condor._addMiddleware(emptyMethod);
      expect(instance).toBe(condor);
    });

    it('should call builder._addMiddleware', () => {
      condor._addMiddleware(emptyMethod);
      expect(condor._builder._addMiddleware).toHaveBeenCalledTimes(1);
      expect(condor._builder._addMiddleware).toHaveBeenCalledWith(emptyMethod);
      condor._builder._addMiddleware.calls.reset();
      condor._addMiddleware('a', 'b', {}, 'd');
      expect(condor._builder._addMiddleware).toHaveBeenCalledTimes(1);
      expect(condor._builder._addMiddleware).toHaveBeenCalledWith('a', 'b', {}, 'd');
    });
  });

  describe('_addErrorHandler()', () => {
    beforeEach(() => {
      spyOn(condor._builder, '_addErrorHandler');
    });

    it('should return the instance', () => {
      const instance = condor._addErrorHandler(emptyMethod);
      expect(instance).toBe(condor);
    });

    it('should call builder._addErrorHandler', () => {
      condor._addErrorHandler(emptyMethod);
      expect(condor._builder._addErrorHandler).toHaveBeenCalledTimes(1);
      expect(condor._builder._addErrorHandler).toHaveBeenCalledWith(emptyMethod);
      condor._builder._addErrorHandler.calls.reset();
      condor._addErrorHandler('a', 'b', {}, 'd');
      expect(condor._builder._addErrorHandler).toHaveBeenCalledTimes(1);
      expect(condor._builder._addErrorHandler).toHaveBeenCalledWith('a', 'b', {}, 'd');
    });
  });

  describe('_start()', () => {
    beforeEach(() => {
      condor._addService('protoFilePath', 'testapp.PersonService', personServiceMock);
    });

    it('should have not started', () => {
      expect(condor._hasStarted()).toEqual(false);
    });

    it('should return a Condor instance', () => {
      const instance = condor._start();
      expect(instance).toBe(condor);
    });

    it('should start server', () => {
      condor._start();
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
        ._addService('protoFilePath', 'testapp.PersonService', personServiceMock)
        ._start();
    });

    it('should start with options', () => {
      condor._start();
      expect(condor._getOptions()).toEqual(options);
    });
  });

  describe('after server has started', () => {
    beforeEach(() => {
      condor
        ._addService('protoFilePath', 'testapp.PersonService', personServiceMock)
        ._start();
    });

    describe('when adding a service', () => {
      it('should throw an error', () => {
        expect(() => {
          condor._addService('protoFilePath', 'testapp.PersonService', personServiceMock);
        }).toThrowError('Cannot add service: Server has already started');
      });
    });

    describe('when adding a middleware', () => {
      it('should throw an error', () => {
        expect(() => {
          condor._addMiddleware(emptyMethod);
        }).toThrowError('Cannot add middleware: Server has already started');
      });
    });

    describe('when adding an error handler', () => {
      it('should throw an error', () => {
        expect(() => {
          condor._addErrorHandler(emptyMethod);
        }).toThrowError('Cannot add error handler: Server has already started');
      });
    });
  });
});

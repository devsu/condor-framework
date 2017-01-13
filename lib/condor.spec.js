const Condor = require('./condor');
const Builder = require('./builder');

/* eslint no-underscore-dangle: "off" */

describe('Condor:', () => {
  let condor, emptyMethod;

  beforeEach(() => {
    condor = new Condor();
    emptyMethod = () => {}; // eslint-disable-line
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
});

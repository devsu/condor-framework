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
});

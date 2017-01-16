const Builder = require('./builder');

describe('Builder:', () => {
  let builder, protoFilePath, serviceFullName, implementation, emptyMethod;

  beforeEach(() => {
    builder = new Builder();
    protoFilePath = 'protoFilePath';
    serviceFullName = 'serviceFullName';
    implementation = {'a': 1};
    emptyMethod = () => {}; // eslint-disable-line
  });

  describe('constructor()', () => {
    it('should create a new instance of Builder class', () => {
      expect(builder instanceof Builder).toBeTruthy();
    });
  });

  describe('_addService()', () => {
    describe('implementation is not an object', () => {
      it('should throw an error', () => {
        expect(() => {
          builder._addService(protoFilePath, serviceFullName, 'invalid implementation');
        }).toThrowError('Cannot add service: No valid implementation received');
      });
    });

    it('should return the instance', () => {
      const instance = builder._addService(protoFilePath, serviceFullName, implementation);
      expect(instance).toBe(builder);
    });
  });

  describe('_getServices()', () => {
    describe('when builder is just initialized', () => {
      it('should return an empty array', () => {
        expect(builder._getServices()).toEqual([]);
      });
    });

    describe('when services have been added', () => {
      it('should return services added', () => {
        const expectedService = {
          'protoFilePath': protoFilePath,
          'serviceFullName': serviceFullName,
          'implementation': implementation,
        };
        builder._addService(protoFilePath, serviceFullName, implementation);
        builder._addService(protoFilePath, serviceFullName, implementation);
        expect(builder._getServices()).toEqual([expectedService, expectedService]);
      });
    });
  });

  describe('_addMiddleware()', () => {
    describe('when scope is not defined', () => {
      it('should add middleware to the global scope', () => {
        const expectedMiddleware = {'scope': '*', 'method': emptyMethod};
        builder._addMiddleware(emptyMethod);
        expect(builder._getMiddleware()).toEqual([expectedMiddleware]);
      });
    });

    describe('when method is not a function', () => {
      it('should throw an error', () => {
        expect(() => {
          builder._addMiddleware('scope');
        }).toThrowError('Cannot add Middleware: No valid function received');
      });
    });

    it('should return the instance', () => {
      const instance = builder._addMiddleware(emptyMethod);
      expect(instance).toBe(builder);
    });
  });

  describe('_getMiddleware()', () => {
    describe('when builder is just initialized', () => {
      it('should return an empty array', () => {
        expect(builder._getMiddleware()).toEqual([]);
      });
    });

    describe('when middleware methods have been added', () => {
      it('should return the middleware methods added', () => {
        const scope = 'scope';
        const expectedMiddleware = {
          'scope': scope,
          'method': emptyMethod,
        };
        builder._addMiddleware(scope, emptyMethod);
        builder._addMiddleware(scope, emptyMethod);
        expect(builder._getMiddleware()).toEqual([expectedMiddleware, expectedMiddleware]);
      });
    });
  });

  describe('_addErrorHandler()', () => {
    describe('when scope is not defined', () => {
      it('should add error handler to the global scope', () => {
        const expectedErrorHandler = {'scope': '*', 'method': emptyMethod};
        builder._addErrorHandler(emptyMethod);
        expect(builder._getErrorHandlers()).toEqual([expectedErrorHandler]);
      });
    });

    describe('when method is not a function', () => {
      it('should throw an error', () => {
        expect(() => {
          builder._addErrorHandler('scope');
        }).toThrowError('Cannot add error handler: No valid function received');
      });
    });

    it('should return the instance', () => {
      const instance = builder._addErrorHandler(emptyMethod);
      expect(instance).toBe(builder);
    });
  });

  describe('_getErrorHandlers()', () => {
    describe('when builder is just initialized', () => {
      it('should return an empty array', () => {
        expect(builder._getErrorHandlers()).toEqual([]);
      });
    });
    describe('when error handlers have been added', () => {
      it('should return the error handlers added', () => {
        const scope = 'scope';
        const expectedErrorHandler = {
          'scope': scope,
          'method': emptyMethod,
        };
        builder._addErrorHandler(scope, emptyMethod);
        builder._addErrorHandler(scope, emptyMethod);
        expect(builder._getErrorHandlers()).toEqual([expectedErrorHandler, expectedErrorHandler]);
      });
    });
  });
});

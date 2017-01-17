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

  describe('addService()', () => {
    describe('implementation is not an object', () => {
      it('should throw an error', () => {
        expect(() => {
          builder.addService(protoFilePath, serviceFullName, 'invalid implementation');
        }).toThrowError('Cannot add service: No valid implementation received');
      });
    });

    it('should return the instance', () => {
      const instance = builder.addService(protoFilePath, serviceFullName, implementation);
      expect(instance).toBe(builder);
    });
  });

  describe('getServices()', () => {
    describe('when builder is just initialized', () => {
      it('should return an empty array', () => {
        expect(builder.getServices()).toEqual([]);
      });
    });

    describe('when services have been added', () => {
      it('should return services added', () => {
        const expectedService = {
          'protoFilePath': protoFilePath,
          'serviceFullName': serviceFullName,
          'implementation': implementation,
        };
        builder.addService(protoFilePath, serviceFullName, implementation);
        builder.addService(protoFilePath, serviceFullName, implementation);
        expect(builder.getServices()).toEqual([expectedService, expectedService]);
      });
    });
  });

  describe('addMiddleware()', () => {
    describe('when scope is not defined', () => {
      it('should add middleware to the global scope', () => {
        const expectedMiddleware = {'scope': '*', 'method': emptyMethod};
        builder.addMiddleware(emptyMethod);
        expect(builder.getMiddleware()).toEqual([expectedMiddleware]);
      });
    });

    describe('when method is not a function', () => {
      it('should throw an error', () => {
        expect(() => {
          builder.addMiddleware('scope');
        }).toThrowError('Cannot add Middleware: No valid function received');
      });
    });

    it('should return the instance', () => {
      const instance = builder.addMiddleware(emptyMethod);
      expect(instance).toBe(builder);
    });
  });

  describe('getMiddleware()', () => {
    describe('when builder is just initialized', () => {
      it('should return an empty array', () => {
        expect(builder.getMiddleware()).toEqual([]);
      });
    });

    describe('when middleware methods have been added', () => {
      it('should return the middleware methods added', () => {
        const scope = 'scope';
        const expectedMiddleware = {
          'scope': scope,
          'method': emptyMethod,
        };
        builder.addMiddleware(scope, emptyMethod);
        builder.addMiddleware(scope, emptyMethod);
        expect(builder.getMiddleware()).toEqual([expectedMiddleware, expectedMiddleware]);
      });
    });
  });

  describe('addErrorHandler()', () => {
    describe('when scope is not defined', () => {
      it('should add error handler to the global scope', () => {
        const expectedErrorHandler = {'scope': '*', 'method': emptyMethod};
        builder.addErrorHandler(emptyMethod);
        expect(builder.getErrorHandlers()).toEqual([expectedErrorHandler]);
      });
    });

    describe('when method is not a function', () => {
      it('should throw an error', () => {
        expect(() => {
          builder.addErrorHandler('scope');
        }).toThrowError('Cannot add error handler: No valid function received');
      });
    });

    it('should return the instance', () => {
      const instance = builder.addErrorHandler(emptyMethod);
      expect(instance).toBe(builder);
    });
  });

  describe('getErrorHandlers()', () => {
    describe('when builder is just initialized', () => {
      it('should return an empty array', () => {
        expect(builder.getErrorHandlers()).toEqual([]);
      });
    });
    describe('when error handlers have been added', () => {
      it('should return the error handlers added', () => {
        const scope = 'scope';
        const expectedErrorHandler = {
          'scope': scope,
          'method': emptyMethod,
        };
        builder.addErrorHandler(scope, emptyMethod);
        builder.addErrorHandler(scope, emptyMethod);
        expect(builder.getErrorHandlers()).toEqual([expectedErrorHandler, expectedErrorHandler]);
      });
    });
  });
});

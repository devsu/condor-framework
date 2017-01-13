const Builder = require('./builder');
const grpc = require('grpc');

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

  describe('addService()', () => {
    it('should return the instance', () => {
      const instance = builder.addService(protoFilePath, serviceFullName, implementation);
      expect(instance).toBe(builder);
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

  describe('getOptions()', () => {
    describe('when builder was initialized without options', () => {
      it('should return the default options', () => {
        const defaultOptions = {
          'host': '0.0.0.0',
          'port': 3000,
          'creds': grpc.credentials.createInsecure(),
        };
        expect(builder.getOptions()).toEqual(defaultOptions);
      });
    });

    describe('when builder was initialized with options', () => {
      beforeEach(() => {
        const options = {'host': '1.1.1.1'};
        builder = new Builder(options);
      });

      it('should return the options merged with the default options', () => {
        const expectedOptions = {
          'host': '1.1.1.1',
          'port': 3000,
          'creds': grpc.credentials.createInsecure(),
        };
        expect(builder.getOptions()).toEqual(expectedOptions);
      });
    });
  });
});

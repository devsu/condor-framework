const Builder = require('./builder');

describe('Builder:', () => {
  let builder, protoFilePath, serviceFullName, implementation, emptyMethod;

  beforeEach(() => {
    builder = new Builder();
    protoFilePath = 'spec/protos/person.proto';
    serviceFullName = 'testapp.PersonService';
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
        }).toThrowError('Cannot perform operation: No valid implementation received');
      });
    });

    describe('protoFilePath is not a file path', () => {
      it('should throw an error', () => {
        protoFilePath = 'notAFile';
        expect(() => {
          builder.addService(protoFilePath, serviceFullName, implementation);
        }).toThrowError('Cannot perform operation: ProtoFilePath is not a valid file path');
      });
    });

    describe('protoFilePath is not a proto file', () => {
      it('should throw an error', () => {
        protoFilePath = 'lib/builder.js';
        expect(() => {
          builder.addService(protoFilePath, serviceFullName, implementation);
        }).toThrowError('Cannot perform operation: ProtoFile should have .proto extension');
      });
    });

    describe('serviceFullName must be valid', () => {
      describe('when there is no service name', () => {
        it('should throw an error', () => {
          serviceFullName = '';
          expect(() => {
            builder.addService(protoFilePath, serviceFullName, implementation);
          }).toThrowError('Cannot perform operation: Service name not found');
        });
      });

      describe('when there is only service name', () => {
        it('should add the service', () => {
          serviceFullName = 'JobService';
          expect(() => {
            builder.addService(protoFilePath, serviceFullName, implementation);
          }).not.toThrowError();
        });
      });

      describe('when the package name is not the same as the proto file package', () => {
        it('should throw an error', () => {
          serviceFullName = 'greeter.GreeterService';
          expect(() => {
            builder.addService(protoFilePath, serviceFullName, implementation);
          }).toThrowError('Cannot perform operation: Package name not found');
        });
      });

      describe('when package has more than one sub folder', () => {
        it('should add the service', () => {
          protoFilePath = 'spec/protos/car.proto';
          serviceFullName = 'transport.land.CarService';
          expect(() => {
            builder.addService(protoFilePath, serviceFullName, implementation);
          }).not.toThrowError();
        });
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
        }).toThrowError('Cannot perform operation: No valid function received');
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
        }).toThrowError('Cannot perform operation: No valid function received');
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

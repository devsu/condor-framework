const Builder = require('./builder');
const Spy = require('jasmine-spy');
const path = require('path');

describe('Builder:', () => {
  let builder, implementation, emptyMethod, expectedMiddleware, expectedErrorHandler,
    rootProtoPath;

  const scope = 'scope';

  beforeEach(() => {
    rootProtoPath = 'spec/protos';
    builder = new Builder({rootProtoPath});
    implementation = {'a': 1};
    emptyMethod = () => {}; // eslint-disable-line
    expectedMiddleware = {'scope': '*', 'method': emptyMethod};
    expectedErrorHandler = {'scope': '*', 'method': emptyMethod};
  });

  describe('constructor()', () => {
    it('should create a new instance of Builder class', () => {
      expect(builder instanceof Builder).toBeTruthy();
    });
  });

  describe('add()', () => {
    let serviceName, protoFilePath;

    beforeEach(() => {
      protoFilePath = 'testapp/person.proto';
      serviceName = 'PersonService';
    });

    describe('implementation is not an object', () => {
      it('should throw an error', () => {
        expect(() => {
          builder.add(protoFilePath, serviceName, 'invalid implementation');
        }).toThrowError('Cannot perform operation: No valid implementation received');
      });
    });

    describe('cant find proto file', () => {
      it('should throw an error', () => {
        protoFilePath = 'notAFile';
        const filePath = path.join(rootProtoPath, protoFilePath);
        expect(() => {
          builder.add(protoFilePath, serviceName, implementation);
        }).toThrowError(`Cannot perform operation: "${filePath}" not found`);
      });
    });

    describe('no options', () => {
      it('should not fail', () => {
        builder = new Builder();
        builder.add('spec/protos/testapp/person.proto', serviceName, implementation);
      });
    });

    describe('no options.rootProtoPath', () => {
      it('should not fail', () => {
        builder = new Builder({});
        builder.add('spec/protos/testapp/person.proto', serviceName, implementation);
      });
    });

    describe('with one object, with multiple services', () => {
      it('should not fail', () => {
        builder = new Builder({});
        const multiple = {};
        multiple[serviceName] = implementation;
        builder.add('spec/protos/testapp/person.proto', multiple);
      });
    });

    it('should return the instance', () => {
      const instance = builder.add(protoFilePath, serviceName, implementation);
      expect(instance).toBe(builder);
    });
  });

  describe('addService()', () => {
    let originalLogWarn, serviceFullName, protoFileFullPath;

    beforeEach(() => {
      /* eslint-disable no-console */
      originalLogWarn = console.warn;
      console.warn = Spy.create();
      /* eslint-enable no-console */
      protoFileFullPath = 'spec/protos/testapp/person.proto';
      serviceFullName = 'testapp.PersonService';
    });

    afterEach(() => {
      console.warn = originalLogWarn; // eslint-disable-line no-console
    });

    describe('implementation is not an object', () => {
      it('should throw an error', () => {
        expect(() => {
          builder.addService(protoFileFullPath, serviceFullName, 'invalid implementation');
        }).toThrowError('Cannot perform operation: No valid implementation received');
      });
    });

    describe('protoFilePath is not a file path', () => {
      it('should throw an error', () => {
        protoFileFullPath = 'notAFile';
        expect(() => {
          builder.addService(protoFileFullPath, serviceFullName, implementation);
        }).toThrowError('Cannot perform operation: ProtoFilePath is not a valid file path');
      });
    });

    describe('protoFilePath is not a proto file', () => {
      it('should throw an error', () => {
        protoFileFullPath = 'lib/builder.js';
        expect(() => {
          builder.addService(protoFileFullPath, serviceFullName, implementation);
        }).toThrowError('Cannot perform operation: ProtoFile should have .proto extension');
      });
    });

    describe('serviceFullName must be valid', () => {
      describe('when there is no service name', () => {
        it('should throw an error', () => {
          serviceFullName = '';
          expect(() => {
            builder.addService(protoFileFullPath, serviceFullName, implementation);
          }).toThrowError('Cannot perform operation: Service name not found');
        });
      });

      describe('when there is only service name', () => {
        it('should add the service', () => {
          serviceFullName = 'JobService';
          expect(() => {
            builder.addService(protoFileFullPath, serviceFullName, implementation);
          }).not.toThrowError();
        });
      });

      describe('when the package name is not the same as the proto file package', () => {
        it('should throw an error', () => {
          serviceFullName = 'greeter.GreeterService';
          expect(() => {
            builder.addService(protoFileFullPath, serviceFullName, implementation);
          }).toThrowError('Cannot perform operation: Package name not found');
        });
      });

      describe('when package has more than one sub folder', () => {
        it('should add the service', () => {
          protoFileFullPath = 'spec/protos/transport/land/car.proto';
          serviceFullName = 'transport.land.CarService';
          expect(() => {
            builder.addService(protoFileFullPath, serviceFullName, implementation);
          }).not.toThrowError();
        });
      });
    });

    it('should return the instance', () => {
      const instance = builder.addService(protoFileFullPath, serviceFullName, implementation);
      expect(instance).toBe(builder);
    });

    it('should log a deprecated warning', () => {
      builder.addService(protoFileFullPath, serviceFullName, implementation);
      /* eslint-disable no-console */
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith('addService() is deprecated use add() instead');
      /* eslint-enable no-console */
    });
  });

  describe('getServices()', () => {
    let protoFileFullPath, protoFilePath, serviceName, serviceFullName;

    beforeEach(() => {
      protoFilePath = 'testapp/person.proto';
      protoFileFullPath = 'spec/protos/testapp/person.proto';
      serviceName = 'PersonService';
      serviceFullName = 'testapp.PersonService';
    });

    describe('when builder is just initialized', () => {
      it('should return an empty array', () => {
        expect(builder.getServices()).toEqual([]);
      });
    });

    describe('when services have been added with addService()', () => {
      it('should return services added', () => {
        const expectedService = {
          protoFileFullPath,
          serviceName,
          serviceFullName,
          implementation,
        };
        builder.addService(protoFileFullPath, serviceFullName, implementation);
        builder.addService(protoFileFullPath, serviceFullName, implementation);
        expect(builder.getServices()).toEqual([expectedService, expectedService]);
      });
    });

    describe('when services have been added with add()', () => {
      it('should return services added', () => {
        const expectedService = {
          rootProtoPath,
          protoFilePath,
          protoFileFullPath,
          serviceName,
          serviceFullName,
          implementation,
        };
        builder.add(protoFilePath, serviceName, implementation);
        builder.add(protoFilePath, serviceName, implementation);
        expect(builder.getServices()).toEqual([expectedService, expectedService]);
      });

      describe('without rootProtoPath', () => {
        it('should return services added', () => {
          builder = new Builder();
          const expectedService = jasmine.objectContaining({
            protoFileFullPath,
            serviceName,
            implementation,
          });
          builder.add(protoFileFullPath, serviceName, implementation);
          builder.add(protoFileFullPath, serviceName, implementation);
          const actual = builder.getServices();
          expect(actual).toEqual([expectedService, expectedService]);
          expect(actual[0].rootProtoPath).toBeFalsy();
          expect(actual[1].rootProtoPath).toBeFalsy();
        });
      });

      describe('multiple services at once', () => {
        it('should return services added', () => {
          const anotherServiceName = 'JobService';
          const expectedServices = [{
            rootProtoPath,
            protoFilePath,
            protoFileFullPath,
            serviceName,
            serviceFullName,
            implementation,
          }, {
            rootProtoPath,
            protoFilePath,
            protoFileFullPath,
            'serviceName': 'JobService',
            'serviceFullName': 'testapp.JobService',
            implementation,
          }];
          const services = {};
          services[serviceName] = implementation;
          services[anotherServiceName] = implementation;
          builder.add(protoFilePath, services);
          const actual = builder.getServices();
          expect(actual).toEqual(expectedServices);
        });
      });
    });
  });

  describe('use()', () => {
    describe('when scope is not defined', () => {
      it('should add middleware to the global scope', () => {
        builder.use(emptyMethod);
        expect(builder.getMiddleware()).toEqual([expectedMiddleware]);
      });
    });

    describe('when method is not a function', () => {
      it('should throw an error', () => {
        expect(() => {
          builder.use('scope');
        }).toThrowError('Cannot perform operation: No valid function received');
      });
    });

    it('should return the instance', () => {
      const instance = builder.use(emptyMethod);
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
      beforeEach(() => {
        expectedMiddleware.scope = scope;
      });

      it('should return the middleware methods added', () => {
        builder.use(scope, emptyMethod);
        builder.use(scope, emptyMethod);
        expect(builder.getMiddleware()).toEqual([expectedMiddleware, expectedMiddleware]);
      });
    });
  });

  describe('addErrorHandler()', () => {
    describe('when scope is not defined', () => {
      it('should add error handler to the global scope', () => {
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
      beforeEach(() => {
        expectedErrorHandler.scope = scope;
      });

      it('should return the error handlers added', () => {
        builder.addErrorHandler(scope, emptyMethod);
        builder.addErrorHandler(scope, emptyMethod);
        expect(builder.getErrorHandlers()).toEqual([expectedErrorHandler, expectedErrorHandler]);
      });
    });
  });
});

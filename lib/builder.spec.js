const Builder = require('./builder');
const grpc = require('grpc');

describe('Builder:', () => {
  let builder;

  beforeEach(() => {
    builder = new Builder();
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
        const protoFilePath = 'protoFilePath';
        const serviceFullName = 'serviceFullName';
        const implementation = {'a': 1};
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

  describe('getMiddleware()', () => {
    describe('when builder is just initialized', () => {
      it('should return an empty array', () => {
        expect(builder.getMiddleware()).toEqual([]);
      });
    });

    describe('when middleware methods have been added', () => {
      it('should return the middleware methods added', () => {
        const scope = 'scope';
        const method = () => {
          return '';
        };
        const expectedMiddleware = {
          'scope': scope,
          'method': method,
        };
        builder.addMiddleware(scope, method);
        builder.addMiddleware(scope, method);
        expect(builder.getMiddleware()).toEqual([expectedMiddleware, expectedMiddleware]);
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

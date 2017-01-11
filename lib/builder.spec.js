const PROTO_PATH = '../spec/protos/person.proto';
const PROTO_PACKAGE = 'testapp';
const PROTO_SERVICE_NAME = `${PROTO_PACKAGE}.PersonService`;
const Builder = require('./builder');
const PersonServiceStub = require('../spec/util/person-service-stub');
const grpc = require('grpc');

describe('Builder class', () => {
  let builder;

  beforeAll(() => {
    builder = new Builder();
  });

  it('should return an instance of builder', () => {
    expect(builder instanceof Builder).toBeTruthy();
  });

  describe('addService', () => {
    beforeEach(() => {
      builder.addService(PROTO_PATH, PROTO_SERVICE_NAME, new PersonServiceStub());
    });

    it('should save a service to the builder', () => {
      expect(builder.getServices().length).toEqual(1);
    });
  });

  describe('addMiddleware', () => {
    let middleware;

    beforeAll(() => {
      middleware = function(call) {
        return call;
      };
      builder.addMiddleware(PROTO_PACKAGE, middleware);
    });

    it('should use middleware', () => {
      expect(builder.getMiddlewares().length).toEqual(1);
    });

    describe('when there is no scope', () => {
      beforeEach(() => {
        builder.addMiddleware(middleware);
      });
      it('should set the object without scope property', () => {
        expect(builder.getMiddlewares().length).toEqual(2);
        expect(builder.getMiddlewares()[1].scope).toBeUndefined();
      });
    });
    describe('when there is no middleware', () => {
      it('should throw an error', () => {
        expect(builder.addMiddleware.bind(builder, PROTO_PACKAGE)).toThrow();
      });
    });
  });

  describe('when no options are given', () => {
    let defaultOptions;
    beforeEach(() => {
      defaultOptions = {
        'port': '3000',
        'host': '0.0.0.0',
        'creds': grpc.credentials.createInsecure(),
      };
    });
    it('should use default options', () => {
      expect(builder.getOptions()).toEqual(defaultOptions);
    });
  });

  describe('setOptions', () => {
    let options, optionsAndDefault;

    beforeEach(() => {
      optionsAndDefault = {
        'host': '0.0.0.0',
        'creds': grpc.credentials.createInsecure(),
      };
      options = {
        'port': 3000,
      };
      optionsAndDefault.port = options.port;
      builder.setOptions(options);
    });

    it('should merge options and default options', () => {
      expect(builder.getOptions()).toEqual(optionsAndDefault);
    });
  });
});

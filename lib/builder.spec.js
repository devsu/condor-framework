const PROTO_PATH = '../spec/protos/person.proto';
const PROTO_PACKAGE = 'testapp';
const PROTO_SERVICE_NAME = `${PROTO_PACKAGE}.PersonService`;
const Builder = require('./builder');
const PersonServiceSpy = require('../spec/util/person-service-spy');

describe('builder', () => {
  let builder;

  beforeAll(() => {
    builder = new Builder();
  });

  it('should return an instance of builder', () => {
    expect(builder instanceof Builder).toBeTruthy();
  });

  describe('save services', () => {
    beforeEach(() => {
      builder.registerService(PROTO_PATH, PROTO_SERVICE_NAME, new PersonServiceSpy());
    });

    it('should save a service to the builder', () => {
      expect(builder.getServices().length).toEqual(1);
    });
  });

  describe('save middlewares', () => {
    let middleware;

    beforeEach(() => {
      middleware = function(call) {
        return call;
      };
      builder.use(PROTO_PACKAGE, middleware);
    });

    it('should use middleware', () => {
      expect(builder.getMiddlewares().length).toEqual(1);
    });
  });

  describe('save options', () => {
    let options;

    beforeEach(() => {
      options = {
        'port': 3000,
      };
      builder.setOptions(options);
    });

    it('should save options', () => {
      expect(builder.getOptions()).toEqual(options);
    });
  });
});

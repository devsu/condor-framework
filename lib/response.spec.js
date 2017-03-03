const grpc = require('grpc');
const Response = require('./response');

describe('Response:', () => {
  let expectedMessage, response, metadata;

  beforeEach(() => {
    expectedMessage = {'message': 'response'};
    metadata = new grpc.Metadata();
    response = new Response(expectedMessage, metadata);
  });

  describe('constructor', () => {
    it('should create an instance of response', () => {
      expect(response instanceof Response).toBeTruthy();
    });

    it('should have a message', () => {
      expect(response._message).toBe(expectedMessage); // eslint-disable-line
    });

    it('should have metadata', () => {
      metadata.add('uid', '12345678');
      const responseMetadata = response._metadata; // eslint-disable-line
      expect(responseMetadata).toEqual(metadata);
      expect(responseMetadata.get('uid')).toEqual(['12345678']);
    });

    describe('when no message is passed', () => {
      it('should not throw an error', () => {
        expect(() => {
          response = new Response();
        }).not.toThrowError();
      });
    });

    describe('when no metadata is passed', () => {
      it('should not throw error', () => {
        expect(() => {
          response = new Response(expectedMessage);
        }).not.toThrowError();
      });
    });

    describe('when only metadata is passed', () => {
      it('should throw error', () => {
        expect(() => {
          response = new Response(metadata);
        }).toThrowError();
      });
    });

    describe('when only message is passed', () => {
      it('should not throw error', () => {
        expect(() => {
          response = new Response(expectedMessage);
        }).not.toThrowError();
      });
    });
  });

  describe('getGrpcObject()', () => {
    it('should return the message object to use in grpc', () => {
      expectedMessage.message = 'message';
      expect(response.getGrpcObject()).toEqual(expectedMessage);
    });

    describe('when message is undefined', () => {
      it('should return an empty object', () => {
        response = new Response();
        expect(response.getGrpcObject()).toEqual({});
      });
    });
  });

  describe('getMetadata()', () => {
    it('should return the metadata', () => {
      metadata.add('guid', '1234567890');
      expect(response.getMetadata()).toEqual(metadata);
      expect(response.getMetadata().get('guid')).toEqual(['1234567890']);
    });
  });
});

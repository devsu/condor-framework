const grpc = require('grpc');
const Response = require('./response');

describe('Response:', () => {
  let expectedMessage, message, response, metadata;

  beforeEach(() => {
    expectedMessage = {'message': 'response'};
    message = {'message': 'response'};
    metadata = new grpc.Metadata();
    response = new Response(message, metadata);
  });

  describe('constructor', () => {
    it('should create an instance of response', () => {
      expect(response instanceof Response).toBeTruthy();
    });

    it('should have a message', () => {
      expect(response._message).toEqual(expectedMessage); // eslint-disable-line
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
          response = new Response(message);
        }).not.toThrowError();
      });
    });

    describe('when only metadata is passed', () => {
      it('should not throw error', () => {
        expect(() => {
          response = new Response(metadata);
        }).not.toThrowError();
      });

      it('should create an empty object for message and assign the metadata passed', () => {
        response = new Response(metadata);
        expect(response._message).toEqual({}); // eslint-disable-line
        expect(response._metadata).toEqual(metadata); // eslint-disable-line
      });
    });

    describe('when only message is passed', () => {
      it('should not throw error', () => {
        expect(() => {
          response = new Response(message);
        }).not.toThrowError();
      });
    });
  });

  describe('getGrpcObject()', () => {
    it('should return the message object to use in grpc', () => {
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

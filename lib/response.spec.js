const Response = require('./response');
const grpc = require('grpc');

/* eslint no-underscore-dangle: "off" */
describe('Response:', () => {
  let response, callback;

  beforeEach(() => {
    callback = (error, result) => {}; // eslint-disable-line
    response = new Response(callback, new grpc.Metadata());
  });

  describe('constructor()', () => {
    it('should create an instance of response', () => {
      expect(response instanceof Response).toBeTruthy();
    });

    it('should be created with a callback', () => {
      expect(response._callback).toEqual(callback);
    });

    describe('when no callback is passed', () => {
      it('should throw an error', () => {
        expect(() => {
          response = new Response();
        }).toThrow(new Error('Callback is undefined'));
      });
    });

    describe('when callback is not a function', () => {
      it('should throw an error', () => {
        expect(() => {
          response = new Response('callback');
        }).toThrow(new Error('Callback is not a function'));
      });
    });
  });

  describe('resolve()', () => {
    it('should callback with null and response', () => {
      const expectedResponse = 'response';
      spyOn(response, '_callback');
      response.resolve(expectedResponse);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(null, expectedResponse);
    });

    it('should callback with null and resolve', () => {
      const expectedResponse = 'resolve';
      spyOn(response, '_callback');
      response.resolve(expectedResponse);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(null, expectedResponse);
    });

    it('should have not error flag set', () => {
      response.resolve('response');
      expect(response.hasError()).toBeFalsy();
    });
  });

  describe('reject()', () => {
    let defaultError, defaultMessage, defaultErrorCode;

    beforeEach(() => {
      defaultMessage = 'Internal Server Error';
      defaultErrorCode = grpc.status.INTERNAL;
      defaultError = new Error(defaultMessage);
      defaultError.code = defaultErrorCode;
    });

    it('should callback with error', () => {
      const expectedError = new Error('Error');
      spyOn(response, '_callback');
      response.reject(expectedError);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(expectedError);
    });

    it('should callback with another error', () => {
      const expectedError = new Error('Another Error');
      spyOn(response, '_callback');
      response.reject(expectedError);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(expectedError);
    });

    it('should set error flag to true', () => {
      response.reject(new Error('Error'));
      expect(response.hasError()).toBeTruthy();
    });

    describe('when an error is passed', () => {
      it('should return error passed and default code', () => {
        const expectedError = new Error('error');
        response.reject(expectedError);
        expect(response.getError()).toEqual(expectedError);
        expect(response.getError().code).toEqual(defaultErrorCode);
      });

      it('should return error and code', () => {
        const expectedError = new Error('error');
        expectedError.code = 1234;
        response.reject(expectedError);
        expect(response.getError()).toEqual(expectedError);
        expect(response.getError().code).toEqual(expectedError.code);
      });

      it('should code and default error', () => {
        const expectedError = new Error();
        expectedError.code = 1234;
        response.reject(expectedError);
        expect(response.getError()).toEqual(defaultError);
        expect(response.getError().code).toEqual(expectedError.code);
      });
    });

    describe('when code and message are passed as parameters', () => {
      it('should create the error', () => {
        response.reject(1234, 'Error');
        expect(response.getError()).toEqual(new Error('Error'));
        expect(response.getError().code).toEqual(1234);
      });
    });

    describe('when code and message are passed as an object', () => {
      it('should create the error', () => {
        response.reject({'code': 1234, 'message': 'Error'});
        expect(response.getError()).toEqual(new Error('Error'));
        expect(response.getError().code).toEqual(1234);
      });
    });

    describe('when no error is passed', () => {
      it('should return default error', () => {
        response.reject();
        expect(response.getError()).toEqual(defaultError);
        expect(response.getError().code).toEqual(defaultErrorCode);
      });
    });

    describe('when no message nor code is passed inside an object', () => {
      it('should return default error', () => {
        response.reject({});
        expect(response.getError()).toEqual(defaultError);
        expect(response.getError().code).toEqual(defaultErrorCode);
      });
    });

    describe('when no message nor code is passed inside an object with other properties', () => {
      it('should return default error', () => {
        response.reject({'error': new Error('Hello')});
        expect(response.getError()).toEqual(defaultError);
        expect(response.getError().code).toEqual(defaultErrorCode);
      });
    });

    describe('when no message is passed', () => {
      describe('as parameter', () => {
        it('should return the default message and the code passed', () => {
          response.reject(1234);
          expect(response.getError()).toEqual(defaultError);
          expect(response.getError().code).toEqual(1234);
        });
      });

      describe('inside the object', () => {
        it('should return the default message and the code passed', () => {
          response.reject({'code': 1234});
          expect(response.getError()).toEqual(defaultError);
          expect(response.getError().code).toEqual(1234);
        });
      });
    });

    describe('when no code is passed', () => {
      describe('as parameter', () => {
        it('should return the default code and the message passed', () => {
          response.reject(null, 'Error');
          expect(response.getError()).toEqual(new Error('Error'));
          expect(response.getError().code).toEqual(defaultErrorCode);
        });
      });

      describe('inside the object', () => {
        it('should return the default code and the message passed', () => {
          response.reject({'message': 'Error'});
          expect(response.getError()).toEqual(new Error('Error'));
          expect(response.getError().code).toEqual(defaultErrorCode);
        });
      });
    });
  });

  describe('after resolve() is called', () => {
    describe('and resolve() is called again', () => {
      it('should throw an error', () => {
        response.resolve('response');
        expect(() => {
          response.resolve('response');
        }).toThrow(new Error('Cannot resolve/reject a response already resolved/rejected'));
      });
    });

    describe('and reject() is called', () => {
      it('should throw an error', () => {
        response.resolve('response');
        expect(() => {
          response.reject(new Error('error'));
        }).toThrow(new Error('Cannot resolve/reject a response already resolved/rejected'));
      });
    });
  });

  describe('after reject() is called', () => {
    describe('and reject() is called again', () => {
      it('should throw an error', () => {
        response.reject(new Error('Error'));
        expect(() => {
          response.reject(new Error('Error'));
        }).toThrow(new Error('Cannot resolve/reject a response already resolved/rejected'));
      });
    });

    describe('and resolve() is called', () => {
      it('should throw an error', () => {
        response.reject(new Error('Error'));
        expect(() => {
          response.resolve('response');
        }).toThrow(new Error('Cannot resolve/reject a response already resolved/rejected'));
      });
    });
  });

  describe('getResult()', () => {
    it('should get the value resolved', () => {
      const expectedResponse = 'response';
      response.resolve(expectedResponse);
      expect(response.getResult()).toEqual(expectedResponse);
    });

    describe('when reject() is called', () => {
      it('should return undefined', () => {
        response.reject(new Error('error'));
        expect(response.getResult()).toBeUndefined();
      });
    });

    describe('when response is not done', () => {
      it('should throw an error', () => {
        const expectedError = new Error('Response have not been resolved/rejected');
        expect(() => {
          response.getResult();
        }).toThrow(expectedError);
      });
    });
  });

  describe('getError()', () => {
    it('should get the error that caused the reject', () => {
      const expectedError = new Error('Error');
      response.reject(expectedError);
      expect(response.getError()).toEqual(expectedError);
    });

    describe('when response() is called', () => {
      it('should return undefined', () => {
        response.resolve(new Error('error'));
        expect(response.getError()).toBeUndefined();
      });
    });

    describe('when response is not done', () => {
      it('should throw an error', () => {
        const expectedError = new Error('Response have not been resolved/rejected');
        expect(() => {
          response.getError();
        }).toThrow(expectedError);
      });
    });
  });

  describe('metadata', () => {
    describe('when a property is set', () => {
      it('should not throw an error', () => {
        expect(() => {
          response.metadata.set('uid', 'email@example.com');
        }).not.toThrowError();
      });

      it('should be an instance of grpc.Metadata()', () => {
        expect(response.metadata instanceof grpc.Metadata).toBeTruthy();
      });

      it('should return the same value', () => {
        const expectedValue = 'email@example.com';
        response.metadata.set('uid', expectedValue);
        expect(response.metadata.get('uid')).toEqual([expectedValue]);
      });
    });

    describe('when metadata is not passed', () => {
      it('should not throw an error adding a property', () => {
        response = new Response(callback);
        expect(() => {
          response.metadata.set('uid', 'email@example.com');
        }).not.toThrowError();
      });
    });
  });
});

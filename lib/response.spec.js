const Response = require('./response');
const Promise = require('bluebird');
const grpc = require('grpc');

/* eslint no-underscore-dangle: "off" */
/* eslint max-lines: "off" */
fdescribe('Response:', () => {
  let response, callback, defaultErrorHandler, expectedError;

  beforeEach(() => {
    callback = (error, result) => {}; // eslint-disable-line
    response = new Response(callback, new grpc.Metadata());
    defaultErrorHandler = (error) => {
      return error;
    };
    expectedError = new Error('Error');
  });

  describe('constructor()', () => {
    it('should create an instance of response', () => {
      expect(response instanceof Response).toBeTruthy();
    });

    it('should create a internal promise', () => {
      expect(response._promise instanceof Promise).toBeTruthy();
    });

    it('should create an internal resolve function', () => {
      expect(typeof response._resolve).toEqual('function');
    });

    it('should create an internal reject function', () => {
      expect(typeof response._resolve).toEqual('function');
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

    it('should have a then()', (done) => {
      const expectedResponse = 'response';
      response.resolve(expectedResponse).then((result) => {
        expect(result).toEqual(expectedResponse);
        done();
      });
    });

    describe('when callback throws an error', () => {
      it('should have a catch()', (done) => {
        const expectedError = new Error('Error');
        response = new Response(() => {
          throw expectedError;
        });
        response.resolve('response').catch((error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });
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
      spyOn(response, '_callback');
      response.reject(expectedError).catch(defaultErrorHandler);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(expectedError);
    });

    it('should callback with another error', () => {
      const expectedError = new Error('Another Error');
      spyOn(response, '_callback');
      response.reject(expectedError).catch(defaultErrorHandler);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(expectedError);
    });

    it('should set error flag to true', () => {
      response.reject(expectedError).catch(defaultErrorHandler);
      expect(response.hasError()).toBeTruthy();
    });

    it('should have a catch()', (done) => {
      response.reject(expectedError).catch((error) => {
        expect(error).toEqual(expectedError);
        done();
      });
    });

    describe('when an error is passed', () => {
      it('should return error passed and default code', (done) => {
        response.reject(expectedError).catch((error) => {
          expect(error).toEqual(expectedError);
          expect(error.code).toEqual(defaultErrorCode);
          done();
        });
      });

      it('should return error and code', (done) => {
        expectedError.code = 1234;
        response.reject(expectedError).catch((error) => {
          expect(error).toEqual(expectedError);
          expect(error.code).toEqual(expectedError.code);
          done();
        });
      });

      it('should code and default error', (done) => {
        const expectedError = new Error();
        expectedError.code = 1234;
        response.reject(expectedError).catch((error) => {
          expect(error).toEqual(defaultError);
          expect(error.code).toEqual(expectedError.code);
          done();
        });
      });
    });

    describe('when code and message are passed as parameters', () => {
      it('should create the error', (done) => {
        response.reject(1234, 'Error').catch((error) => {
          expect(error).toEqual(new Error('Error'));
          expect(error.code).toEqual(1234);
          done();
        });
      });
    });

    describe('when code and message are passed as an object', () => {
      it('should create the error', (done) => {
        response.reject({'code': 1234, 'message': 'Error'}).catch((error) => {
          expect(error).toEqual(new Error('Error'));
          expect(error.code).toEqual(1234);
          done();
        });
      });
    });

    describe('when no error is passed', () => {
      it('should return default error', (done) => {
        response.reject().catch((error) => {
          expect(error).toEqual(defaultError);
          expect(error.code).toEqual(defaultErrorCode);
          done();
        });
      });
    });

    describe('when no message nor code is passed inside an object', () => {
      it('should return default error', (done) => {
        response.reject({}).catch((error) => {
          expect(error).toEqual(defaultError);
          expect(error.code).toEqual(defaultErrorCode);
          done();
        });
      });
    });

    describe('when no message nor code is passed inside an object with other properties', () => {
      it('should return default error', (done) => {
        response.reject({'error': new Error('Hello')}).catch((error) => {
          expect(error).toEqual(defaultError);
          expect(error.code).toEqual(defaultErrorCode);
          done();
        });
      });
    });

    describe('when no message is passed', () => {
      describe('as parameter', () => {
        it('should return the default message and the code passed', (done) => {
          response.reject(1234).catch((error) => {
            expect(error).toEqual(defaultError);
            expect(error.code).toEqual(1234);
            done();
          });
        });
      });

      describe('inside the object', () => {
        it('should return the default message and the code passed', (done) => {
          response.reject({'code': 1234}).catch((error) => {
            expect(error).toEqual(defaultError);
            expect(error.code).toEqual(1234);
            done();
          });
        });
      });
    });

    describe('when no code is passed', () => {
      describe('as parameter', () => {
        it('should return the default code and the message passed', (done) => {
          response.reject(null, 'Error').catch((error) => {
            expect(error).toEqual(new Error('Error'));
            expect(error.code).toEqual(defaultErrorCode);
            done();
          });
        });
      });

      describe('inside the object', () => {
        it('should return the default code and the message passed', (done) => {
          response.reject({'message': 'Error'}).catch((error) => {
            expect(error).toEqual(new Error('Error'));
            expect(error.code).toEqual(defaultErrorCode);
            done();
          });
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
        response.reject(new Error('Error')).catch(defaultErrorHandler);
        expect(() => {
          response.reject(new Error('Error'));
        }).toThrow(new Error('Cannot resolve/reject a response already resolved/rejected'));
      });
    });

    describe('and resolve() is called', () => {
      it('should throw an error', () => {
        response.reject(new Error('Error')).catch(defaultErrorHandler);
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
        response.reject(new Error('error')).catch(defaultErrorHandler);
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
      response.reject(expectedError).catch(defaultErrorHandler);
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

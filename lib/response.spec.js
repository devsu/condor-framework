const Response = require('./response');
const Promise = require('bluebird');
const grpc = require('grpc');

/* eslint no-underscore-dangle: "off" */
/* eslint max-lines: "off" */
describe('Response:', () => {
  let response, callback, defaultErrorHandler, expectedError;

  beforeEach(() => {
    callback = (error, result) => {}; // eslint-disable-line
    response = new Response(callback);
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

    it('should have a catch()', (done) => {
      response.reject(expectedError).catch((error) => {
        expect(error).toEqual(expectedError);
        done();
      });
    });

    describe('when an error is passed', () => {
      it('should return error passed', (done) => {
        response.reject(expectedError).catch((error) => {
          expect(error).toBe(expectedError);
          done();
        });
      });
    });

    describe('when code and details are passed as parameters', () => {
      it('should return an object with code and details', (done) => {
        response.reject('Error', 1234).catch((error) => {
          expect(error.details).toEqual('Error');
          expect(error.code).toEqual(1234);
          done();
        });
      });
    });

    describe('when only details is passed as parameter', () => {
      it('should return an object with details', (done) => {
        response.reject('Error').catch((error) => {
          expect(error.details).toEqual('Error');
          expect(Object.keys(error)).not.toContain('code');
          done();
        });
      });
    });

    describe('when only code is passed as parameter', () => {
      it('should return an object with code', (done) => {
        response.reject(null, 1234).catch((error) => {
          expect(error.code).toEqual(1234);
          expect(Object.keys(error)).not.toContain('details');
          done();
        });
      });
    });

    describe('when an object is passed', () => {
      it('should return the same object', (done) => {
        const expectedError = {'message': 'message'};
        response.reject(expectedError).catch((error) => {
          expect(error).toBe(expectedError);
          done();
        });
      });
    });

    describe('when no error is passed', () => {
      it('should return with an empty error', (done) => {
        response.reject().catch((error) => {
          expect(error).toEqual({});
          done();
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
});

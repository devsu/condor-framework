const Response = require('./response');

/* eslint no-underscore-dangle: "off" */
describe('Response:', () => {
  let response, callback;

  beforeEach(() => {
    callback = (error, result) => {}; // eslint-disable-line
    response = new Response(callback);
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
});

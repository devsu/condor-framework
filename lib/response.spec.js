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
    it('callback should be called with null and response', () => {
      const expectedResponse = 'response';
      spyOn(response, '_callback');
      response.resolve(expectedResponse);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(null, expectedResponse);
    });

    it('callback should be called with null and resolve', () => {
      const expectedResponse = 'resolve';
      spyOn(response, '_callback');
      response.resolve(expectedResponse);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(null, expectedResponse);
    });
  });

  describe('reject()', () => {
    it('callback should be called with error', () => {
      const expectedError = new Error('Error');
      spyOn(response, '_callback');
      response.reject(expectedError);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(expectedError);
    });

    it('callback should be called with another error', () => {
      const expectedError = new Error('Another Error');
      spyOn(response, '_callback');
      response.reject(expectedError);
      expect(response._callback).toHaveBeenCalledTimes(1);
      expect(response._callback).toHaveBeenCalledWith(expectedError);
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
});

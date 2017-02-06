const Response = require('./response');

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

  //
  // describe('getValue()', () => {
  //   describe('when response is resolved', () => {
  //     describe('with a value', () => {
  //       it('should return the value passed', () => {
  //         const expectedResponse = 'response';
  //         response.resolve(expectedResponse);
  //         expect(response.getValue()).toEqual(expectedResponse);
  //
  //         response = new Response();
  //         const expectedResponse2 = 'response 2';
  //         response.resolve(expectedResponse2);
  //         expect(response.getValue()).toEqual(expectedResponse2);
  //       });
  //     });
  //   });
  //
  //   describe('when response is rejected', () => {
  //     describe('with an error', () => {
  //       it('should return the value passed', () => {
  //         const expectedError = new Error('error');
  //         response.reject(expectedError);
  //         expect(response.getValue()).toEqual(expectedError);
  //
  //         response = new Response();
  //         const expectedError2 = 'non-blocking error';
  //         response.reject(expectedError2);
  //         expect(response.getValue()).toEqual(expectedError2);
  //       });
  //     });
  //   });
  // });
});

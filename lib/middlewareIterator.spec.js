const MiddlewareIterator = require('./middlewareIterator');
const Mocks = require('../spec/util/mocks');
const Context = require('./context');
const Response = require('./response');

describe('MiddlewareIterator', () => {
  let elements, middlewareIterator, context, nextMiddlewareFn, implementationMock;

  beforeEach(() => {
    const mockMiddleware = Mocks.getMiddleware();
    implementationMock = Mocks.getPersonService();
    context = new Context({'request': {'response': 'message'}});
    elements = mockMiddleware.middleware;
    middlewareIterator = new MiddlewareIterator(elements, context, implementationMock.list);
    nextMiddlewareFn = (context, next) => {
      next();
    };
  });

  describe('constructor', () => {
    it('should create a MiddlewareIterator instance', () => {
      expect(middlewareIterator instanceof MiddlewareIterator).toBeTruthy();
    });

    it('should receive an array of elements', () => {
      expect(middlewareIterator._elements).toEqual(elements); // eslint-disable-line
    });

    it('should receive context', () => {
      expect(middlewareIterator._context).toEqual(context); // eslint-disable-line
    });

    it('should receive the implementation', () => {
      expect(middlewareIterator._implementation).toEqual(implementationMock.list); // eslint-disable-line
    });

    describe('when no array is passed', () => {
      it('should throw an error', () => {
        expect(() => {
          new MiddlewareIterator(); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: An array of elements is required'));
      });
    });

    describe('when the elements passed are not an array', () => {
      it('should throw an error', () => {
        expect(() => {
          new MiddlewareIterator({}); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: An array of elements is required'));
      });
    });

    describe('when no context is passed', () => {
      it('should throw an error', () => {
        expect(() => {
          new MiddlewareIterator(elements); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: A context is required'));
      });
    });

    describe('when context passed is not an instance of Context', () => {
      it('should throw an error', () => {
        expect(() => {
          new MiddlewareIterator(elements, {}); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: A context is required'));
      });
    });

    describe('when no implementation is passed', () => {
      it('should throw an error', () => {
        expect(() => {
          new MiddlewareIterator(elements, context); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: A implementation is required'));
      });
    });

    describe('when implementation passed is not a function', () => {
      it('should throw an error', () => {
        expect(() => {
          new MiddlewareIterator(elements, context, {}); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: A implementation is required'));
      });
    });
  });

  describe('next()', () => {
    it('should execute the next middleware of the array', (done) => {
      elements[0].method.and.callFake(nextMiddlewareFn);
      elements[1].method.and.callFake(nextMiddlewareFn);
      elements[2].method.and.callFake(nextMiddlewareFn);
      elements[3].method.and.callFake(() => {
        expect(elements[0].method).toHaveBeenCalledTimes(1);
        expect(elements[1].method).toHaveBeenCalledTimes(1);
        expect(elements[2].method).toHaveBeenCalledTimes(1);
        expect(elements[3].method).toHaveBeenCalledTimes(1);
        done();
      });
      middlewareIterator.next();
    });

    describe('when a middleware send a response', () => {
      let expectedResponse;

      beforeEach(() => {
        expectedResponse = new Response('resolving');
        elements[1].method.and.callFake((context) => {
          context.send(expectedResponse);
        });
      });

      it('should not call other middleware', (done) => {
        elements[0].method.and.callFake((context, next) => {
          next().then(() => {
            expect(elements[0].method).toHaveBeenCalled();
            expect(elements[1].method).toHaveBeenCalled();
            expect(elements[2].method).not.toHaveBeenCalled();
            done();
          });
        });
        elements[2].method.and.callFake(nextMiddlewareFn);
        middlewareIterator.next();
      });

      it('should return the context response', (done) => {
        elements[0].method.and.callFake((context, next) => {
          next().then((result) => {
            expect(result).toEqual(expectedResponse);
            done();
          });
        });
        middlewareIterator.next();
      });

      describe('and also call next()', () => {
        it('should not call the next middleware', (done) => {
          elements[0].method.and.callFake((context, next) => {
            context.send(expectedResponse);
            next();
          });
          middlewareIterator.next().then(() => {
            expect(elements[1].method).not.toHaveBeenCalled();
            done();
          });
        });
      });

      describe('and a previous middleware changes the response', () => {
        it('should return the changed response', (done) => {
          const expectedResponse2 = new Response('changing');
          elements[0].method.and.callFake((context, next) => {
            return next();
          });
          elements[1].method.and.callFake((context, next) => {
            return next().then((result) => {
              expect(result).toEqual(expectedResponse);
              context.send(expectedResponse2);
            });
          });
          elements[2].method.and.callFake((context) => {
            context.send(expectedResponse);
          });
          middlewareIterator.next().then((result) => {
            expect(result).toEqual(expectedResponse2);
            done();
          });
        });
      });
    });
  });
});

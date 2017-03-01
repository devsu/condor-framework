const FunctionIterator = require('./functionIterator');
const Mocks = require('../spec/util/mocks');
const Spy = require('../spec/util/spy');
const Context = require('./context');
const Response = require('./response');

describe('FunctionIterator', () => {
  let elements, functionIterator, context, nextMiddlewareFn, implementationMock, implementation;

  beforeEach(() => {
    const mockMiddleware = Mocks.getMiddleware();
    implementationMock = Mocks.getPersonService();
    context = new Context({'request': {'response': 'message'}});
    elements = mockMiddleware.middleware;
    implementationMock.list = Spy.resolve('test');
    implementation = {'class': implementationMock, 'name': 'list'};
    functionIterator = new FunctionIterator(elements, context, implementation);
    nextMiddlewareFn = (context, next) => {
      return next();
    };
  });

  describe('constructor', () => {
    it('should create a FunctionIterator instance', () => {
      expect(functionIterator instanceof FunctionIterator).toBeTruthy();
    });

    it('should receive an array of elements', () => {
      expect(functionIterator._elements).toEqual(elements); // eslint-disable-line
    });

    it('should receive context', () => {
      expect(functionIterator._context).toEqual(context); // eslint-disable-line
    });

    it('should receive the implementation', () => {
      expect(functionIterator._implementation).toEqual(implementation); // eslint-disable-line
    });

    describe('when no array is passed', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator(); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: An array of elements is required'));
      });
    });

    describe('when the elements passed are not an array', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator({}); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: An array of elements is required'));
      });
    });

    describe('when no context is passed', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator(elements); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: A context is required'));
      });
    });

    describe('when context passed is not an instance of Context', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator(elements, {}); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: A context is required'));
      });
    });

    describe('when no implementation is passed', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator(elements, context); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: A implementation is required'));
      });
    });

    describe('when implementation passed is not an object', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator(elements, context, 'error'); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: A implementation is required'));
      });
    });

    describe('when implementation does not have properties required', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator(elements, context, {}); // eslint-disable-line
        }).toThrow(new
          Error('Could not create iterator: Implementation needs class and name properties'));
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
      functionIterator.next();
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
        functionIterator.next();
      });

      it('should return the context response', (done) => {
        elements[0].method.and.callFake((context, next) => {
          next().then((result) => {
            expect(result).toEqual(expectedResponse);
            done();
          });
        });
        functionIterator.next();
      });

      describe('and also call next()', () => {
        it('should not call the next middleware', (done) => {
          elements[0].method.and.callFake((context, next) => {
            context.send(expectedResponse);
            next();
          });
          functionIterator.next().then(() => {
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
          functionIterator.next().then((result) => {
            expect(result).toEqual(expectedResponse2);
            done();
          });
        });
      });
    });

    describe('when all middleware are executed', () => {
      let expectedObject;

      beforeEach(() => {
        expectedObject = {'message': 'Listing'};
        implementationMock.list = Spy.returnValue(expectedObject);
        implementation = {'class': implementationMock, 'name': 'list'};
        functionIterator = new FunctionIterator(elements, context, implementation);
      });

      it('should call the implementation', (done) => {
        functionIterator.next().then(() => {
          expect(implementationMock.list).toHaveBeenCalledTimes(1);
          done();
        });
      });

      describe('when implementation was called', () => {
        it('should return with an object', (done) => {
          const expectedObject = {'message': 'Listing'};
          implementationMock.list = Spy.returnValue(expectedObject);
          implementation = {'class': implementationMock, 'name': 'list'};
          functionIterator = new FunctionIterator(elements, context, implementation);
          functionIterator.next().then((result) => {
            expect(result).toEqual(new Response(expectedObject));
            done();
          });
        });

        it('should return with a Response instance', (done) => {
          const response = new Response({'message': 'Listing'});
          implementationMock.list = Spy.returnValue(response);
          implementation = {'class': implementationMock, 'name': 'list'};
          functionIterator = new FunctionIterator(elements, context, implementation);
          functionIterator.next().then((result) => {
            expect(result instanceof Response).toBeTruthy();
            expect(result).toEqual(response);
            done();
          });
        });

        describe('when throws an error', () => {
          it('should return the error', (done) => {
            implementationMock.list = Spy.throwError('Error');
            implementation = {'class': implementationMock, 'name': 'list'};
            functionIterator = new FunctionIterator(elements, context, implementation);
            functionIterator.next().catch((error) => {
              expect(error).toEqual(new Error('Error'));
              done();
            });
          });
        });

        describe('when returns a promise', () => {
          it('should wait for the promise to resolve and return with the value', (done) => {
            implementationMock.list = Spy.resolve('result');
            functionIterator.next().then((result) => {
              expect(result).toEqual(new Response('result'));
              done();
            });
          });

          it('should wait for the promise to reject and return with the error', (done) => {
            implementationMock.list = Spy.reject('Error');
            functionIterator.next().catch((error) => {
              expect(error).toEqual('Error');
              done();
            });
          });
        });

        it('should return the result to middleware', (done) => {
          elements[0].method.and.callFake((context, next) => {
            return next().then((result) => {
              expect(result).toEqual(new Response(expectedObject));
            });
          });
          functionIterator.next().then((result) => {
            expect(result).toEqual(new Response(expectedObject));
            done();
          });
        });

        it('should prevent extra next calls', (done) => {
          elements[elements.length - 1].method.and.callFake((context, next) => {
            next();
            next();
            next();
            next();
          });
          expect(() => {
            functionIterator.next().then(() => {
              expect(implementationMock.list).toHaveBeenCalledTimes(1);
              done();
            });
          }).not.toThrowError();
        });
      });
    });
  });
});

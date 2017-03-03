const FunctionIterator = require('./functionIterator');
const Mocks = require('../spec/util/mocks');
const Spy = require('../spec/util/spy');
const Context = require('./context');
const Response = require('./response');

/* eslint max-lines: "off" */
describe('FunctionIterator', () => {
  let elements, functionIterator, context, implementationMock, implementation, middleware,
    errorHandlers;

  beforeEach(() => {
    middleware = Mocks.getMiddleware().middleware;
    errorHandlers = Mocks.getErrorHandler().errorHandlers;
    implementationMock = Mocks.getPersonService();
    context = new Context({'request': {'response': 'message'}});
    elements = {middleware, errorHandlers};
    implementationMock.list = Spy.resolve('test');
    implementation = {'instance': implementationMock, 'name': 'list'};
    functionIterator = new FunctionIterator(elements, context, implementation);
  });

  describe('constructor', () => {
    it('should create a FunctionIterator instance', () => {
      expect(functionIterator instanceof FunctionIterator).toBeTruthy();
    });

    it('should have middleware and errorHandlers defined', () => {
      expect(functionIterator._middleware).toEqual(middleware); // eslint-disable-line
      expect(functionIterator._errorHandlers).toEqual(errorHandlers); // eslint-disable-line
    });

    it('should receive context', () => {
      expect(functionIterator._context).toEqual(context); // eslint-disable-line
    });

    it('should receive the implementation', () => {
      expect(functionIterator._implementation).toEqual(implementation); // eslint-disable-line
    });

    describe('when no object is passed', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator(); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: ' +
          'Elements object is required'));
      });
    });

    describe('when the elements passed are not an object', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator(2); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: Elements object is required'));
      });
    });

    describe('when the elements do not have a middleware nor errorHandlers property', () => {
      it('should throw an error', () => {
        expect(() => {
          new FunctionIterator({}); // eslint-disable-line
        }).toThrow(new Error('Could not create iterator: ' +
          'Elements need middleware or errorHandlers property'));
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
          Error('Could not create iterator: Implementation needs instance and name properties'));
      });
    });
  });

  describe('next()', () => {
    it('should execute the next middleware of the array', (done) => {
      middleware[3].method.and.callFake(() => {
        expect(middleware[0].method).toHaveBeenCalledTimes(1);
        expect(middleware[1].method).toHaveBeenCalledTimes(1);
        expect(middleware[2].method).toHaveBeenCalledTimes(1);
        expect(middleware[3].method).toHaveBeenCalledTimes(1);
      });
      functionIterator.next().then(done);
    });

    describe('when a middleware send a response', () => {
      let expectedResponse;

      beforeEach(() => {
        expectedResponse = new Response('resolving');
        middleware[1].method.and.callFake((context) => {
          context.send(expectedResponse);
        });
      });

      it('should not call other middleware', (done) => {
        middleware[0].method.and.callFake((context, next) => {
          return next().then(() => {
            expect(middleware[0].method).toHaveBeenCalled();
            expect(middleware[1].method).toHaveBeenCalled();
            expect(middleware[2].method).not.toHaveBeenCalled();
          });
        });
        functionIterator.next().then(done);
      });

      it('should return the context response', (done) => {
        middleware[0].method.and.callFake((context, next) => {
          return next().then((result) => {
            expect(result).toEqual(expectedResponse);
          });
        });
        functionIterator.next().then(done);
      });

      describe('and also call next()', () => {
        it('should not call the next middleware', (done) => {
          middleware[0].method.and.callFake((context, next) => {
            context.send(expectedResponse);
            return next();
          });
          functionIterator.next().then(() => {
            expect(middleware[1].method).not.toHaveBeenCalled();
            done();
          });
        });
      });

      describe('and a previous middleware changes the response', () => {
        it('should return the changed response', (done) => {
          const expectedResponse2 = new Response('changing');
          middleware[1].method.and.callFake((context, next) => {
            return next().then((result) => {
              expect(result).toEqual(expectedResponse);
              context.send(expectedResponse2);
            });
          });
          middleware[2].method.and.callFake((context) => {
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
      });

      it('should call the implementation', (done) => {
        functionIterator.next().then(() => {
          expect(implementationMock.list).toHaveBeenCalledTimes(1);
          done();
        });
      });

      describe('and implementation was called', () => {
        let response;

        beforeEach(() => {
          functionIterator = new FunctionIterator(
            {middleware, 'errorHandlers': []}, context, implementation);
          response = new Response(expectedObject);
        });

        it('should return with an object', (done) => {
          functionIterator.next().then((result) => {
            expect(result).toEqual(response);
            done();
          });
        });

        it('should return with a Response instance', (done) => {
          implementationMock.list = Spy.returnValue(response);
          functionIterator.next().then((result) => {
            expect(result instanceof Response).toBeTruthy();
            expect(result).toEqual(response);
            done();
          });
        });

        it('should return with an empty object', (done) => {
          implementationMock.list = Spy.returnValue();
          const expectedResponse = new Response();
          functionIterator.next().then((result) => {
            expect(result).toEqual(expectedResponse);
            done();
          });
          implementationMock.list = Spy.resolve();
          functionIterator.next().then((result) => {
            expect(result).toEqual(expectedResponse);
            done();
          });
        });

        describe('but throws an error', () => {
          it('should return the error on the catch', (done) => {
            const expectedError = new Error('implementation error');
            implementationMock.list = Spy.throwError('implementation error');
            functionIterator = new FunctionIterator(
              {middleware, 'errorHandlers': []}, context, implementation);
            functionIterator.next().then(done.fail).catch((error) => {
              expect(error).toEqual(expectedError);
              done();
            });
          });
        });

        describe('and returns a promise', () => {
          it('should wait for the promise to resolve and return with the value', (done) => {
            implementationMock.list = Spy.resolve(expectedObject);
            functionIterator.next().then((result) => {
              expect(result).toEqual(response);
              done();
            });
          });

          it('should wait for the promise to reject and return with the error', (done) => {
            implementationMock.list = Spy.reject('Error');
            functionIterator.next().then(done.fail).catch((error) => {
              expect(error).toEqual('Error');
              done();
            });
          });
        });

        it('should return the result to middleware', (done) => {
          middleware[0].method.and.callFake((context, next) => {
            return next().then((result) => {
              expect(result).toEqual(response);
            });
          });
          functionIterator.next().then(done);
        });

        it('should prevent extra next calls', (done) => {
          middleware[middleware.length - 1].method.and.callFake((context, next) => {
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

    describe('when middleware creates an error', () => {
      let expectedError;

      beforeEach(() => {
        expectedError = new Error('middleware error');
        functionIterator = new FunctionIterator(
          {middleware, 'errorHandlers': []}, context, implementation);
        middleware[0].method.and.callFake((context, next) => {
          return next(expectedError);
        });
      });

      it('should return on the catch', (done) => {
        functionIterator.next().then(done.fail).catch((error) => {
          expect(error).toEqual(expectedError);
          done();
        });
      });

      describe('and a middleware handles the error', () => {
        it('should return on the middleware catch', (done) => {
          middleware[0].method.and.callFake((context, next) => {
            return next(expectedError).catch((error) => {
              expect(error).toEqual(expectedError);
              done();
            });
          });
          functionIterator.next().catch(done.fail);
        });
      });

      it('should not call next middleware', (done) => {
        functionIterator.next().then(done.fail).catch(() => {
          expect(middleware[1].method).not.toHaveBeenCalled();
          expect(middleware[2].method).not.toHaveBeenCalled();
          expect(middleware[3].method).not.toHaveBeenCalled();
          done();
        });
      });
    });

    describe('when middleware throws an error', () => {
      describe('and error handlers are not defined', () => {
        let expectedError;

        beforeEach(() => {
          expectedError = new Error('middleware error');
          middleware[0].method = Spy.throwError('middleware error');
          elements = {middleware, 'errorHandlers': []};
          functionIterator = new FunctionIterator(elements, context, implementation);
        });

        describe('and no middleware is handling the error', () => {
          it('should return error on the catch', (done) => {
            functionIterator.next().then(done.fail).catch((error) => {
              expect(error).toEqual(expectedError);
              done();
            });
          });
        });

        describe('and a middleware is handling the error', () => {
          it('should return error on middleware catch', (done) => {
            middleware[1].method = Spy.throwError('middleware error');
            middleware[0].method.and.callFake((context, next) => {
              return next().catch((error) => {
                expect(error).toEqual(expectedError);
                done();
              });
            });
            functionIterator.next();
          });
        });
      });
    });

    describe('when error handlers are defined', () => {
      let expectedError;

      beforeEach(() => {
        expectedError = new Error('Error handler');
        implementationMock.list = Spy.throwError('Error handler');
        functionIterator = new FunctionIterator(elements, context, implementation);
      });

      it('should call the first error handler', (done) => {
        errorHandlers[0].method.and.callFake(() => {
          expect(errorHandlers[0].method).toHaveBeenCalledTimes(1);
          done();
        });
        functionIterator.next();
      });

      it('should call the error handler with the error', (done) => {
        errorHandlers[0].method.and.callFake((error) => {
          expect(error).toEqual(expectedError);
          done();
        });
        functionIterator.next();
      });

      describe('but error is propagated', () => {
        beforeEach(() => {
          middleware[0].method = Spy.throwError('Error handler');
        });

        it('should return the error on global catch', (done) => {
          functionIterator.next().then(done.fail).catch((error) => {
            expect(error).toEqual(expectedError);
            done();
          });
        });

        it('should not call next middleware', (done) => {
          functionIterator.next().then(done.fail).catch(() => {
            expect(middleware[1].method).not.toHaveBeenCalled();
            expect(middleware[middleware.length - 1].method).not.toHaveBeenCalled();
            done();
          });
        });

        it('should not call implementation', (done) => {
          functionIterator.next().then(done.fail).catch(() => {
            expect(implementationMock.list).not.toHaveBeenCalled();
            done();
          });
        });

        it('should call all error handlers with same error', (done) => {
          functionIterator.next().then(done.fail).catch(() => {
            errorHandlers.forEach((errorHandler) => {
              expect(errorHandler.method).toHaveBeenCalledTimes(1);
              expect(errorHandler.method).toHaveBeenCalledWith(
                expectedError, context, jasmine.any(Function));
            });
            done();
          });
        });

        describe('when error handler changes the error', () => {
          let expectedError2;

          beforeEach(() => {
            expectedError2 = new Error('Error handler 2');
          });

          it('should return the new error on global catch', (done) => {
            errorHandlers[1].method.and.callFake((error, context, next) => {
              return next(expectedError2);
            });
            functionIterator.next().then(done.fail).catch((error) => {
              expect(error).toEqual(expectedError2);
              done();
            });
          });

          it('should receive the new error', (done) => {
            errorHandlers[1].method.and.callFake((error, context, next) => {
              return next(expectedError2);
            });
            functionIterator.next().then(done.fail).catch(() => {
              expect(errorHandlers[2].method).toHaveBeenCalledWith(
                expectedError2, context, jasmine.any(Function));
              expect(errorHandlers[errorHandlers.length - 1].method).toHaveBeenCalledWith(
                expectedError2, context, jasmine.any(Function));
              done();
            });
          });

          describe('throwing a new error', () => {
            beforeEach(() => {
              errorHandlers[0].method = Spy.throwError('Error handler 2');
            });

            it('should return the new error on global catch', (done) => {
              functionIterator.next().then(done.fail).catch((error) => {
                expect(error).toEqual(expectedError2);
                done();
              });
            });

            it('should receive the new error', (done) => {
              functionIterator.next().then(done.fail).catch(() => {
                expect(errorHandlers[2].method).toHaveBeenCalledWith(
                  expectedError2, context, jasmine.any(Function));
                expect(errorHandlers[errorHandlers.length - 1].method).toHaveBeenCalledWith(
                  expectedError2, context, jasmine.any(Function));
                done();
              });
            });
          });
        });
      });

      describe('and error is handled by them', () => {
        let expectedResponse;

        beforeEach(() => {
          errorHandlers[0].method.and.callFake((error, context, next) => {
            return next();
          });
          expectedResponse = new Response('Error handled');
        });

        describe('when middleware throws an error', () => {
          beforeEach(() => {
            implementationMock.list = Spy.returnValue(expectedResponse);
            middleware[0].method = Spy.throwError('Error handler');
          });

          it('should not call global catch', (done) => {
            functionIterator.next().then(done).catch(done.fail);
          });

          it('should not call next error handlers', (done) => {
            functionIterator.next().then(() => {
              expect(errorHandlers[1].method).not.toHaveBeenCalled();
              expect(errorHandlers[errorHandlers.length - 1].method).not.toHaveBeenCalled();
              done();
            }).catch(done.fail);
          });

          it('should call the next middleware', (done) => {
            middleware[middleware.length - 1].method.and.callFake(() => {
              expect(middleware[1].method).toHaveBeenCalled();
              expect(middleware[middleware.length - 1].method).toHaveBeenCalled();
              done();
            });
            functionIterator.next();
          });

          describe('and a middleware throws an error after recovery', () => {
            it('should not call global catch', (done) => {
              middleware[1].method = Spy.throwError('Error handler');
              functionIterator.next().then((result) => {
                expect(result).toEqual(expectedResponse);
                done();
              }).catch(done.fail);
            });
          });
        });

        describe('when implementation throws an error', () => {
          describe('and handlers do not send a response', () => {
            it('should call global catch', (done) => {
              functionIterator.next().then(done.fail).catch((error) => {
                expect(error).toEqual(new Error('No response send after error was handled'));
                done();
              });
            });

            it('should not call next error handlers', (done) => {
              functionIterator.next().then(done.fail).catch(() => {
                expect(errorHandlers[1].method).not.toHaveBeenCalled();
                expect(errorHandlers[errorHandlers.length - 1].method).not.toHaveBeenCalled();
                done();
              });
            });
          });

          describe('and error handlers send a response', () => {
            beforeEach(() => {
              errorHandlers[0].method.and.callFake((error, context) => {
                context.send(expectedResponse);
              });
            });

            it('should not call global catch and return the result', (done) => {
              functionIterator.next().then((result) => {
                expect(result).toEqual(expectedResponse);
                done();
              }).catch(done.fail);
            });

            it('should return the result on the last middleware called', (done) => {
              middleware[middleware.length - 1].method.and.callFake((context, next) => {
                return next().then((result) => {
                  expect(result).toEqual(expectedResponse);
                  done();
                });
              });
              functionIterator.next();
            });

            it('should not call next error handlers', (done) => {
              functionIterator.next().then(() => {
                expect(errorHandlers[1].method).not.toHaveBeenCalled();
                expect(errorHandlers[errorHandlers.length - 1].method).not.toHaveBeenCalled();
                done();
              }).catch(done.fail);
            });
          });

          describe('and middleware send a response after implementation fails', () => {
            beforeEach(() => {
              middleware[0].method.and.callFake((context, next) => {
                return next().catch(() => {
                  context.send(expectedResponse);
                });
              });
            });

            it('should not call global catch and return the result', (done) => {
              functionIterator.next().then((result) => {
                expect(result).toEqual(expectedResponse);
                done();
              }).catch(done.fail);
            });
          });
        });

        describe('and sends a response', () => {
          it('should return the response', (done) => {
            errorHandlers[0].method.and.callFake((error, context) => {
              context.send(expectedResponse);
            });
            functionIterator.next().then((result) => {
              expect(result).toEqual(expectedResponse);
              done();
            }).catch(done.fail);
          });

          it('should return to the last middleware called', (done) => {
            middleware[1].method = Spy.throwError('Error');
            middleware[0].method.and.callFake((context, next) => {
              return next().then((result) => {
                expect(result).toEqual(expectedResponse);
                done();
              });
            });
            errorHandlers[0].method.and.callFake((error, context) => {
              context.send(expectedResponse);
            });
            functionIterator.next();
          });
        });
      });
    });
  });
});

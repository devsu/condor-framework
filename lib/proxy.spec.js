const Proxy = require('./proxy');
const Mocks = require('../spec/util/mocks');
const Spy = require('../spec/util/spy');
const Promise = require('bluebird');

describe('Proxy:', () => {
  let proxy, personServiceMock;

  beforeEach(() => {
    personServiceMock = Mocks.getPersonService();
    proxy = new Proxy(personServiceMock);
  });

  it('should return an object', () => {
    expect(proxy instanceof Proxy).toBeFalsy();
    expect(proxy instanceof Object).toBeTruthy();
  });

  it('should have a method for each method in the implementation class', () => {
    expect(Object.getOwnPropertyNames(proxy).length).toEqual(2);
    expect(proxy.list).toEqual(jasmine.any(Function));
    expect(proxy.get).toEqual(jasmine.any(Function));

    const greeterServiceMock = Mocks.getGreeterService();
    proxy = new Proxy(greeterServiceMock);
    expect(Object.getOwnPropertyNames(proxy).length).toEqual(2);
    expect(proxy.sayHello).toEqual(jasmine.any(Function));
    expect(proxy.sayGoodbye).toEqual(jasmine.any(Function));
  });

  describe('each method', () => {
    let call, callback;

    beforeEach(() => {
      call = {'a': 1};
      callback = Spy.create('callback');
    });

    it('should call the corresponding method of the service implementation', () => {
      proxy.list(call, callback);
      expect(personServiceMock.list).toHaveBeenCalledTimes(1);
      expect(personServiceMock.list).toHaveBeenCalledWith(call);
    });

    describe('implementation method does not return a promise', () => {
      it('should callback with the result', () => {
        personServiceMock.list = Spy.returnValue('anything');
        proxy.list(call, callback);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(null, 'anything');
      });
    });

    describe('implementation method returns a promise', () => {
      describe('resolve', () => {
        it('should wait for the promise and callback with the result', (done) => {
          personServiceMock.list = Spy.resolve('anything');
          proxy.list(call, callback);
          setTimeout(() => {
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(null, 'anything');
            done();
          });
        });
      });

      describe('reject', () => {
        it('should wait for the promise and callback with the error', (done) => {
          const error = {
            'code': 101,
            'details': 'whatever',
          };
          personServiceMock.list = Spy.reject(error);
          proxy.list(call, callback);
          setTimeout(() => {
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(error);
            done();
          });
        });
      });
    });

    describe('implementation method returns a Bluebird promise', () => {
      it('should wait for the promise and callback with the result', (done) => {
        personServiceMock.list = Spy.returnValue(Promise.resolve('anything'));
        proxy.list(call, callback);
        setTimeout(() => {
          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(null, 'anything');
          done();
        });
      });
    });
  });
});

const grpc = require('grpc');
const Spy = require('jasmine-spy');
const Context = require('./context');
const Response = require('./response');

describe('Context:', () => {
  let call, context, properties;
  const expectedResponse = new Response('message');
  const response = new Response('message');
  const metadata = new grpc.Metadata();
  const message = {'message': 'message'};

  beforeEach(() => {
    call = {
      'request': {'id': '1', 'name': 'name'},
      'metadata': new grpc.Metadata(),
      'write': (object) => {
        return object;
      },
      'on': (object) => {
        return object;
      },
      'end': (object) => {
        return object;
      },
    };
    properties = {
      'methodName': 'methodName',
      'serviceFullName': 'myapp.MyService',
      'methodFullName': 'myapp.MyService.methodName',
      'whatever': 'else',
    };
    context = new Context(call, properties);
  });

  describe('constructor', () => {
    it('should create a Context instance', () => {
      expect(context instanceof Context).toBeTruthy();
    });

    it('should create a Context with a call object', () => {
      expect(context.call).toBe(call);
    });

    it('should create a Context with properties', () => {
      expect(context.properties).toEqual(properties);
    });

    it('should have a send method', () => {
      expect(context.send).toEqual(jasmine.any(Function));
    });
  });

  describe('send()', () => {
    it('should receive a Response object', () => {
      spyOn(context, 'send');
      context.send(response);
      expect(context.send).toHaveBeenCalledTimes(1);
      expect(context.send).toHaveBeenCalledWith(response);
    });

    it('should receive message object and metadata', () => {
      spyOn(context, 'send');
      context.send(message, metadata);
      expect(context.send).toHaveBeenCalledWith(message, metadata);
      context.send('message', metadata);
      expect(context.send).toHaveBeenCalledWith('message', metadata);
      expect(context.send).toHaveBeenCalledTimes(2);
    });

    it('should set the response object', () => {
      context.send(response);
      expect(context.getResponse()).toEqual(expectedResponse);
      context.send(message, metadata);
      expect(context.getResponse()).toEqual(new Response(message, metadata));
    });

    describe('when no metadata is passed', () => {
      it('should not throw error', () => {
        expect(() => {
          context.send('message');
        }).not.toThrowError();
      });
    });
  });

  describe('.request', () => {
    it('should return call request object', () => {
      expect(context.request).toEqual(call.request);
    });
  });

  describe('.metadata', () => {
    it('should return call metadata', () => {
      expect(context.metadata).toEqual(call.metadata);
    });
  });

  describe('.write()', () => {
    it('should call call.write() and return its response', () => {
      call.write = Spy.returnValue('the result');
      const actualResult = context.write('whatever', 'arguments');
      expect(call.write).toHaveBeenCalledTimes(1);
      expect(call.write).toHaveBeenCalledWith('whatever', 'arguments');
      expect(actualResult).toEqual('the result');
    });
  });

  describe('.on()', () => {
    it('should call call.on() and return its response', () => {
      call.on = Spy.returnValue('the result');
      const actualResult = context.on('whatever', 'arguments');
      expect(call.on).toHaveBeenCalledTimes(1);
      expect(call.on).toHaveBeenCalledWith('whatever', 'arguments');
      expect(actualResult).toEqual('the result');
    });
  });

  describe('.end()', () => {
    it('should call call.end() and return its response', () => {
      call.end = Spy.returnValue('the result');
      const actualResult = context.end('whatever', 'arguments');
      expect(call.end).toHaveBeenCalledTimes(1);
      expect(call.end).toHaveBeenCalledWith('whatever', 'arguments');
      expect(actualResult).toEqual('the result');
    });
  });
});

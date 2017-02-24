const grpc = require('grpc');
const Context = require('./context');
const Response = require('./response');

describe('Context:', () => {
  let call, context;
  beforeEach(() => {
    call = {
      'request': {'id': '1', 'name': 'name'},
      'metadata': new grpc.Metadata(),
    };
    context = new Context(call);
  });

  describe('constructor', () => {
    it('should create a Context instance', () => {
      expect(context instanceof Context).toBeTruthy();
    });

    it('should create a Context with a call object', () => {
      expect(context.call).toBe(call);
    });

    it('should have a send method', () => {
      expect(context.send).toEqual(jasmine.any(Function));
    });
  });

  describe('send()', () => {
    it('can receive a Response object', () => {
      const expectedResponse = new Response('message');
      spyOn(context, 'send');
      context.send(expectedResponse);
      expect(context.send).toHaveBeenCalledTimes(1);
      expect(context.send).toHaveBeenCalledWith(expectedResponse);
    });

    it('can receive message object and metadata', () => {
      const expectedMessage = {'message': 'message'};
      const metadata = new grpc.Metadata();
      spyOn(context, 'send');
      context.send(expectedMessage, metadata);
      expect(context.send).toHaveBeenCalledWith(expectedMessage, metadata);
      context.send('message', metadata);
      expect(context.send).toHaveBeenCalledWith('message', metadata);
      expect(context.send).toHaveBeenCalledTimes(2);
    });

    it('should set the response object', () => {
      const expectedResponse = new Response('message');
      context.send(expectedResponse);
      expect(context.getResponse()).toEqual(expectedResponse);
      const expectedMessage = {'message': 'message'};
      const metadata = new grpc.Metadata();
      context.send(expectedMessage, metadata);
      expect(context.getResponse()).toEqual(new Response(expectedMessage, metadata));
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
});

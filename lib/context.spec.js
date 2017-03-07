const grpc = require('grpc');
const Context = require('./context');
const Response = require('./response');

describe('Context:', () => {
  let call, context;
  const expectedResponse = new Response('message');
  const metadata = new grpc.Metadata();
  const expectedMessage = {'message': 'message'};

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
    it('should receive a Response object', () => {
      spyOn(context, 'send');
      context.send(expectedResponse);
      expect(context.send).toHaveBeenCalledTimes(1);
      expect(context.send).toHaveBeenCalledWith(expectedResponse);
    });

    it('should receive message object and metadata', () => {
      spyOn(context, 'send');
      context.send(expectedMessage, metadata);
      expect(context.send).toHaveBeenCalledWith(expectedMessage, metadata);
      context.send('message', metadata);
      expect(context.send).toHaveBeenCalledWith('message', metadata);
      expect(context.send).toHaveBeenCalledTimes(2);
    });

    it('should set the response object', () => {
      context.send(expectedResponse);
      expect(context.getResponse()).toEqual(expectedResponse);
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

  describe('.write()', () => {
    it('should return call write function', () => {
      expect(context.write).toEqual(call.write);
    });
  });

  describe('.on()', () => {
    it('should return call on function', () => {
      expect(context.on).toEqual(call.on);
    });
  });

  describe('.end()', () => {
    it('should return call end function', () => {
      expect(context.end).toEqual(call.end);
    });
  });
});

# GRPC Requests 

A GRPC call can have 3 different types of request to establish a communication between the server 
and the client. 

## Types of requests

- [Simple](#simple) 
- [Unidirectional streams](#unidirectional-streams) 
- [Bidirectional streams](#bidirectional-streams)

### Simple

The simple request is when the server and client only make a request with an object. 

The `.proto` file should be defined like this:

```proto
syntax = "proto3";

package myapp;

message Message {
  string message = 1;
}

service RepeaterService  {
  rpc Simple (Message) returns (Message) { }
}
```

And class implementation should look like this:

```js
class RepeaterService {
  simple(ctx) {
    return this._buildResponse(ctx.req.message);
  }
 
  _buildResponse(message) {
    return {'message': `You sent: '${message}'.`};
  }
}
```

### Unidirectional streams

The unidirectional streams used when on side of the communication can receive more than one response.
They can be from client to server or from server to client.

The `.proto` file should be defined like this:

```proto
syntax = "proto3";

package myapp;

message Message {
  string message = 1;
}

service RepeaterService  {
  rpc StreamToServer (stream Message) returns (Message) { }
  rpc StreamToClient (Message) returns (stream Message) { }
}
```

And class implementation should look like this:

```js
class RepeaterService {
  streamToServer(ctx) {
    let messages = '';
    return new Promise((resolve) => {
      ctx.on('data', (data) => {
        messages = messages.concat(data.message);
      });
      ctx.on('end', () => {
        resolve(this._buildResponse(messages));
      });
    });
  }

  streamToClient(ctx) {
    const message = ctx.req.message;
    ctx.write(this._buildResponse(message));
    ctx.write(this._buildResponse(message));
    ctx.end();
  }
 
  _buildResponse(message) {
    return {'message': `You sent: '${message}'.`};
  }
}
```

### Bidirectional streams

The bidirectional streams is used when both sides of the communication can receive more than one response.

The `.proto` file should be defined like this:

```proto
syntax = "proto3";

package myapp;

message Message {
  string message = 1;
}

service RepeaterService  {
  rpc BidirectionalStream (stream Message) returns (stream Message) { }
}
```

And class implementation should look like this:

```js
class RepeaterService {
  bidirectionalStream(ctx) {
    ctx.on('data', (data) => {
      ctx.write(this._buildResponse(data.message));
    });
    ctx.on('end', () => {
      ctx.end();
    });
  }

  _buildResponse(message) {
    return {'message': `You sent: '${message}'.`};
  }
}
```

The properties and methods provided by the [context](context) object are documented in the next pages.

Next: [Middleware](middleware)

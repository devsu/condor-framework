# node-grpc-server
Minimalist framework for building GRPC services is Node JS. ES6. Status: Documentation draft.

```ecmascript 6
const GrpcServer = require('grpc-server');
const app = new GrpcServer();
 
class Greeter {
  sayHello(call, callback) {
    callback({'greeting': 'Hello ' + call.request.name });
  }
}

app.registerServices('./protos/greeter.proto', 'myapp.Greeter', new Greeter());
app.listen(3000);
```

## Installation

```bash
npm install grpc-server
```

## Features

- Focus on simplicity and high performance
- Super-high test coverage
- Middleware (not using interceptors for now, since [they are not available for node](https://github.com/grpc/grpc/issues/8394), but will use them when available)

## Quick start

Before start, we recommend you to get familiar with [GRPC](http://www.grpc.io/).

1. Create the app

```bash
mkdir my-app
cd my-app
npm init
```

2. Add the dependencies

```bash
npm i --save grpc-server
```

3. If you don't have it, create your proto file. (e.g. `protos/greeter.proto`)

```proto
syntax = "proto3";

package myapp;

message Person {
  string name = 1;
}

message Greeting {
  string greeting = 1;
}

service Greeter {
  rpc sayHello (Person) returns (Greeting) { }
}
```

4. Add the code to your start script (e.g. `index.js`)

```ecmascript 6
const GrpcServer = require('grpc-server');
const app = new GrpcServer();
 
class Greeter {
  sayHello(call) {
    let response = { 'greeting': 'Hello ' + call.request.name };
    return Promise.resolve(response);
  }
}

app.registerServices('./protos/greeter.proto', new Greeter());
app.listen(3000);
```

5. Run your app

```bash
node index.js
```

6. To test your app with a client. 

- Add required dependencies

```bash
npm i --save grpc
```

- On another file (e.g. `client.js`) add the following lines:

```ecmascript 6
var greeterProto = grpc.load('./protos/greeter.proto');
var client = new greeterProto.myapp.Greeter('127.0.0.1:3000', grpc.credentials.createInsecure());

function sayHello(person) {
  client.sayHello(person, function(error, greeting) {
    if (error) {
      console.log(error);
      return;
    }
    console.log(greeting);
  });
}

sayHello({ 'name': 'Peter Pan' });
```

- Execute the client (on another terminal, while server is running)

```bash
node client.js
```

## Credentials for Server Authentication

GRPC has a built in gRPC mechanisms for server [authentication](http://www.grpc.io/docs/guides/auth.html).

On production you should use SSL/TLS, but during development, it might be fine to have an insecure environment.

### No encryption / authentication

This is recommended only during development.

```ecmascript 6
app.listen(3000);
```

### Server authentication SSL/TLS

```ecmascript 6
const options= {
  'host': 'myservice.example.com',
  'port': 3000,
  'certs': root_certs,
};
app.listen(options);
```

You will want this configuration for production, but most of the times, you will want an insecure environment in your local, to avoid configure certificates and hosts on every developer machine.
 
We have you covered. If you pass the `insecure` option, it will create an insecure channel when they match `NODE_ENV` environment variable. 
 
```ecmascript 6
const options= {
  'host': 'myservice.example.com',
  'insecure': ['development', 'qa'],
  'port': 3000,
  'certs': root_certs,
};
app.listen(options);
``` 

In the example, if `NODE_ENV=development` or `NODE_ENV=qa`, it will create an insecure channel, but it will create a secure channel otherwise.

### Call Credentials

You can also pass your own call credentials, to be combined with the channel credentials.

```ecmascript 6
const options= {
  'host': 'myservice.example.com',
  'port': 3000,
  'certs': root_certs,
  'callCredentials': call_credentials,
};
app.listen(options);
``` 

### Authenticate with Google

GRPC has built-in Google authentication. This is useful for example if you are using [Google Compute Engine](https://cloud.google.com/compute/).

The [Google Authentication example](http://www.grpc.io/docs/guides/auth.html#authenticate-with-google-5) in the gRPC documentation, would become:

```ecmascript 6
const options= {
  'host': 'myservice.example.com',
  'port': 3000,
  'certs': root_certs,
  'enableGoogleAuthentication': true,
};
app.listen(options);
```

## Middleware

You can add custom middleware that is executed before the request is served. The middleware function must return a promise.

### How to use

```ecmascript 6
const app = new GrpcServer();
const scope = 'myapp';
app.use(scope, async function(call, callback) {
  console.log('Request:', call.request);
});
```

### Scope

When a scope argument is not provided the function is executed for every request.

```ecmascript 6
app.use(async function (call) {
  console.log('Request:', call.request);
});
```

Scope can be a package name. 

```ecmascript 6
app.use('myapp', async function (call) {
  // Will execute for every request to the services in the `myapp` package.
  console.log('Request:', call.request);
});
```

Or a service name. 

```ecmascript 6
app.use('myapp.Greeter', async function (call) {
  // will execute for any request to any method of the `Greeter` service of the `myapp` package.
  console.log('Request:', call.request);
});
```

Or a specific method name.

```ecmascript 6
app.use('myapp.Greeter.sayHello', async function (call) {
  // will execute for every request to the myapp.Greeter.sayHello method.
  console.log('Request:', call.request);
});
```

### Throwing errors

If you need to stop the chain and respond with an error immediately, you can just throw the error.
 
**TODO:** Investigate how to respond with the GRPC Error codes, and change the code below to match it.
 
```ecmascript 6
app.use(async function (call) {
  throw new Error('Error message', ErrorCode);
});
```

### Respond immediately and finish the callback chain

You can use callback to respond to the client immediately, and you can resolve with `false` to finish the callback chain.

```ecmascript 6
const Promise = require('bluebird');
app.use('myapp.Greeter.sayHello', function (call, callback) {
  let response = { 'a': 1 };
  callback(null, response);
  return Promise.resolve(false);
});
```
### Promises vs async/await syntax

Promises and async/await are basically the same under the hood, but let's clarify how it would look if we use one or the other approach.

#### Promises syntax

**TODO:** All the code below haven't been tested!

```ecmascript 6
const app = new GrpcServer();
const Promise = require('bluebird');

app.use(function (call, callback) {
  
  if (call.request.desiredAction === 'Finish the chain, and reject the call with an error') {
    throw new Error('My error message', ErrorCode);
  }
  
  if (call.request.desiredAction === 'respond and finish middleware chain immediately') {
    let response = { 'a': 1 };
    callback(null, response); // respond to client
    return Promise.resolve(false); // do not call next middleware
  }
  
  // execute something and continue to next middleware 
  console.log('Continue to next middleware');
  return Promise.resolve();
});
```

**Tip:** If you use promises, use [Bluebird](http://bluebirdjs.com/docs/getting-started.html) instead of native promises, since [it has a better performance](http://softwareengineering.stackexchange.com/questions/278778/why-are-native-es6-promises-slower-and-more-memory-intensive-than-bluebird#answer-279003).

#### async/await syntax:

```ecmascript 6
const app = new GrpcServer();

app.use(async function (call, callback) {
  
  if (call.request.desiredAction === 'Finish the chain, and reject the call with an error') {
    throw new Error('My error message', ErrorCode);
  }
  
  if (call.request.desiredAction === 'respond and finish middleware chain immediately') {
    let response = { 'a': 1 };
    callback(null, response); // respond to client
    return false; // do not call next middleware // TODO: I don't know if this works
  }
  
  // just execute something and continue to next middleware 
  console.log('Continue to next middleware');
});
```

## Automatic CRUD methods

One of the most powerful features of this method is that you can 

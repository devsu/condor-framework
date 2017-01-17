# Condor Framework

Minimalist, fast framework for building GRPC services in Node JS.

**Status**: Documentation draft, receiving feedback.

## How to use

```js
const Condor = require('condor-framework');

class Greeter {
  sayHello(call) {
    return { 'greeting': 'Hello ' + call.request.name };
  }
}

const logger = (call) => {
  console.log('Request:', call.request);
};

const app = new Condor()
  .addService('./protos/greeter.proto', 'myapp.Greeter', new Greeter())
  .addMiddleware('myapp', logger)
  .start();
```

## Installation

```bash
npm install --save condor-framework
```

## Highlights

- Focus on simplicity and high performance
- Fully covered by tests
- Promise based, which means **no callbacks**
- Written using, and design for **ES6**

## Current Features

- [Server Authentication Support](#server-authentication-support)
- [Middleware](#middleware) (not using interceptors for now, since [they are not available for node](https://github.com/grpc/grpc/issues/8394), but will use them when available)
- [Error Handlers](#error-handlers)

## Roadmap

Possible features that will come:

- Generators
- Connectors for Persistence Providers
- Automatic "CRUD" methods creation

## Quick start

Before start, we recommend you to get familiar with [GRPC](http://www.grpc.io/).

1. Create your app

  ```bash
  mkdir my-app
  cd my-app
  npm init
  ```

2. Add the dependencies

  ```bash
  npm i --save condor-framework
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

  ```js
  const Condor = require('condor-framework');
   
  class Greeter {
    sayHello(call) {
      return { 'greeting': 'Hello ' + call.request.name };
    }
  }
  
  const app = new Condor()
    .addService('./protos/greeter.proto', new Greeter())
    .start();
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
  
  - On your client start script (e.g. `client.js`) add the following lines:
  
    ```js
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

## Features

### Server Authentication Support

GRPC has some built-in mechanisms for server [authentication](http://www.grpc.io/docs/guides/auth.html).

On production you should use SSL/TLS, but during development, it might be fine to have an insecure environment.

#### No encryption / authentication

This is recommended only during development.

```js
app.start();
```

#### Server authentication SSL/TLS

It is always recommended that your service implements SSL/TLS on a production environment.

```js
const options= {
  'host': 'myservice.example.com',
  'port': 3000,
  'certs': root_certs,
};
app.start(options);
```

#### Call Credentials

You can also pass your own call credentials, to be combined with the channel credentials.

```js
const options= {
  'host': 'myservice.example.com',
  'port': 3000,
  'certs': root_certs,
  'callCredentials': call_credentials,
};
app.start(options);
``` 

#### Authenticate with Google

GRPC has built-in Google authentication. This is useful for example if you are using [Google Compute Engine](https://cloud.google.com/compute/).

The [Google Authentication example](http://www.grpc.io/docs/guides/auth.html#authenticate-with-google-5) in the gRPC documentation, would become:

```js
const options= {
  'host': 'myservice.example.com',
  'port': 3000,
  'certs': root_certs,
  'enableGoogleAuthentication': true,
};
app.listen(options);
```

### Middleware

You can add custom middleware that is executed before the request is served. The middleware function must return a promise.

#### How to use

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  console.log('Request:', call.request);
});
```

If the middleware method return a **promise**, Condor will wait for the promise to be fulfilled before continuing to the next middleware.

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  return new Promise((resolve) => {
    console.log('Request:', call.request);
    resolve();
  });
});
```

#### Scope

When a scope argument is not provided the function is executed for every request.

```js
app.addMiddleware((call) => {
  console.log('Request:', call.request);
});
```

Scope can be a package name. 

```js
app.addMiddleware('myapp', (call) => {
  // Will execute for every request to the services in the `myapp` package.
  console.log('Request:', call.request);
});
```

Or a service name. 

```js
app.addMiddleware('myapp.Greeter', (call) => {
  // will execute for any request to any method of the `Greeter` service of the `myapp` package.
  console.log('Request:', call.request);
});
```

Or a specific method name.

```js
app.addMiddleware('myapp.Greeter.sayHello', (call) => {
  // will execute for every request to the myapp.Greeter.sayHello method.
  console.log('Request:', call.request);
});
```

#### Responding with error

If you need to stop the chain and respond with an error immediately, you can just throw the error (or reject a promise).
  
```js
// throw an error
app.addMiddleware(() => {
  const error = new Error('Error message');
  error.code = grpc.status.PERMISSION_DENIED;
  throw error;
});

// Reject a promise
app.addMiddleware(() => {
  return Promise.reject({
    'code': grpc.status.PERMISSION_DENIED,
    'details': 'You do not have permissions',
  });
});
```

### Error handlers

You can add one or many error handlers to your app.

#### How to use

```js
const app = new Condor();
const scope = 'myapp';
app.addErrorHandler(scope, function(err, call) {
  console.error('Something went wrong', call.request);
});
```

If the middleware method return a **promise**, Condor will wait for the promise to be fulfilled before continuing to the next middleware.

```js
const app = new Condor();
const scope = 'myapp';
app.addErrorHandler(scope, function(call) {
  return new Promise((resolve) => {
    console.error('Something went wrong', call.request);
    resolve();
  });
});
```

#### Scope

When a scope argument is not provided the function is executed for every request.

```js
app.addErrorHandler((call) => {
  console.error('Something went wrong', call.request);
});
```

Scope can be a package name. 

```js
app.addErrorHandler('myapp', (call) => {
  // Will catch errors of any services in the `myapp` package.
  console.error('Something went wrong', call.request);
});
```

Or a service name. 

```js
app.addErrorHandler('myapp.Greeter', (call) => {
  // will catch errors of any methods of the `Greeter` service of the `myapp` package.
  console.error('Something went wrong', call.request);
});
```

Or a specific method name.

```js
app.addErrorHandler('myapp.Greeter.sayHello', (call) => {
  // will catch errors of the myapp.Greeter.sayHello method.
  console.error('Something went wrong', call.request);
});
```

## Credits & License

Developed by the gRPC & node experts at [Devsu](https://devsu.com).

Copyright 2017.

License: **MIT**.

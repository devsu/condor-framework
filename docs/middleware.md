---
title: Middleware
layout: default
---

# Middleware

You can add custom middleware methods, that will be executed before a request is served. 

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  console.log('Request:', call.request);
});
```

## Features

- [Scope](#scope): To determine what packages, services or methods the middleware should be applied to.
- [Controlling the execution flow](#controlling-the-execution-flow): Based on the value that the middleware method returns. 

### Scope

When a scope argument is not provided the middleware is executed for every request.

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

### Controlling the execution flow

The execution flow can be controlled based on what the middleware method returns.

#### Do not affect the execution flow

If the middleware method doesn't return anything, or if it returns a promise that resolves to `undefined`, the execution will continue normally.

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  // Log the request, and continue
  console.log('Request:', call.request);
});
```

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  // Execute an async method, and continue
  return new Promise((resolve) => {
    resolve();
  });
});
```

#### Responding to the user

If the middleware method returns **a value**, or a promise that **resolves to a value** (anything different than `undefined`), Condor will respond to the user with such value, interrupting the execution of the next middleware methods and the actual method implementation.

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  // Respond to the user immediately
  return {'message': 'any value'};
});
```

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  // Respond to the user
  return new Promise((resolve) => {
    resolve({ 'message': 'something' });
  });
});
```

#### Responding to the user with error

If you need to stop the chain and respond with an error immediately, you can just throw the error (or reject a promise).

```js
// throw an error
app.addMiddleware(() => {
  const error = new Error('Error message');
  error.code = grpc.status.PERMISSION_DENIED;
  throw error;
});
```

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  // Respond to the client with error
  return new Promise((resolve, reject) => {
    reject({
      'code': grpc.status.PERMISSION_DENIED,
      'details': 'You do not have permissions',
    });
  });
});
```

Next: [Error Handlers](error-handlers)

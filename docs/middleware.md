---
title: Middleware
layout: default
---

# Middleware

You can add custom middleware methods, that will be executed before a request is served. 

```js
const app = new Condor();
const scope = 'myapp';

app.use(scope, (context, next) => {
  console.log('Request:', context.request);
  return next();
});
```

## Features

- [Scope](#scope): To determine what packages, services or methods the middleware should be applied
 to.
- [Controlling the execution flow](#controlling-the-execution-flow): Based on middleware function. 

### Scope

When a scope argument is not provided the middleware is executed for every request.

```js
app.use((context, next) => {
  console.log('Request:', context.request);
  return next();
});
```

Scope can be a package name. 

```js
app.use('myapp', (context, next) => {
  // Will execute for every request to the services in the `myapp` package
  console.log('Request:', context.request);
  return next();
});
```

Or a service name. 

```js
app.use('myapp.Greeter', (context, next) => {
  // will execute for every request to any method in myapp.Greeter
  console.log('Request:', context.request);
  return next();
});
```

Or a specific method name.

```js
app.use('myapp.Greeter.sayHello', (context, next) => {
  // will execute for every request to the myapp.Greeter.sayHello method
  console.log('Request:', context.request);
  return next();
});
```

### Controlling the execution flow

The execution flow can be controlled returning `next` to call the next middleware or the
implementation. It also can send a response using the `context.send` function.

#### Continue the flow normally

If the middleware method doesn't perform an operation that changes or generates a response only
 return a call to `next` to continue with the normal flow.

```js
app.use(scope, (context, next) => {
  // Log the request, and continue
  console.log('Request:', context.request);
  return next();
});
```

You can also do make changes after a response using the `next.then`, the `next` function
returns a promise so `.catch` is also available when an error is not handled.

```js
app.use(scope, (context, next) => {
  // Log the request, response and continue
  console.log('Request:', context.request);
  return next().then((result) => {
    console.log('Response:', result);
  }).catch((error) => {
    console.log('Logging error', error);
  });
});
```

#### Responding to the user

To send a response to the user use `context.send` method with an object, `next` function doesn't
 need to be called.

```js
app.use(scope, (context) => {
  // Respond to the user, next middleware and implementation are not executed
  context.send({'message': 'any value'});
});
```

You can change the response using `next.then` and use `context.send` to overwrite the response
after it was sent.

```js
app.use(scope, (context, next) => {
  return next().then(() => {
    context.send({'message': 'another value'});
  });
});
```

#### Break execution an go to error handlers

If you need to stop the execution or you found an error, you can just throw the error or 
pass it in `next` function and the error handlers will take care of sending the error 
to the client (If no error handler is defined, it will go to the default global error handler).

```js
// throw an error
app.use(() => {
  const error = new Error('Error message');
  error.code = grpc.status.PERMISSION_DENIED;
  throw error;
});

app.use((context, next) => {
  const error = new Error('Error message');
  error.code = grpc.status.PERMISSION_DENIED;
  return next(error);
});
```

## Middleware parameters

Middleware always receive two parameters:

- [context](#context): This parameter allows the user to access request data, metadata or send a response.
- [next](#next): Continues to the next middleware.

### Context

The `context` parameter is an object with the following properties:

- `call`: Contains the grpc Call object.
- `request`: Shortcut to `call.request`, data sent from the client.
- `metadata`: Shortcut to `call.metadata`, metadata sent from the client.
- `send`: It will send a response to the user, calling this function will complete the flow an 
will return to the user passing the result to every middleware called before the response was 
sent, the result will be on the `next().then`. It receives a `Response` object with two optional
parameters. When the first parameter is not a `Response` it will take any object passed as the 
response object except for an instance of `Metadata`. The second parameters will be the metadata 
that will be sent to the client.

### Next

The `next` parameter is a function used to go to next middleware, it returns a promise with the
result of the flow or the error that caused the flow to break. It also may receive one parameter,
when the first parameter is passed it will be taken as an error and will break the flow to go 
to error handlers explained in the next section.

**Note:** If you don't return the `next` function, all code inside `.then` or `.catch` will run 
independently from the flow after the response is sent.


Next: [Error Handlers](error-handlers)

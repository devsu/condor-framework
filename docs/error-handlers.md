---
title: Error handlers
layout: default
---

# Error handlers

Error handlers are similar to middleware methods. You can add one or many error handlers to your 
app. 

The error handlers are run if an error is thrown, or a parameter is passed to the next function

```js
const app = new Condor();
const scope = 'myapp';

app.addErrorHandler(scope, (error, ctx, next) => {
  console.error('Something went wrong', error);
  console.error('for the request', ctx.req);
  return next(error);
});
```

## Features

Error handlers work exactly as middleware methods but it adds a new parameter to method, the first 
parameter passed to the method will be the error that broke the flow.

You can determine it's scope, and control the execution flow based on what they return. Also the 
error handlers will execute every time the middleware or implementation throws an error before 
the `next()` call or passing a parameter through `next()`.

- See [Middleware: Scope](middleware#scope)
- [Controlling the execution flow](#controlling-the-execution-flow): Based on error handler function.

## Controlling the execution flow

### Send an error to client

You can pass the error to all error handlers just passing the error parameter in the 
`next` function and it will return the error to the client.

```js
app.addErrorHandler((error, ctx, next) => {
  return next(error);
});
```

### Modifying the error response

You can modify the error that will be returned to the user from your error handlers passing the 
new error to the `next()` function or throwing a new error inside the error handler.

```js
app.addErrorHandler((error, ctx, next) => {
  const newError = new Error();
  newError.code = grpc.status.PERMISSION_DENIED;
  newError.details = 'You do not have enough permissions';
  return next(newError);
});

app.addErrorHandler('myapp', () => {
  throw new Error('An error has ocurred');
});
```

The modified error will be passed to the next error handler, and finally to the client.

### Sending a response from error handler

Like the middleware, the error handler can send a response to the user using `context.send` 
function.
 
```js
app.addErrorHandler((error, ctx) => {
  ctx.send({'message': 'There was an application error, please come back later'});
});
```

### Recovering from the error

The error handlers gives you an opportunity to recover from any error that the middleware or the 
implementation caused just calling the `next()` function without any error. It will continue the
execution with the next step of the flow.

```js
app.addErrorHandler((error, ctx, next) => {
  return next();
});
```

## Default error handler

After running all error handlers, the server will respond to the client with the error 
(which can be modified by the handlers).

If the response is a stream, it will emit the `error`.

## Error handlers parameters

Error handlers always receive three parameters:

- [error](#error)
- [context](#context)
- [next](#next)

### Error

The error parameter as his name describe its the error that caused the flow to break.

### Context 

The properties and methods provided by the [context](context) object are documented in the next pages.

### Next

The `next` parameter is a function used to go to next error handler. The error handler must pass
the error in the next function to let the next step handle the error or it can send a
response to the user, not sending the error on the function will recover the flow state and will
execute the next step on the flow.

**Note:** To return the result of `next` function is important to keep the order of the error handlers.
Not writing the `next` function on a return statement can cause an undesirable execution order. 

Next: [Context](context)

---
title: Error handlers
layout: default
---

# Error handlers

Error handlers are similar to middleware methods. You can add one or many error handlers to your app. 

The error handlers are run if an error is thrown, or a promise is rejected from a middleware or from the actual service implementation.

```js
const app = new Condor();
const scope = 'myapp';
app.addErrorHandler(scope, (error, call) => {
  console.error('Something went wrong', error);
  console.error('for the request', call.request);
});
```

## Features

Error handlers work exactly as middleware methods. That is, you can determine it's scope, and control the execution flow based on what they return. 

- See [Middleware: Scope](middleware#scope)
- See [Middleware: Controlling the execution flow](middleware#controlling-the-execution-flow) 

## Modifying the error response

You can modify the error that will be returned to the users from your error handlers.

```js
app.addErrorHandler((error) => {
  error.code = grpc.status.PERMISSION_DENIED;
  error.details = 'You do not have enough permissions';
  // the execution will continue normally to the next error handler
});
```

The modified error will be passed to the next error handler, and finally to the client.

## Default error handler

After running all error handlers, the server will respond to the client with the error (which can be modified by the handlers).

If the response is a stream, it will emit the `error`.

Next: [SSL/TLS Support](ssl-tls)

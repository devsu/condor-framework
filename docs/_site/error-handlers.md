
### Error handlers

You can add one or many error handlers to your app. The error handlers are run if an error is thrown, or a promise is rejected from a middleware or from the actual service implementation.

#### How to use

```js
const app = new Condor();
const scope = 'myapp';
app.addErrorHandler(scope, (error, call) => {
  console.error('Something went wrong', error);
  console.error('for the request', call.request);
});
```

If the error handler returns a **promise that resolves with nothing**, Condor will wait for the promise to be fulfilled before continuing to the next handler.

```js
const app = new Condor();
const scope = 'myapp';
app.addErrorHandler(scope, (error, call) => {
  return new Promise((resolve) => {
    console.error('Something went wrong', error);
    console.error('for the request', call.request);
    resolve();
  });
});
```

If the error handler returns a **promise that resolve with any value**, Condor will stop the error handler chain.

```js
const app = new Condor();
const scope = 'myapp';
app.addErrorHandler(scope, (error, call) => {
  return new Promise((resolve) => {
    console.error('Something went wrong', error);
    console.error('for the request', call.request);
    resolve({ 'message': 'something' });
  });
});
```

If the error handler returns a **promise that rejects**, Condor will stop the error handler chain.

```js
const app = new Condor();
const scope = 'myapp';
app.addErrorHandler(scope, (error, call) => {
  return new Promise((resolve, reject) => {
    console.error('Something went wrong', error);
    console.error('for the request', call.request);
    reject({ 'message': 'something' });
  });
});
```

If the error handler **does not return anything**, Condor will wait for the promise to be fulfilled before continuing to the next handler.

```js
const app = new Condor();
const scope = 'myapp';
app.addErrorHandler(scope, (error, call) => {
  console.error('Something went wrong', error);
  console.error('for the request', call.request);
});
```

If the error handler returns **a value**, Condor will stop the error handler chain.

```js
const app = new Condor();
const scope = 'myapp';
app.addErrorHandler(scope, (error, call) => {
    console.error('Something went wrong', error);
    console.error('for the request', call.request);
    return { 'message': 'something' };
});
```

#### Scope

When a scope argument is not provided the handler will catch errors on any request.

```js
app.addErrorHandler((error, call) => {
  console.error('Something went wrong', error);
  console.error('for the request', call.request);
});
```

Scope can be a package name. 

```js
app.addErrorHandler('myapp', (error, call) => {
  // Will catch errors of any services in the `myapp` package.
  console.error('Something went wrong', error);
  console.error('for the request', call.request);
});
```

Or a service name. 

```js
app.addErrorHandler('myapp.Greeter', (error, call) => {
  // will catch errors of any methods of the `Greeter` service of the `myapp` package.
  console.error('Something went wrong', error);
  console.error('for the request', call.request);
});
```

Or a specific method name.

```js
app.addErrorHandler('myapp.Greeter.sayHello', (error, call) => {
  // will catch errors of the myapp.Greeter.sayHello method.
  console.error('Something went wrong', error);
  console.error('for the request', call.request);
});
```

### Modifying the error response

You can modify the error object from your error handlers:

```js
app.addErrorHandler((error) => {
  error.code = grpc.status.PERMISSION_DENIED;
  error.details = 'You do not have enough permissions';
});
```

The modified error will be passed to the next error handler, and finally to the client.

### Default error handler

After running all error handlers, the server will respond to the client with the error (which can be modified by the handlers).

If the response is a stream, it will emit the `error`.
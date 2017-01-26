
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

If the middleware method returns a **promise that resolves with a value**, Condor will stop the middleware chain and the method will not be executed.

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  return new Promise((resolve) => {
    console.log('Request:', call.request);
    resolve({ 'message': 'something' });
  });
});
```

If the middleware method returns a **promise that resolves with nothing**, Condor will wait for the promise to be fulfilled before continuing to the next middleware.

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
If the middleware method returns a **promise that rejects with nothing or something**, Condor will stop the middleware chain, the method will not be excecuted, and excecute the error handlers chain.

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  return new Promise((resolve, reject) => {
    console.log('Request:', call.request);
    reject();
  });
});
```

If the middleware method returns **a value**, Condor will stop the middleware chain and the implementation method will not be executed.

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  console.log('Request:', call.request);
  return 'any value';
});
```

If the middleware **does not return anything**, the chain will continue and the next middleware will be executed.

```js
const app = new Condor();
const scope = 'myapp';
app.addMiddleware(scope, (call) => {
  console.log('Request:', call.request);
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
## Implementation

```js
const Response = require('condor-framework').Response;
const app = new Condor();
class Greeter {
  sayHello(call) {
    return new Response({ 'greeting': 'Hello ' + call.request.name }, metadata);
    //return { 'greeting': 'Hello ' + call.request.name };
  }
}
app.addService('./protos/greeter.proto', 'myapp.Greeter', new Greeter())
```

## Middleware

### When no flow is modified 
```js
// Middleware A -> Implementation -> To User
const app = new Condor();
app.use(scope, (context, next) => {
  // Log the request, and continue
  console.log('Request:', context.request);
  return next();
});

// Middleware A -> Implementation -> Middleware A -> To User
const app = new Condor();
app.use(scope, (context, next) => {
  // Log the request, and continue
  console.log('Request:', context.request);
  return next().then((result) => {
    console.log('Result', result);
  });
});
```

### Responding to the user

```js
// Middleware A -> To User
const app = new Condor();
const scope = 'myapp';
app.use(scope, (context) => {
  // Respond to the user immediately
  context.send({'message': 'any value'}, metadata);
});
```

## Error Handlers Option 
```js
const app = new Condor();
const scope = 'myapp';

class Greeter {
  sayHello(call) {
    throw new Error('New Error');
  }
}

app.addService('./protos/greeter.proto', 'myapp.Greeter', new Greeter())

app.use(scope, (error, context, next) => {
  console.log(error);
  next(error);
});
```

### Changing the error
```js
app.use(scope, (error, context, next) => {
  next(new Error('New Error'));
});
```

### Responding to the user
```js
app.use(scope, (error, context, next) => {
  context.response = new Response({'message': 'any value'});
  next();
});
```



# Adding Services

We recommend you that, when creating a Condor instance, you pass the `rootProtoPath` option. This path will be used to resolve the proto files.

```js
const options = {
  'rootProtoPath': './protos',
};

const server = new Condor(options);
```

Then, to add a new service, you need to call `add()`. Add supports the following signatures:

- Adding just one service 
  
  ```js
  const protoFilePath = 'myapp/greeter.proto';
  const serviceName = 'GreeterService';
  const implementation = new Greeter();
  server.add(protoFilePath, serviceName, implementation);
  ```

- Adding multiple services at once

  ```js
  const protoFilePath = 'myapp/greeter.proto';
  const services = {
    'GreeterService': new Greeter(),
    'AnotherService': new Another(),
  };
  server.add(protoFilePath, services);
  ```

Also, you can call `add()` multiple times, with even different *proto* files.

## Considerations

- `serviceName` must match the one in the proto file.

## Implementation

Should be an object containing the implementation of all the methods defined in the service in the `proto` file.

The methods will receive a `call` object. They can be sync or async (return a promise). Condor will wait for the promise to be resolved / rejected and then will respond to the user.

You can use classes, or simple objects. A class implementation of `GreeterService` would look like this:

```js
const Condor = require('condor-framework');
 
class Greeter {
  sayHello(call) {
    return { 'greeting': `Hello ${call.request.name}`};
  }
}

const app = new Condor()
  .addService('./protos/greeter.proto', 'myapp.Greeter', new Greeter())
  .start();
```

An object implementation of `Greeter Service` would look like this:

```js
const Condor = require('condor-framework');
 
const greeter = {
  sayHello: (call) => {
    return {'greeting': `Hello ${call.request.name}`};
  }
};

const app = new Condor()
  .addService('./protos/greeter.proto', 'myapp.Greeter', greeter)
  .start();
```

Next: [GRPC Requests](grpc-requests)

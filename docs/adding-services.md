# Adding Services

We recommend you that, when creating a Condor instance, you pass the `rootProtoPath` option. This path will be used to resolve the proto files.

```js
const options = {
  'rootProtoPath': './protos',
};

const server = new Condor(options);
```

Then, to add a new service, you need to call `add()`. 
  
  ```js
  const protoFilePath = 'myapp/greeter.proto';
  const serviceName = 'GreeterService';
  const implementation = new Greeter();
  server.add(protoFilePath, serviceName, implementation);
  ```

To add more services, you can call `add()` multiple times, with even different *proto* files.

## Considerations

- `serviceName` must match the one in the proto file.
- `protoFilePath` should be the path to the proto file.
 
  - It can be an absolute path or:
  - If no `rootProtoPath` has been defined in the options, it should be relative to process.cwd().
  - If `rootProtoPath` has been defined, it should be relative to `rootProtoPath`. (Recommended)

## Implementation

Should be an object containing the implementation of all the methods defined in the service in the `proto` file.

The methods can be sync or async (return a promise). Condor will wait for the promise to be resolved / rejected and then will respond to the user. The methods will receive a [context](context) object. 

You can use classes instances, or simple objects. A class implementation of `GreeterService` would look like this:

```js
class Greeter {
  sayHello(ctx) {
    return { 'greeting': `Hello ${ctx.request.name}`};
  }
}
const greeter = new Greeter();
```

An object implementation of `Greeter Service` would look like this:

```js
const greeter = {
  sayHello: (ctx) => {
    return {'greeting': `Hello ${ctx.request.name}`};
  }
};
```

Next: [GRPC Requests](grpc-requests)

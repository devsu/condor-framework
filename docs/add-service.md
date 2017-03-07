# Add Service

The function receives 3 parameters:

- [Proto file path](#proto-file-path)
- [Service full name](#service-full-name)
- [Implementation](#implementation)

## Proto file path

This is the file path where the `.proto` definition is stored. We are using `proto3` syntax for all files of 
this type. You can have more than one service in a `.proto` file but only one `package` name.

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

service Person {
  rpc addPerson (Person) returns (Person) { }
}
```

## Service full name

The name of the package of the `.proto` file and plus the service name that will be used. Using 
the [Proto file path](#proto file path) example to form our service full name will be the 
`package name` (myapp in this case) and the service name (Greeter) and putting it together it 
should look like `myapp.Greeter`. 

## Implementation

Is a class or an object containing the implementation of all method of the corresponding service 
inside the `.proto` file. 

An object implementation of `Greeter Service` would look like this:

```js
const Condor = require('condor-framework');
 
const greeter = {
  sayHello: (call) => {
    return {'greeting': `Hello ${call.request.name}`};
  }
}

const app = new Condor()
  .addService('./protos/greeter.proto', 'myapp.Greeter', greeter)
  .start();
```

A class implementation of `Greeter Service` would look like this:

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

Next: [GRPC Requests](grpc-requests)

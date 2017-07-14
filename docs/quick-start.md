---
title: Quick Start
layout: default
---

# Quick start

### 1. Create your app

```bash
mkdir my-app
cd my-app
npm init
```

### 2. Add the dependencies
  
```bash
npm i --save condor-framework
```

### 3. If you don't have it, create your proto file. (e.g. `protos/myapp/greeter.proto`)

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
  rpc SayHello (Person) returns (Greeting) { }
}
```

### 4. Add the code to your start script (e.g. `index.js`)

```js
const Condor = require('condor-framework');
 
class Greeter {
  sayHello(ctx) {
    return { 'greeting': `Hello ${ctx.req.name}`};
  }
}

const options = {
  'listen': '0.0.0.0:50051',
  'rootProtoPath': './protos',
};

const app = new Condor(options)
  .add('myapp/greeter.proto', 'Greeter', new Greeter())
  .start();
```

### 5. Run your app

```bash
node index.js
```

### 6. To test your app with a client. 

  - Add required dependencies
  
    ```bash
    npm i --save grpc
    ```
  
  - On your client start script (e.g. `client.js`) add the following lines:
  
    ```js
    var greeterProto = grpc.load('./protos/myapp/greeter.proto');
    var client = new greeterProto.myapp.Greeter('127.0.0.1:50051', grpc.credentials.createInsecure());
    
    function sayHello(person) {
      client.sayHello(person, (error, greeting) => {
        if (error) {
          console.log(error);
          return;
        }
        console.log(greeting);
      });
    }
    
    sayHello({ 'name': 'Peter Pan' });
    ```
  
  - Execute the client (on another terminal, while server is running)
  
    ```bash
    node client.js
    ```

That's all. You have created your GRPC service in node js with middleware support.

### Next steps

- You can take a look at the ready to use [middleware modules](related-modules-and-middleware) 
- Or dive into the next pages to understand how to implement services and write your own middleware and error handlers.

Next: [Adding Services](adding-services)

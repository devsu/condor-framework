## Quick start

Before start, we recommend you to get familiar with [GRPC](http://www.grpc.io/).

1. Create your app

  ```bash
  mkdir my-app
  cd my-app
  npm init
  ```

2. Add the dependencies

  ```bash
  npm i --save condor-framework
  ```

3. If you don't have it, create your proto file. (e.g. `protos/greeter.proto`)

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
  ```

4. Add the code to your start script (e.g. `index.js`)

  ```js
  const Condor = require('condor-framework');
   
  class Greeter {
    sayHello(call) {
      return { 'greeting': 'Hello ' + call.request.name };
    }
  }
  
  const app = new Condor()
    .addService('./protos/greeter.proto', new Greeter())
    .start();
  ```

5. Run your app

  ```bash
  node index.js
  ```

6. To test your app with a client. 

  - Add required dependencies
  
    ```bash
    npm i --save grpc
    ```
  
  - On your client start script (e.g. `client.js`) add the following lines:
  
    ```js
    var greeterProto = grpc.load('./protos/greeter.proto');
    var client = new greeterProto.myapp.Greeter('127.0.0.1:3000', grpc.credentials.createInsecure());
    
    function sayHello(person) {
      client.sayHello(person, function(error, greeting) {
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
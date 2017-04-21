---
title: Condor GRPC Framework
layout: home
---

# Condor: A GRPC Framework for node

Minimalist, fast framework for building GRPC services in Node JS. It's like **express** for **GRPC**.

## Highlights

- Built on top of Google's [grpc](https://www.npmjs.com/package/grpc) module
- Focus on simplicity and high performance
- Fully covered by tests
- Promise based, which means **no callbacks**
- Written using, and design for **ES6**

## Easy to use

```js
const Condor = require('condor-framework');

class Greeter {
  sayHello(call) {
    return { 'greeting': 'Hello ' + call.request.name };
  }
}

const logger = (context, next) => {
  console.log('Request:', context.request);
  return next();
};

const app = new Condor()
  .addService('./protos/greeter.proto', 'myapp.Greeter', new Greeter())
  .use(logger)
  .start();
```

## Features

- [Middleware](middleware)
- [Error Handlers](error-handlers)
- [SSL/TLS Support](ssl-tls)

## Installation

```bash
npm install --save condor-framework
``` 

Next: [Quick Start](quick-start)

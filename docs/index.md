---
title: Condor GRPC Framework
layout: home
---

# Condor: A GRPC Framework for node

Minimalist, fast framework for building GRPC services in Node JS.

## Highlights

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

const logger = (call) => {
  console.log('Request:', call.request);
};

const app = new Condor()
  .addService('./protos/greeter.proto', 'myapp.Greeter', new Greeter())
  .addMiddleware('myapp', logger)
  .start();
```

## Features

- [Middleware](middleware) (not using interceptors for now, since [they are not available for node](https://github.com/grpc/grpc/issues/8394), but will use them when available)
- [Error Handlers](error-handlers)
- [SSL/TLS Support](ssl-tls)

## Installation

```bash
npm install --save condor-framework
``` 

Next: [Quick Start](quick-start)

---
title: Condor GRPC Framework
layout: home
---

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

## Highlights

- Built on top of Google's [grpc](https://www.npmjs.com/package/grpc) module
- Focus on simplicity and high performance
- Fully covered by tests
- Promise based, which means **no callbacks**
- Written using, and design for **ES6**

## Installation

```bash
npm install --save condor-framework
``` 

## Status

Condor is working, but it's in *ALPHA* stage. We're using it to build a large system that will be in production soon.

## Links
[Documentation / Quick Start](quick-start)
[Github Repo](https://github.com/devsu/condor-framework)

---
title: Condor GRPC Framework
layout: default
---

# Condor Framework

Minimalist, fast framework for building GRPC services in Node JS.

**Status**: Documentation draft, receiving feedback.


## Highlights

- Focus on simplicity and high performance
- Fully covered by tests
- Promise based, which means **no callbacks**
- Written using, and design for **ES6**


## How to use

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

## Installation

```bash
npm install --save condor-framework
```

## Table of contents

[Documentation](http://condorjs.com)

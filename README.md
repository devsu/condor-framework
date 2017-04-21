# Condor GRPC Framework for Node

Minimalist, fast framework for building GRPC services in Node JS. It's like **express** for **GRPC**.

[![Build Status](https://travis-ci.org/devsu/condor-framework.svg?branch=master)](https://travis-ci.org/devsu/condor-framework)
[![Coverage Status](https://coveralls.io/repos/github/devsu/condor-framework/badge.svg?branch=master)](https://coveralls.io/github/devsu/condor-framework?branch=master)

**Status**: Alpha.

## Highlights

- Built on top of Google's [grpc](https://www.npmjs.com/package/grpc) module
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

const logger = (context, next) => {
  console.log('Request:', context.request);
  return next();
};

const app = new Condor()
  .addService('./protos/greeter.proto', 'myapp.Greeter', new Greeter())
  .use(logger)
  .start();
```

## Installation

```bash
npm install --save condor-framework
```

## Links

- [Website](http://condorjs.com)
- [Documentation](http://condorjs.com/documentation)

## Related Modules and Middleware

- [Condor-Auth](https://github.com/devsu/condor-auth): An authorization middleware for Condor. Designed to work with JWTs out of the box, but you can plug in any other strategy.
- [Condor-Mongoose](https://github.com/devsu/condor-mongoose): Utils to accelerate the development of GRPC services using **condor** and [mongoose](http://mongoosejs.com/).
- More are coming soon... ;)

## License and Credits

MIT License. Copyright 2017 by **Devsu LLC**, the [Node GRPC Experts](https://devsu.com)

# Condor GRPC Framework for Node

Minimalist, fast framework for building GRPC services in Node JS. It's like **express** for **GRPC**.

[![Build Status](https://travis-ci.org/devsu/condor-framework.svg?branch=master)](https://travis-ci.org/devsu/condor-framework)
[![Coverage Status](https://coveralls.io/repos/github/devsu/condor-framework/badge.svg?branch=master)](https://coveralls.io/github/devsu/condor-framework?branch=master)

## Status

~Condor is working, but it's in *ALPHA* stage. We're using it to build a large system that will be in production soon.~ **Unmaintained** We stopped using GRPC (probably we'll take a look again in the future, when its whole ecosystem gets more mature).

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
  sayHello(ctx) {
    return { 'greeting': 'Hello ' + ctx.req.name };
  }
}

const logger = (ctx, next) => {
  console.log('Request:', ctx.req);
  return next();
};

const options = {
  'listen': '0.0.0.0:50051',
  'rootProtoPath': './protos',
};

const app = new Condor(options)
  .add('myapp/greeter.proto', 'GreeterService', new Greeter())
  .use(logger)
  .start();
```

For this to work, you should have your proto file at `./protos/myapp/greeter.proto`.

## Installation

```bash
npm install --save condor-framework
```

## Links

- [Website](http://condorjs.com)
- [Documentation](http://condorjs.com/documentation)

## Related Modules and Middleware

See the documentation for [related modules and middleware](http://condorjs.com/related-modules-and-middleware).

## License and Credits

MIT License. Copyright 2017 by **Devsu LLC**, the [Node GRPC Experts](https://devsu.com)

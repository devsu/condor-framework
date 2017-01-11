const grpc = require('grpc');
let middlewares;

module.exports = class Server {
  constructor(builder) {
    this.server = new grpc.Server();
    middlewares = builder.getMiddlewares();
    const services = builder.getServices();
    addProtoServices(this.server, services);
    const options = builder.getOptions();
    this.server.bind(`${options.host}:${options.port}`, options.creds);
  }

  start() {
    this.server.start();
  }
};

function addProtoServices(server, services) {
  for (let i = 0; i < services.length; i++) {
    const protoService = getProtoService(services[i].protoPath, services[i].protoService);
    const proxy = getProxy(services[i]);
    server.addProtoService(protoService, proxy);
  }
}

function getProtoService(protoPath, protoService) {
  let proto = grpc.load(protoPath);
  const protoProperties = protoService.split('.');
  for (let j = 0; j < protoProperties.length; j++) {
    proto = proto[protoProperties[j]];
  }
  return proto.service;
}

function getProxy(service) {
  const promiseImpl = service.implementation;
  const scope = service.protoService;
  const functions = getFunctionNames(promiseImpl);
  const callbackImpl = {};

  for (let i = 0; i < functions.length; i++) {
    const scopeMiddlewares = getMiddlewares(scope, functions[i]);
    for (let j = 0; j < scopeMiddlewares.length; j++) {
      scopeMiddlewares[j].middleware.apply(scopeMiddlewares[j]);
    }
    callbackImpl[functions[i]] = function(call, callback) {
      const value = promiseImpl[functions[i]].apply(promiseImpl, call);
      setCallback(callback, value);
    };
  }
  return callbackImpl;
}

function getFunctionNames(promiseImpl) {
  const promiseClass = Object.getPrototypeOf(promiseImpl);
  return Object.getOwnPropertyNames(promiseClass).filter((element) => {
    return element !== 'constructor';
  });
}

function setCallback(callback, value) {
  if (value instanceof Promise) {
    value.then((result) => {
      callback(null, result);
    }).catch((error) => {
      callback(error);
    });
    return;
  }
  callback(null, value);
}

function getMiddlewares(scope, functionName) {
  const scopeMiddleware = middlewares.filter((middleware) => {
    // console.log(middleware, scope, functionName);
    return scope.includes(middleware.scope)
      || !middleware.scope
      || middleware.scope.includes(functionName);
  });
  return scopeMiddleware;
}

const Promise = require('bluebird');

module.exports = class {
  constructor(serviceDefinition, middleware) {
    const proxy = {};
    const serviceImplementation = serviceDefinition.implementation;
    const servicePrototype = Object.getPrototypeOf(serviceImplementation);
    const propertiesNames = Object.getOwnPropertyNames(servicePrototype);
    propertiesNames.forEach((propertyName) => {
      if (propertyName === 'constructor') {
        return;
      }
      proxy[propertyName] = buildProxyMethod(serviceDefinition, middleware, propertyName);
    });
    return proxy;
  }
};

function buildProxyMethod(serviceDefinition, middleware, propertyName) {
  const serviceImplementation = serviceDefinition.implementation;
  const serviceFullName = serviceDefinition.serviceFullName;
  return (call, callback) => {
    let value;

    const filteredMiddleware = middleware.filter((middlewareItem) => {
      return shouldMiddlewareBeExecuted(middlewareItem, `${serviceFullName}.${propertyName}`);
    });

    Promise.reduce(filteredMiddleware, (count, middlewareItem) => {
      return middlewareItem.method(call);
    }, 0).then(() => {
      try {
        value = serviceImplementation[propertyName].call(serviceImplementation, call);
      } catch (error) {
        return callback(error);
      }

      if (value && typeof value.then === 'function') {
        return processPromise(value, callback);
      }
      return callback(null, value);
    }).catch((error) => {
      return callback(error);
    });
  };
}

function shouldMiddlewareBeExecuted(middlewareItem, propertyFullName) {
  const middlewareIsGlobal = middlewareItem.scope === '*';
  const middlewareDoesApply = propertyFullName.startsWith(middlewareItem.scope);
  return (middlewareIsGlobal || middlewareDoesApply);
}

function processPromise(value, callback) {
  value.then((result) => {
    callback(null, result);
  })
  .catch((error) => {
    callback(error);
  });
}

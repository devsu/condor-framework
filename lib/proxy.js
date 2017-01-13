const grpc = require('grpc');

module.exports = class {
  constructor(serviceImplementation) {
    const proxy = {};
    const servicePrototype = Object.getPrototypeOf(serviceImplementation);
    const propertiesNames = Object.getOwnPropertyNames(servicePrototype);
    propertiesNames.forEach((propertyName) => {
      if (propertyName === 'constructor') {
        return;
      }
      proxy[propertyName] = buildProxyMethod(serviceImplementation, propertyName);
    });
    return proxy;
  }
};
function buildProxyMethod(serviceImplementation, propertyName) {
  return (call, callback) => {
    let value;

    try {
      value = serviceImplementation[propertyName].call(serviceImplementation, call);
    } catch (error) {
      return processError(error, callback);
    }

    if (value && typeof value.then === 'function') {
      return processPromise(value, callback);
    }
    return processValue(value, callback);
  };
}

function processError(error, callback) {
  const grpcError = {
    'code': grpc.status.UNKNOWN_ERR,
    'details': error.message,
  };
  callback(grpcError);
}

function processPromise(value, callback) {
  value.then((result) => {
    callback(null, result);
  })
  .catch((error) => {
    callback(error);
  });
}

function processValue(value, callback) {
  callback(null, value);
}

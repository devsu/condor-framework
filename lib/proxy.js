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
      return callback(error);
    }

    if (value && typeof value.then === 'function') {
      return processPromise(value, callback);
    }
    return callback(null, value);
  };
}

function processPromise(value, callback) {
  value.then((result) => {
    callback(null, result);
  })
  .catch((error) => {
    callback(error);
  });
}

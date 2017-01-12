module.exports = class {
  constructor(serviceImplementation) {
    const proxy = {};
    const servicePrototype = Object.getPrototypeOf(serviceImplementation);
    const propertiesNames = Object.getOwnPropertyNames(servicePrototype);
    propertiesNames.forEach((propertyName) => {
      if (propertyName === 'constructor') {
        return;
      }
      proxy[propertyName] = (call, callback) => {
        const value = serviceImplementation[propertyName].call(serviceImplementation, call);
        if (value && typeof value.then === 'function') {
          value.then((result) => {
            callback(null, result);
          })
          .catch((error) => {
            callback(error);
          });
          return;
        }
        callback(null, value);
      };
    });
    return proxy;
  }
};

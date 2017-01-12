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
      proxy[propertyName] = (call, callback) => {
        let value;
        try {
          value = serviceImplementation[propertyName].call(serviceImplementation, call);
        } catch (error) {
          const grpcError = {
            'code': grpc.status.UNKNOWN_ERR,
            'details': error.message,
          };
          callback(grpcError);
          return;
        }

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

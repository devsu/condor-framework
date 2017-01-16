const Promise = require('bluebird');

module.exports = class {
  constructor(serviceDefinition, middleware, errorHandlers) {
    const proxy = {};
    const serviceImplementation = serviceDefinition.implementation;
    const servicePrototype = Object.getPrototypeOf(serviceImplementation);
    const propertiesNames = Object.getOwnPropertyNames(servicePrototype);
    this._middleware = middleware;
    this._errorHandlers = errorHandlers;
    propertiesNames.filter((propertyName) => {
      return propertyName !== 'constructor';
    }).forEach((propertyName) => {
      proxy[propertyName] = this._buildProxyMethod(serviceDefinition, propertyName);
    });
    return proxy;
  }

  _buildProxyMethod(serviceDefinition, propertyName) {
    const serviceImplementation = serviceDefinition.implementation;
    const serviceFullName = serviceDefinition.serviceFullName;
    const propertyFullName = `${serviceFullName}.${propertyName}`;
    return (call, callback) => {
      const filteredMiddleware = this._filterMiddleware(propertyFullName);
      let value;
      Promise.reduce(filteredMiddleware, (count, middlewareItem) => {
        return middlewareItem.method(call);
      }, 0).then(() => {
        try {
          value = serviceImplementation[propertyName].call(serviceImplementation, call);
        } catch (error) {
          return this._callErrorHandlers(callback, error, propertyFullName);
        }

        if (this._isPromise(value)) {
          return this._processPromise(value, callback);
        }
        return callback(null, value);
      }).catch((error) => {
        return this._callErrorHandlers(callback, error, propertyFullName);
      });
    };
  }

  _filterMiddleware(propertyFullName) {
    return this._middleware.filter((middlewareItem) => {
      return this._shouldMiddlewareBeExecuted(middlewareItem, propertyFullName);
    });
  }

  _shouldMiddlewareBeExecuted(middlewareItem, propertyFullName) {
    const middlewareIsGlobal = middlewareItem.scope === '*';
    const middlewareDoesApply = propertyFullName.startsWith(middlewareItem.scope);
    return (middlewareIsGlobal || middlewareDoesApply);
  }

  _callErrorHandlers(callback, error, propertyFullName) {
    let callbackError = error;
    this._errorHandlers.filter((errorHandler) => {
      return this._shouldErrorHandlerBeExecuted(errorHandler, propertyFullName);
    }).forEach((errorHandler) => {
      try {
        errorHandler.method(callbackError);
      } catch (handlerError) {
        callbackError = handlerError;
      }
    });
    callback(callbackError);
  }

  _shouldErrorHandlerBeExecuted(errorHandler, propertyFullName) {
    const errorHandlerIsGlobal = errorHandler.scope === '*';
    const errorHandlerDoesApply = propertyFullName.startsWith(errorHandler.scope);
    return (errorHandlerIsGlobal || errorHandlerDoesApply);
  }

  _isPromise(value) {
    return value && typeof value.then === 'function';
  }

  _processPromise(value, callback) {
    value.then((result) => {
      callback(null, result);
    })
    .catch((error) => {
      callback(error);
    });
  }
};

const Promise = require('bluebird');

module.exports = class {
  constructor(serviceDefinition, middleware, errorHandlers) {
    this._proxy = {};
    this._middleware = middleware || [];
    this._errorHandlers = errorHandlers || [];
    this._serviceDefinition = serviceDefinition;
    const servicePrototype = Object.getPrototypeOf(this._serviceDefinition.implementation);
    const propertiesNames = Object.getOwnPropertyNames(servicePrototype);

    propertiesNames.filter((propertyName) => {
      return propertyName !== 'constructor';
    }).forEach((propertyName) => {
      this._addToProxy(propertyName);
    });
    return this._proxy;
  }

  _addToProxy(propertyName) {
    const propertyFullName = `${this._serviceDefinition.serviceFullName}.${propertyName}`;
    const filteredMiddleware = this._filterMiddleware(this._middleware, propertyFullName);
    const filteredErrorHandlers = this._filterMiddleware(this._errorHandlers, propertyFullName);
    this._proxy[propertyName] = this._buildProxyMethod(propertyName, filteredMiddleware, filteredErrorHandlers);
  }

  _filterMiddleware(middleware, propertyFullName) {
    return middleware.filter((middlewareItem) => {
      return this._shouldMiddlewareBeExecuted(middlewareItem, propertyFullName);
    });
  }

  _shouldMiddlewareBeExecuted(middlewareItem, propertyFullName) {
    const middlewareIsGlobal = middlewareItem.scope === '*';
    const middlewareDoesApply = propertyFullName.startsWith(middlewareItem.scope);
    return (middlewareIsGlobal || middlewareDoesApply);
  }

  _buildProxyMethod(propertyName, middleware, errorHandlers) {
    const serviceImplementation = this._serviceDefinition.implementation;
    return (call, callback) => {
      Promise.reduce(middleware, (count, middlewareItem) => {
        return middlewareItem.method(call);
      }, 0).then(() => {
        return serviceImplementation[propertyName].call(serviceImplementation, call);
      }).then((result) => {
        return callback(null, result);
      }).catch((error) => {
        let callbackError = error;
        errorHandlers.forEach((errorHandler) => {
          try {
            errorHandler.method(callbackError);
          } catch (handlerError) {
            callbackError = handlerError;
          }
        });
        callback(callbackError);
      });
    };
  }
};

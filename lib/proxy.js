const Promise = require('bluebird');
const fs = require('fs');

module.exports = class {
  constructor(serviceDefinition, middleware, errorHandlers) {
    this._proxy = {};
    this._middleware = middleware || [];
    this._errorHandlers = errorHandlers || [];
    this._serviceDefinition = serviceDefinition;
    const servicePrototype = Object.getPrototypeOf(this._serviceDefinition.implementation);
    const propertiesNames = Object.getOwnPropertyNames(servicePrototype);
    const fileData = fs.readFileSync(this._serviceDefinition.protoFilePath, 'utf-8');
    propertiesNames.filter((propertyName) => {
      return this._isPropertyDefinedInProto(fileData, propertyName);
    }).forEach((propertyName) => {
      this._addToProxy(propertyName);
    });
    return this._proxy;
  }

  _isPropertyDefinedInProto(fileData, propertyName) {
    const serviceName = this._getServiceName();
    const serviceDefinition = this._getServiceDefinition(fileData, serviceName);
    const capitalizedMethodName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
    const regex = new RegExp(`rpc\\s{1,}${capitalizedMethodName}\\s{0,}\\(`);
    return regex.test(serviceDefinition);
  }

  _getServiceDefinition(fileData, serviceName) {
    const serviceDefinitionIndex = fileData.indexOf(`service ${serviceName}`);
    const nextServiceDefinitionIndex = fileData.indexOf('service', serviceDefinitionIndex + 1);
    let serviceDefinition = fileData.substring(serviceDefinitionIndex, nextServiceDefinitionIndex);
    if (nextServiceDefinitionIndex === -1) {
      serviceDefinition = fileData.substring(serviceDefinitionIndex);
    }
    return serviceDefinition;
  }

  _getServiceName() {
    const serviceFullName = this._serviceDefinition.serviceFullName;
    const serviceFullNameArray = serviceFullName.split('.');
    return serviceFullNameArray[serviceFullNameArray.length - 1];
  }

  _addToProxy(propertyName) {
    const propertyFullName = `${this._serviceDefinition.serviceFullName}.${propertyName}`;
    const filteredMiddleware = this._filterMiddleware(this._middleware, propertyFullName);
    const filteredErrorHandlers = this._filterMiddleware(this._errorHandlers, propertyFullName);
    this._proxy[propertyName] = this._buildProxyMethod(
      propertyName, filteredMiddleware, filteredErrorHandlers);
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
    const implementation = this._serviceDefinition.implementation;
    return (call, callback) => {
      return this._executeMiddleware(middleware, call).then((result) => {
        if (result) {
          return result;
        }
        return implementation[propertyName].call(implementation, call);
      }).then((result) => {
        if (callback) {
          return callback(null, result);
        }
      }).catch((error) => {
        return this._manageErrors(errorHandlers, call, error, callback); /* eslint max-params: "off" */
      });
    };
  }

  _manageErrors(errorHandlers, call, error, callback) {
    return this._executeMiddleware(errorHandlers, call, error).then((result) => {
      if (result && callback) {
        return callback(null, result);
      }
      callback(error);
    }).catch((secondError) => {
      if (callback) {
        return callback(secondError);
      }
      call.emit('error', error);
    });
  }

  _executeMiddleware(middleware, call, error) {
    let promise = Promise.resolve();
    for (let i = 0; i < middleware.length; i++) {
      promise = promise.then((result) => {
        if (result) {
          return result;
        }
        if (error) {
          return middleware[i].method(error, call);
        }
        return middleware[i].method(call);
      });
    }
    return promise;
  }

};

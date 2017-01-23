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
    propertiesNames.filter((propertyName) => {
      return this._isPropertyDefinedInProto(propertyName);
    }).forEach((propertyName) => {
      this._addToProxy(propertyName);
    });
    return this._proxy;
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
      return Promise.reduce(middleware, (count, middlewareItem) => {
        return middlewareItem.method(call);
      }, 0).then(() => {
        return implementation[propertyName].call(implementation, call);
      }).then((result) => {
        if (callback) {
          return callback(null, result);
        }
      }).catch((error) => {
        return Promise.reduce(errorHandlers, (count, errorHandler) => {
          return errorHandler.method(error, call);
        }, 0).then(() => {
          if (callback) {
            return callback(error);
          }
          call.emit('error', error);
        });
      });
    };
  }
  _isPropertyDefinedInProto(propertyName) {
    const fileData = fs.readFileSync(this._serviceDefinition.protoFilePath, 'utf-8');
    const serviceName = this._getServiceName();
    const serviceDefinition = this._getServiceDefinition(fileData, serviceName);
    const capitalizedMethodName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
    return serviceDefinition.includes(`rpc ${capitalizedMethodName}`);
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
};

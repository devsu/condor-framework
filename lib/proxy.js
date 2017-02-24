const Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const Context = require('./context');

module.exports = class {
  constructor(serviceDefinition, middleware, errorHandlers) {
    this._proxy = {};
    this._middleware = middleware || [];
    this._errorHandlers = errorHandlers || [];
    this._serviceDefinition = serviceDefinition;
    const propertyNames = this._getPropertyNames(this._serviceDefinition.implementation);
    const fileData = fs.readFileSync(this._serviceDefinition.protoFilePath, 'utf-8');

    propertyNames.filter((propertyName) => {
      return this._isPropertyDefinedInProto(fileData, propertyName);
    }).forEach((propertyName) => {
      this._addToProxy(propertyName);
    });
    return this._proxy;
  }

  _getPropertyNames(implementation) {
    let propertyNames = [];
    let nextClass = implementation;
    while (nextClass instanceof Object) {
      const ownPropertyNames = Object.getOwnPropertyNames(nextClass);
      propertyNames.push(...ownPropertyNames);
      nextClass = Object.getPrototypeOf(nextClass);
    }
    propertyNames = _.uniq(propertyNames).filter((propertyName) => {
      return propertyName !== 'constructor' && typeof implementation[propertyName] === 'function';
    });
    return propertyNames;
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
    this._proxy[propertyName] = this._buildProxyMethod(
      propertyName, filteredMiddleware, this._errorHandlers);
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
      const context = new Context(call);
      middleware.forEach((middlewareItem) => {
        middlewareItem.method.call(middlewareItem, context, () => {
          return Promise.resolve(context.getResponse());
        });
        if (context.getResponse()) {
          callback(null, context.getResponse());
        }
      });
      Promise.resolve().then(() => {
        return implementation[propertyName].call(implementation, call);
      }).then((result) => {
        if (!context.getResponse()) {
          context.send(result);
          callback(null, context.getResponse());
        }
      }).catch((error) => {
        callback(error);
      });
    };
  }

  _executeImplementation(implementation, propertyName) {

  }
};

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

module.exports = class {
  constructor(options) {
    this._services = [];
    this._middleware = [];
    this._errorHandlers = [];
    this._options = options || {};
  }

  add(protoFilePath, serviceName, implementation) {
    let servicesToAdd = serviceName;
    if (_.isString(serviceName)) {
      servicesToAdd = {};
      servicesToAdd[serviceName] = implementation;
    }
    Object.keys(servicesToAdd).forEach((serviceName) => {
      const implementation = servicesToAdd[serviceName];
      this._validateImplementation(implementation);
      const rootProtoPath = this._options.rootProtoPath;
      let protoFileFullPath = protoFilePath;
      if (this._options.rootProtoPath) {
        protoFileFullPath = path.join(rootProtoPath, protoFilePath);
      }
      this._validateFileExists(protoFileFullPath);
      const serviceFullName = `${this._getPackageName(protoFileFullPath)}.${serviceName}`;
      this._services.push({
        rootProtoPath,
        protoFilePath,
        protoFileFullPath,
        serviceName,
        serviceFullName,
        implementation,
      });
    });

    return this;
  }

  addService(protoFileFullPath, serviceFullName, implementation) {
    // eslint-disable-next-line no-console
    console.warn('addService() is deprecated use add() instead');
    this._validateImplementation(implementation);
    this._validateProtoFilePath(protoFileFullPath);
    this._validateServiceFullName(serviceFullName, protoFileFullPath);
    const serviceName = this._getServiceNameFromFullName(serviceFullName);
    this._services.push({
      protoFileFullPath,
      serviceName,
      serviceFullName,
      implementation,
    });
    return this;
  }

  _validateFileExists(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Cannot perform operation: "${filePath}" not found`);
    }
  }

  _validateProtoFilePath(protoFilePath) {
    if (!fs.existsSync(protoFilePath)) {
      throw new Error('Cannot perform operation: ProtoFilePath is not a valid file path');
    }
    if (path.extname(protoFilePath) !== '.proto') {
      throw new Error('Cannot perform operation: ProtoFile should have .proto extension');
    }
  }

  _getPackageName(protoFileFullPath) {
    const data = fs.readFileSync(protoFileFullPath, 'utf-8');
    const packageRegex = /package[ ]+(.+)[ ]*;/g;
    return packageRegex.exec(data)[1].trim();
  }

  _validateServiceFullName(serviceFullName, protoFilePath) {
    const scopes = serviceFullName.split('.');
    const data = fs.readFileSync(protoFilePath, 'utf-8');
    const packageName = scopes.slice(0, scopes.length - 1).join('.');
    this._validatePackageName(packageName, data, scopes.length);
    const serviceName = scopes[scopes.length - 1];
    this._validateServiceName(serviceName, data);
  }

  _validatePackageName(packageName, data, length) {
    const packageRegex = new RegExp(`package\\s{1,}${packageName}\\s{0,};`);
    if (!packageRegex.test(data) && length > 1) {
      throw new Error('Cannot perform operation: Package name not found');
    }
  }

  _validateServiceName(serviceName, data) {
    const serviceRegex = new RegExp(`service\\s{1,}${serviceName}\\s{0,}{`);
    if (!serviceRegex.test(data)) {
      throw new Error('Cannot perform operation: Service name not found');
    }
  }

  _getServiceNameFromFullName(serviceFullName) {
    const parts = serviceFullName.split('.');
    return parts[parts.length - 1];
  }

  use(scope, method) {
    if (!method) {
      method = scope; // eslint-disable-line
      scope = '*'; // eslint-disable-line
    }
    this._validateIsAFunction(method);
    this._middleware.push({scope, method});
    return this;
  }

  addErrorHandler(scope, method) {
    if (!method) {
      method = scope; // eslint-disable-line
      scope = '*'; // eslint-disable-line
    }
    this._validateIsAFunction(method);
    this._errorHandlers.push({scope, method});
    return this;
  }

  _validateIsAFunction(method) {
    if (typeof method !== 'function') {
      throw Error('Cannot perform operation: No valid function received');
    }
  }

  _validateImplementation(implementation) {
    if (!(implementation instanceof Object)) {
      throw new Error('Cannot perform operation: No valid implementation received');
    }
  }

  getServices() {
    return this._services;
  }

  getMiddleware() {
    return this._middleware;
  }

  getErrorHandlers() {
    return this._errorHandlers;
  }
};

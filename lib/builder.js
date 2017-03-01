const fs = require('fs');
const path = require('path');

module.exports = class {
  constructor() {
    this._services = [];
    this._middleware = [];
    this._errorHandlers = [];
  }

  addService(protoFilePath, serviceFullName, implementation) {
    this._validateImplementation(implementation);
    this._validateProtoFilePath(protoFilePath);
    this._validateServiceFullName(serviceFullName, protoFilePath);
    this._services.push({
      'protoFilePath': protoFilePath,
      'serviceFullName': serviceFullName,
      'implementation': implementation,
    });
    return this;
  }

  _validateProtoFilePath(protoFilePath) {
    if (!fs.existsSync(protoFilePath)) {
      throw new Error('Cannot perform operation: ProtoFilePath is not a valid file path');
    }
    if (path.extname(protoFilePath) !== '.proto') {
      throw new Error('Cannot perform operation: ProtoFile should have .proto extension');
    }
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

  use(scope, method) {
    if (!method) {
      method = scope; // eslint-disable-line
      scope = '*'; // eslint-disable-line
    }
    this._validateIsAFunction(method);
    this._middleware.push({scope, method});
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
};

const fs = require('fs');
const path = require('path');

module.exports = class {
  constructor() {
    this._services = [];
    this._middleware = [];
    this._errorHandlers = [];
  }

  addService(protoFilePath, serviceFullName, implementation) {
    if (!(implementation instanceof Object)) {
      throw new Error('Cannot add service: No valid implementation received');
    }
    this._isProtoFileValid(protoFilePath);
    this._isServiceFullNameValid(serviceFullName, protoFilePath);
    this._services.push({
      'protoFilePath': protoFilePath,
      'serviceFullName': serviceFullName,
      'implementation': implementation,
    });
    return this;
  }

  _isProtoFileValid(protoFilePath) {
    if (!fs.existsSync(protoFilePath)) {
      throw new Error('Cannot add service: ProtoFilePath is not a valid file path');
    }
    if (path.extname(protoFilePath) !== '.proto') {
      throw new Error('Cannot add service: ProtoFilePath is not a valid file');
    }
  }

  _isServiceFullNameValid(serviceFullName, protoFilePath) {
    const scopes = serviceFullName.split('.');
    const data = fs.readFileSync(protoFilePath, 'utf-8');
    const packageName = scopes.slice(0, scopes.length - 1).join('.');
    this._isPackageNameValid(packageName, data, scopes.length);
    const serviceName = scopes[scopes.length - 1];
    this._isServiceNameValid(serviceName, data);
  }

  _isPackageNameValid(packageName, data, length) {
    const packageRegex = new RegExp(`package\\s{1,}${packageName}\\s{0,};`);
    if (!packageRegex.test(data) && length > 1) {
      throw new Error('Cannot add service: package name not found');
    }
  }

  _isServiceNameValid(serviceName, data) {
    const serviceRegex = new RegExp(`service\\s{1,}${serviceName}\\s{0,}{`);
    if (!serviceRegex.test(data)) {
      throw new Error('Cannot add service: service name not found');
    }
  }

  addMiddleware(scope, method) {
    if (!method) {
      method = scope; // eslint-disable-line
      scope = '*'; // eslint-disable-line
    }
    if (typeof method !== 'function') {
      throw Error('Cannot add Middleware: No valid function received');
    }
    this._middleware.push({scope, method});
    return this;
  }

  addErrorHandler(scope, method) {
    if (!method) {
      method = scope; // eslint-disable-line
      scope = '*'; // eslint-disable-line
    }
    if (typeof method !== 'function') {
      throw Error('Cannot add error handler: No valid function received');
    }
    this._errorHandlers.push({scope, method});
    return this;
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

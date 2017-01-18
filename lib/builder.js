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
    const invalidProtoErrorString = 'Cannot add service: ProtoFilePath is not a valid file';
    if (!fs.existsSync(protoFilePath)) {
      throw new Error(`${invalidProtoErrorString} path`);
    }
    if (path.extname(protoFilePath) !== '.proto') {
      throw new Error(invalidProtoErrorString);
    }
  }

  _isServiceFullNameValid(serviceFullName, protoFilePath) {
    const scopes = serviceFullName.split('.');
    const data = fs.readFileSync(protoFilePath, 'utf-8');
    const packageName = scopes.slice(0, scopes.length - 1).join('.');
    this._isNameValid(packageName, data, scopes.length);
    const serviceName = scopes[scopes.length - 1];
    this._isNameValid(serviceName, data);
  }

  _isNameValid(name, data, length) {
    const context = length ? 'package' : 'service';
    const error = `Cannot add service: ${context} name not found`;
    const regexEndingCharacter = length ? ';' : '{';
    const regex = new RegExp(`${context}\\s{1,}${name}\\s{0,}${regexEndingCharacter}`);
    const regexCondition = !regex.test(data);
    const contextCondition = length ? (regexCondition && length > 1) : regexCondition;
    if (contextCondition) {
      throw new Error(error);
    }
  }

  addMiddleware(scope, method) {
    if (!method) {
      method = scope; // eslint-disable-line
      scope = '*'; // eslint-disable-line
    }
    this._validateIsAFunction(method, 'Middleware');
    this._middleware.push({scope, method});
    return this;
  }

  addErrorHandler(scope, method) {
    if (!method) {
      method = scope; // eslint-disable-line
      scope = '*'; // eslint-disable-line
    }
    this._validateIsAFunction(method, 'error handler');
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

  _validateIsAFunction(method, context) {
    if (typeof method !== 'function') {
      throw Error(`Cannot add ${context}: No valid function received`);
    }
  }

  _validateImplementation(implementation) {
    if (!(implementation instanceof Object)) {
      throw new Error('Cannot add service: No valid implementation received');
    }
  }

};

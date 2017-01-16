module.exports = class {
  constructor() {
    this._services = [];
    this._middleware = [];
    this._errorHandlers = [];
  }

  _addService(protoFilePath, serviceFullName, implementation) {
    if (!(implementation instanceof Object)) {
      throw new Error('Cannot add service: No valid implementation received');
    }
    this._services.push({
      'protoFilePath': protoFilePath,
      'serviceFullName': serviceFullName,
      'implementation': implementation,
    });
    return this;
  }

  _addMiddleware(scope, method) {
    if (!method) {
      method = scope; // eslint-disable-line
      scope = '*'; // eslint-disable-line
    }
    if (typeof method !== 'function') {
      throw Error('Cannot add Middleware: No valid function received');
    }
    this._middleware.push({
      'scope': scope,
      'method': method,
    });
    return this;
  }

  _addErrorHandler(scope, method) {
    if (!method) {
      method = scope; // eslint-disable-line
      scope = '*'; // eslint-disable-line
    }
    if (typeof method !== 'function') {
      throw Error('Cannot add error handler: No valid function received');
    }
    this._errorHandlers.push({
      'scope': scope,
      'method': method,
    });
    return this;
  }

  _getServices() {
    return this._services;
  }

  _getMiddleware() {
    return this._middleware;
  }

  _getErrorHandlers() {
    return this._errorHandlers;
  }
};

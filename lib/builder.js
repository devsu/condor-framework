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
    this._services.push({
      'protoFilePath': protoFilePath,
      'serviceFullName': serviceFullName,
      'implementation': implementation,
    });
    return this;
  }

  addMiddleware(scope, method) {
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

  addErrorHandler(scope, method) {
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

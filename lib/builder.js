const grpc = require('grpc');
const _ = require('lodash');

module.exports = class {
  constructor(options) {
    const defaultOptions = {
      'host': '0.0.0.0',
      'port': 3000,
      'creds': grpc.credentials.createInsecure(),
    };

    this._services = [];
    this._middleware = [];
    this._errorHandlers = [];
    this._options = defaultOptions;
    _.assign(this._options, options);
  }

  addService(protoFilePath, serviceFullName, implementation) {
    this._services.push({
      'protoFilePath': protoFilePath,
      'serviceFullName': serviceFullName,
      'implementation': implementation,
    });
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

  getOptions() {
    return this._options;
  }
};

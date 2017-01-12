const grpc = require('grpc');
const _ = require('lodash');

module.exports = class {
  constructor(options) {
    const defaultOptions = {
      'host': '0.0.0.0',
      'port': 3000,
      'creds': grpc.credentials.createInsecure(),
    };

    this.services = [];
    this.middleware = [];
    this.errorHandlers = [];
    this.options = defaultOptions;
    _.assign(this.options, options);
  }

  addService(protoFilePath, serviceFullName, implementation) {
    this.services.push({
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
    this.middleware.push({
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
    this.errorHandlers.push({
      'scope': scope,
      'method': method,
    });
  }

  getServices() {
    return this.services;
  }

  getMiddleware() {
    return this.middleware;
  }

  getErrorHandlers() {
    return this.errorHandlers;
  }

  getOptions() {
    return this.options;
  }
};

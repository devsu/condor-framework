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
    this.middleware.push({
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

  getOptions() {
    return this.options;
  }
};

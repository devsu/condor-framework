const grpc = require('grpc');
const services = [];
const middlewares = [];
const defaultOptions = {
  'port': '3000',
  'host': '0.0.0.0',
  'creds': grpc.credentials.createInsecure(),
};
let options;


module.exports = class Builder {
  addService(protoPath, protoService, implementation) {
    services.push({
      'protoPath': protoPath,
      'protoService': protoService,
      'implementation': implementation,
    });
  }

  addMiddleware(scope, middleware) {

    const scopeType = typeof scope;
    if (scopeType === 'string' && !middleware) {
      throw new Error('No middleware was specified');
    }

    let middlewareObj = {
      'scope': scope,
      'middleware': middleware,
    };

    if (scopeType === 'function' && !middleware) {
      middlewareObj = {
        'middleware': scope,
      };
    }
    middlewares.push(middlewareObj);
  }

  setOptions(opts) {
    for (let key in defaultOptions) {
      if (!opts.hasOwnProperty(key)) {
        opts[key] = defaultOptions[key];
      }
    }
    options = opts;
  }

  getServices() {
    return services;
  }

  getMiddlewares() {
    return middlewares;
  }

  getOptions() {
    return options || defaultOptions;
  }
};

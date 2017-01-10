const services = [];
const middlewares = [];
let options;

module.exports = class Builder {
  registerService(protoPath, protoService, implementation) {
    services.push({
      'protoPath': protoPath,
      'protoService': protoService,
      'implementation': implementation,
    });
  }

  use(path, middleware) {
    middlewares.push({
      'path': path,
      'middleware': middleware,
    });
  }

  setOptions(opts) {
    options = opts;
  }

  getServices() {
    return services;
  }

  getMiddlewares() {
    return middlewares;
  }

  getOptions() {
    return options;
  }
};

const Context = require('./context');

module.exports = class {
  constructor(elements, context, implementation) {
    this._validateParameters(elements, context, implementation);
    this._middleware = elements.middleware;
    this._errorHandlers = elements.errorHandlers;
    this._context = context;
    this._implementation = implementation;
    this._index = 0;
    this._errorIndex = 0;
  }

  _validateParameters(elements, context, implementation) {
    const error = 'Could not create iterator:';
    if (!elements || !(elements instanceof Object)) {
      throw new Error(`${error} Elements object is required`);
    }
    if (!elements.middleware && !elements.errorHandlers) {
      throw new Error(`${error} Elements need middleware or errorHandlers property`);
    }
    if (!context || !(context instanceof Context)) {
      throw new Error(`${error} A context is required`);
    }
    if (!implementation || !(implementation instanceof Object)) {
      throw new Error(`${error} A implementation is required`);
    }
    if (!implementation.name || !implementation.instance) {
      throw new Error(`${error} Implementation needs instance and name properties`);
    }
  }

  next(error) {
    if (error) {
      return this._callErrorHandlers(error);
    }

    this._errorIndex = 0;
    if (this._isExecutionDone()) {
      return Promise.resolve(this._context.getResponse());
    }

    if (this._shouldCallImplementation()) {
      this._index++;
      return this._callImplementation();
    }

    return this._callMiddleware();
  }

  _isExecutionDone() {
    return this._context.getResponse() || this._index > this._middleware.length;
  }

  _shouldCallImplementation() {
    return this._index === this._middleware.length;
  }

  _callImplementation() {
    const implementation = this._implementation.instance;
    const propertyName = this._implementation.name;
    return Promise.resolve().then(() => {
      return implementation[propertyName].call(implementation, this._context.call);
    }).then((result) => {
      this._context.send(result);
      return this._context.getResponse();
    }).catch((error) => {
      return this.next(error);
    });
  }

  _callMiddleware() {
    const middlewareItem = this._middleware[this._index++];
    return Promise.resolve().then(() => {
      return middlewareItem.method.call(middlewareItem, this._context, this.next.bind(this));
    }).then(() => {
      return Promise.resolve(this._context.getResponse());
    }).catch((err) => {
      if (this._isExecutionDone()) {
        return Promise.reject(err);
      }
      return this.next(err);
    });
  }

  _callErrorHandlers(error) {
    if (this._errorIndex < this._errorHandlers.length) {
      const errorHandler = this._errorHandlers[this._errorIndex++];
      return Promise.resolve().then(() => {
        const args = [error, this._context, this.next.bind(this)];
        return errorHandler.method.call(this._errorHandlers, ...args);
      }).then(() => {
        if (this._context.getResponse()) {
          return Promise.resolve(this._context.getResponse());
        }
        return Promise.reject(new Error('No response send after error was handled'));
      });
    }
    return Promise.reject(error);
  }
};

const Context = require('./context');
const noResponseError = new Error('No response sent after handling error');

module.exports = class {
  constructor(elements, context, implementation) {
    this._validateParameters(elements, context, implementation);
    this._middleware = elements.middleware;
    this._errorHandlers = elements.errorHandlers;
    this._context = context;
    this._implementation = implementation;
    this._index = 0;
    this._errorIndex = 0;
    this._pendingPromises = [];
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
      return this._resolveIterator();
    }
    if (this._shouldCallImplementation()) {
      const promise = this._callImplementation();
      this._pendingPromises.push(promise);
      return promise;
    }
    return this._callMiddleware();
  }

  _isExecutionDone() {
    return this._getResponse() || this._index > this._middleware.length;
  }

  _shouldCallImplementation() {
    return this._index === this._middleware.length;
  }

  _callImplementation() {
    this._index++;
    const implementation = this._implementation.instance;
    const propertyName = this._implementation.name;
    return Promise.resolve().then(() => {
      return implementation[propertyName].call(implementation, this._context);
    }).then((result) => {
      this._context.send(result);
      return this._getResponse();
    }).catch((error) => {
      this._pendingPromises = [];
      return this.next(error);
    });
  }

  _callMiddleware() {
    const middlewareItem = this._middleware[this._index++];
    return Promise.resolve().then(() => {
      return middlewareItem.method.call(middlewareItem, this._context, this.next.bind(this));
    }).then(() => {
      return this._resolveIterator();
    }).catch((error) => {
      return this.next(error);
    });
  }

  _callErrorHandlers(error) {
    if (this._errorIndex >= this._errorHandlers.length) {
      return Promise.reject(error);
    }
    const errorHandler = this._errorHandlers[this._errorIndex++];
    const args = [error, this._context, this.next.bind(this)];

    return Promise.resolve().then(() => {
      return errorHandler.method.call(this._errorHandlers, ...args);
    }).then(() => {
      return (this._getResponse()) ? this._resolveIterator() : this._sendNoResponse();
    }).catch((error) => {
      return (error !== noResponseError) ? this.next(error) : this._sendNoResponse();
    });
  }

  _sendNoResponse() {
    return Promise.reject(noResponseError);
  }

  _resolveIterator() {
    // Wait for the implementation promise to fulfill before returning the response
    return Promise.all(this._pendingPromises).then(() => {
      return this._getResponse();
    });
  }

  _getResponse() {
    return this._context.getResponse();
  }
};

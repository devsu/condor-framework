const Context = require('./context');

module.exports = class {
  constructor(elements, context, implementation) {
    this._validateParameters(elements, context, implementation);
    this._elements = elements;
    this._context = context;
    this._implementation = implementation;
    this._index = 0;
  }

  _validateParameters(elements, context, implementation) {
    if (!elements || !(elements instanceof Array)) {
      throw new Error('Could not create iterator: An array of elements is required');
    }
    if (!context || !(context instanceof Context)) {
      throw new Error('Could not create iterator: A context is required');
    }
    if (!implementation || !(implementation instanceof Object)) {
      throw new Error('Could not create iterator: A implementation is required');
    }
    if (!implementation.name || !implementation.class) {
      throw new Error('Could not create iterator: Implementation needs class and name properties');
    }
  }

  next() {
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
    return this._context.getResponse() || this._index > this._elements.length;
  }

  _shouldCallImplementation() {
    return this._index === this._elements.length;
  }

  _callImplementation() {
    const [implementation, propertyName] = [this._implementation.class, this._implementation.name];
    return Promise.resolve().then(() => {
      return implementation[propertyName].call(implementation, this._context.call);
    }).then((result) => {
      this._context.send(result);
      return this._context.getResponse();
    });
  }

  _callMiddleware() {
    const middlewareItem = this._elements[this._index++];
    const middlewareResult =
      middlewareItem.method.call(middlewareItem, this._context, this.next.bind(this));
    return Promise.resolve(middlewareResult).then(() => {
      return Promise.resolve(this._context.getResponse());
    });
  }
};

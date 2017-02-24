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
    if (!implementation || !(implementation instanceof Function)) {
      throw new Error('Could not create iterator: A implementation is required');
    }
  }

  next() {
    if (this._context.getResponse()) {
      return Promise.resolve(this._context.getResponse());
    }
    const middlewareItem = this._elements[this._index++];
    const middlewareResult =
      middlewareItem.method.call(middlewareItem, this._context, this.next.bind(this));
    return Promise.resolve(middlewareResult).then(() => {
      return Promise.resolve(this._context.getResponse());
    });
  }
};

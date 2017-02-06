module.exports = class {
  constructor(callback) {
    this._validateCallback(callback);
    this._callback = callback;
    this._done = false;
  }

  _validateCallback(callback) {
    if (!callback) {
      throw new Error('Callback is undefined');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback is not a function');
    }
  }

  resolve(result) {
    this._validateResponse();
    this._done = true;
    this._callback(null, result);
  }

  reject(error) {
    this._validateResponse();
    this._done = true;
    this._callback(error);
  }

  _validateResponse() {
    if (this.isDone()) {
      throw new Error('Cannot resolve/reject a response already resolved/rejected');
    }
  }

  isDone() {
    return this._done;
  }
};

const Promise = require('bluebird');

module.exports = class {
  constructor(callback) {
    this._validateCallback(callback);
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
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
    try {
      this._callback(null, result);
      this._resolve(result);
    } catch (error) {
      this._reject(error);
    }
    return this._promise;
  }

  reject(details, code) {
    this._validateResponse();
    let error = details;
    if (!(details instanceof Object)) {
      error = this._getErrorData(details, code);
    }
    this._setError(error);
    this._reject(error);
    return this._promise;
  }

  _getErrorData(details, code) {
    const error = {};
    if (details) {
      error.details = details;
    }

    if (code) {
      error.code = code;
    }

    return error;
  }

  _setError(error) {
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

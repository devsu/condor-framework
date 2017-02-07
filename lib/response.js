const grpc = require('grpc');
const Promise = require('bluebird');

module.exports = class {
  constructor(callback, metadata) {
    this._validateCallback(callback);
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this._callback = callback;
    this._done = false;
    this._hasError = false;
    this.metadata = metadata || new grpc.Metadata();
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
    this._result = result;
    try {
      this._callback(null, result);
      this._resolve(result);
    } catch (error) {
      this._reject(error);
    }
    return this._promise;
  }

  reject(code, message) {
    this._validateResponse();
    const errorData = this._getErrorData(code, message);
    const error = new Error(errorData.message);
    error.code = errorData.code;
    this._setError(error);
    this._reject(error);
    return this._promise;
  }

  _getErrorData(code, message) {
    let errorData = {
      'message': 'Internal Server Error',
      'code': grpc.status.INTERNAL,
    };

    if (code instanceof Error) {
      [code, message] = [code.code, code.message]; // eslint-disable-line
    }

    if (code && message) {
      errorData = Object.assign(errorData, {code, message});
    }

    if (message) {
      errorData = Object.assign(errorData, {message});
    }

    if (this._isCodeANumber(code)) {
      errorData = Object.assign(errorData, {code});
    }

    if (this._isCodeAValidObject(code)) {
      errorData = Object.assign(errorData, code);
    }

    return errorData;
  }

  _isCodeAValidObject(code) {
    return code && (code.code || code.message);
  }

  _isCodeANumber(code) {
    return code && Number.isSafeInteger(code);
  }

  _setError(error) {
    this._done = true;
    this._hasError = true;
    this._error = error;
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

  hasError() {
    return this._hasError;
  }

  getResult() {
    this._validateResponseNotDone();
    return this._result;
  }

  getError() {
    this._validateResponseNotDone();
    return this._error;
  }

  _validateResponseNotDone() {
    if (!this.isDone()) {
      throw new Error('Response have not been resolved/rejected');
    }
  }
};

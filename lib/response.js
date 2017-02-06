module.exports = class {
  constructor(callback) {
    if (!callback) {
      throw new Error('Callback is undefined');
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback is not a function');
    }
    this._callback = callback;
    this._isCallbackCalled = false;
  }

  resolve(result) {
    if (this._isCallbackCalled) {
      throw new Error('Cannot resolve/reject a response already resolved/rejected');
    }
    this._isCallbackCalled = true;
    this._callback(null, result);
  }

  reject(error) {
    if (this._isCallbackCalled) {
      throw new Error('Cannot resolve/reject a response already resolved/rejected');
    }
    this._isCallbackCalled = true;
    this._callback(error);
  }
};

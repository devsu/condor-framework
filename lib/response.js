const grpc = require('grpc');

module.exports = class {
  constructor(message, metadata) {
    this._validateResponseMessage(message);
    this._message = message || {};
    if (metadata) {
      this._metadata = metadata;
    }
  }

  _validateResponseMessage(message) {
    if (message instanceof grpc.Metadata) {
      throw new Error('Response Error: Message should not be Metadata');
    }
  }

  getGrpcObject() {
    return this._message;
  }

  getMetadata() {
    return this._metadata;
  }

};

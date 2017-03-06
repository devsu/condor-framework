const grpc = require('grpc');

module.exports = class {
  constructor(message, metadata) {
    if (message instanceof grpc.Metadata) {
      this._message = {};
      this._metadata = message;
      return;
    }
    this._message = message || {};
    if (metadata) {
      this._metadata = metadata;
    }
  }

  getGrpcObject() {
    return this._message;
  }

  getMetadata() {
    return this._metadata;
  }

};

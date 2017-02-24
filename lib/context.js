const Response = require('./response');

module.exports = class {
  constructor(call) {
    this.call = call;
    this.request = this.call.request;
    this.metadata = this.call.metadata;
  }

  send(message, metadata) {
    if (message instanceof Response) {
      this._response = message;
      return;
    }
    this._response = new Response(message, metadata);
  }

  getResponse() {
    return this._response;
  }
};

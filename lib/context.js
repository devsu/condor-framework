const Response = require('./response');

module.exports = class {
  constructor(call) {
    this.call = call;
    this.request = this.call.request;
    this.metadata = this.call.metadata;
    this.write = this.call.write;
    this.on = this.call.on;
    this.end = this.call.end;
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

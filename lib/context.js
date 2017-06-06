const Response = require('./response');

module.exports = class {
  constructor(call, properties) {
    this.call = call;
    this.properties = properties;
    this.req = this.request = this.call.request;
    this.meta = this.metadata = this.call.metadata;
  }

  write() {
    return this.call.write.call(this.call, ...arguments);
  }

  on() {
    return this.call.on.call(this.call, ...arguments);
  }

  end() {
    return this.call.end.call(this.call, ...arguments);
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

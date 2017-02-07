const Promise = require('bluebird');

module.exports = class {
  simple(call, res) {
    res.resolve(this._buildResponse(call.request.message));
  }

  streamToServer(stream, res) {
    let messages = '';
    return new Promise((resolve) => {
      stream.on('data', (data) => {
        messages = messages.concat(data.message);
      });
      stream.on('end', () => {
        resolve(res.resolve(this._buildResponse(messages)));
      });
    });
  }

  streamToClient(stream) {
    const message = stream.request.message;
    stream.write(this._buildResponse(message));
    stream.write(this._buildResponse(message));
    stream.end();
  }

  bidirectionalStream(stream) {
    stream.on('data', (data) => {
      stream.write(this._buildResponse(data.message));
    });
    stream.on('end', () => {
      stream.end();
    });
  }

  _buildResponse(message) {
    return {'message': `You sent: '${message}'.`};
  }
};

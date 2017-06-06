const Promise = require('bluebird');

module.exports = class {
  simple(ctx) {
    return this._buildResponse(ctx.req.message);
  }

  streamToServer(ctx) {
    let messages = '';
    return new Promise((resolve) => {
      ctx.on('data', (data) => {
        messages = messages.concat(data.message);
      });
      ctx.on('end', () => {
        resolve(this._buildResponse(messages));
      });
    });
  }

  streamToClient(ctx) {
    const message = ctx.req.message;
    ctx.write(this._buildResponse(message));
    ctx.write(this._buildResponse(message));
    ctx.end();
  }

  bidirectionalStream(ctx) {
    ctx.on('data', (data) => {
      ctx.write(this._buildResponse(data.message));
    });
    ctx.on('end', () => {
      ctx.end();
    });
  }

  _buildResponse(message) {
    return {'message': `You sent: '${message}'.`};
  }
};

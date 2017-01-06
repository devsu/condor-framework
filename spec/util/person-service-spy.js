const Spy = require('./spy');

module.exports = class {
  list(call) {
    return Spy.resolve();
  }
};

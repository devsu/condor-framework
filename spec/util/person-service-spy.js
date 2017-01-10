const Spy = require('./spy');

module.exports = class {
  static list() {
    return Spy.resolve();
  }
};

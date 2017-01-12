class Spy {

  static create(name) {
    return jasmine.createSpy(name);
  }

  static resolve(value, name) {
    return jasmine.createSpy(name).and.callFake(() => Promise.resolve(value));
  }

  static reject(value = new Error(), name) {
    return jasmine.createSpy(name).and.callFake(() => Promise.reject(value));
  }

  static returnValue(value, name) {
    return jasmine.createSpy(name).and.returnValue(value);
  }

  static returnValues(...values) {
    return jasmine.createSpy().and.returnValues(...values);
  }

}

module.exports = Spy;

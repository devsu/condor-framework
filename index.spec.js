const Condor = require('./index');
const CondorFacade = require('./lib/condor');

describe('condor-framework', () => {
  it('should expose the condor facade', () => {
    expect(Condor).toBe(CondorFacade);
  });
});

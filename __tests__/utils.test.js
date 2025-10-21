const base = require('../src/ghstar.js');

describe('Verify $__ghstar.util', () => {
  it('check randomInteger() for proper output ', async () => {
    const test = base.$__ghstar.util.randomInteger(1000, 2000);
    expect(test).toBeGreaterThan(1000);
    expect(test).toBeLessThan(2000);
  });
  it('check padCountWithZeros() length ', async () => {
    const test = base.$__ghstar.util.padCountWithZeros('1234', 7);
    expect(test.length).toEqual(7);
  });
});

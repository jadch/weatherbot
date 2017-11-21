const assert = require('assert');
const weatherWebhook = require('../src/index.js');

const Testobject = { body: { result: { parameters: { 'geo-city': 'paris', date: '' } } } };

describe('#indexOf()', () => {
  it('should return -1 when the value is not present', () => {
    assert.equal(-1, [1, 2, 3].indexOf(4));
  });
  it('Testing weatherWebhook function', () => {
    weatherWebhook(Testobject).should.equal('3');
  });
});

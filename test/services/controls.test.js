const assert = require('assert');
const app = require('../../src/app');

describe('\'controls\' service', () => {
  it('registered the service', () => {
    const service = app.service('controls');

    assert.ok(service, 'Registered the service');
  });
});

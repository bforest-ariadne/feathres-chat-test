const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

module.exports = {
  before: {
    all: [ authenticate('jwt')],
    find: [],
    get: [],
    create: [checkPermissions({
      roles: [ 'admin' ]
    })],
    update: [],
    patch: [],
    remove: [checkPermissions({
      roles: [ 'admin' ]
    })]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

const { authenticate } = require('@feathersjs/authentication').hooks;

const processMessage = require('../../hooks/process-message');

const populateUser = require('../../hooks/populate-user');

const { setField } = require('feathers-authentication-hooks');

const limitToUser = setField({
  from: 'params.user._id',
  as: 'params.query.userId'
});

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [processMessage()],
    update: [limitToUser],
    patch: [limitToUser],
    remove: [limitToUser]
  },

  after: {
    all: [populateUser()],
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

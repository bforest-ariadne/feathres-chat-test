// Initializes the `controls` service on path `/controls`
const { Controls } = require('./controls.class');
const createModel = require('../../models/controls.model');
const hooks = require('./controls.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/controls', new Controls(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('controls');

  service.hooks(hooks);
};

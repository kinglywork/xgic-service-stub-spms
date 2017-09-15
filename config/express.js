/**
 * Created by xiaoling on 18/08/2017.
 */

const express = require('express');
const bodyParser = require('body-parser');

/**
 * Initialize application middleware
 */
const initMiddleware = function (app) {
  app.disable('x-powered-by');
  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
  app.use(bodyParser.json({limit: '10mb'}));
};

/**
 * Initialize server routes.
 */
const initRoutes = function (app) {
  app.get('/hc', (req, res) => {
    res.status(200).send('');
  });
};

/**
 * Initialize the Express application
 */
module.exports.init = function () {
  const app = express();
  initMiddleware(app);
  initRoutes(app);

  return app;
};

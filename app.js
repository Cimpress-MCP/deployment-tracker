var SwaggerExpress = require('swagger-express-mw');
app = require('express')();
module.exports = app;  // for testing

var swaggerConfig = {
  appRoot: __dirname // required config
};

var config = require("./config.js");

var logger = require('./lib/logger.js').getLogger({'module': __filename});
logger.info('Deployment Tracker starting up.');

var statsd_client = require('./lib/statsd.js').init(config.statsd || {});
var redis_client = require('./lib/redis.js').init(config.redis || {});
redis_client.on('error', function (err) {
  logger.error(err, "Error in redis_client");
  statsd_client.increment('deployment-tracker.redis.error');
});

var db = require("./data/models/index.js");
db.sequelize.options.logging = function(message) {
  logger.info(message);
};

app.set('config', config);
app.set('redis', redis_client);
app.set('statsd', statsd_client);
app.set('db', db);

SwaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {
  if (err) { throw err; }

  swaggerExpress.register(app);

  var port = config.port || 8080;
  var host = config.host || '::';
  app.listen(port);
  console.log("Deployment Tracker listening on port " + port);
});
console.log("Deployment Tracker started");

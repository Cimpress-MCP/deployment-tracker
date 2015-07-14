// Disable "use strict" so we can set to global app.
// This is a bad habit to get into - controllers can
// get this from the request, anyway, with `req.app`.
/* jshint strict: false */

var SwaggerExpress = require("swagger-express-mw");
app = require("express")();
module.exports = app;  // for testing

var swaggerConfig = {
  appRoot: __dirname // required config
};

var config = require("./config.json");

var logger = require("./lib/logger.js").getLogger({"module": __filename});
logger.info("Deployment Tracker starting up.");

var statsdClient = require("./lib/statsd.js").init(config.statsd || {});
var redisClient = require("./lib/redis.js").init(config.redis || {});
redisClient.on("error", function (err) {
  logger.error(err, "Error in redis_client");
  statsdClient.increment("deployment-tracker.redis.error");
});

var db = require("./data/models/index.js");
db.sequelize.options.logging = function(message) {
  logger.info(message);
};

app.set("config", config);
app.set("redis", redisClient);
app.set("statsd", statsdClient);
app.set("db", db);

// This ensures our DB is up-to-date before we start serving traffic.
// However, it (a) causes tests to run slower and (b) causes tests to
// throw schema validation errors for some reason.
//db.sequelize.sync().then(function () {
  SwaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {
    if (err) { throw err; }

    swaggerExpress.register(app);
    app.use(require("./api/middleware/pageLinks.js"));

    var port = config.port || 8080;
    var host = config.host || "::";
    app.listen(port, function(){
      console.log("Deployment Tracker listening on port " + port);
    });

  });
//});
console.log("Deployment Tracker started");

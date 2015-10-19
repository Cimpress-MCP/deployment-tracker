// Disable "use strict" so we can set to global app.
// This is a bad habit to get into - controllers can
// get this from the request, anyway, with `req.app`.
/* jshint strict: false */

var SwaggerExpress = require("swagger-express-mw");
app = require("express")();
module.exports = app;  // for testing

// Enable CORS for the swagger route only, so that this can be used with Swagger UI.
app.use("/swagger", require("./api/middleware/enableCors.js"));

var swaggerConfig = {
  appRoot: __dirname // required config
};

var config = require("./config.json");

Logger = require("./lib/logger.js");

if (process.env.DEPLOYMENT_TRACKER_LOG_PATH) {
  Logger.setLogDir(process.env.DEPLOYMENT_TRACKER_LOG_PATH);
}

var logger = Logger.getLogger({"module": __filename});
logger.info("Deployment Tracker starting up.");

var statsdClient = require("./lib/statsd.js").init(config.statsd || {});
var redisClient = require("./lib/redis.js").init(config.redis || {});

var db = require("./data/models/index.js");
db.sequelize.options.logging = function(message) {
  logger.info(message);
};

app.set("config", config);
app.set("redis", redisClient);
app.set("statsd", statsdClient);
app.set("db", db);

var Umzug = require("umzug");
var umzug = new Umzug({
  storage: "sequelize",
  storageOptions: {
    sequelize: db.sequelize
  },
  migrations: {
    path: "data/migrations",
    params: [ db.sequelize.getQueryInterface(),
              db.sequelize.constructor
    ],
  }
});

// Run all pending migrations and start the application afterward.
umzug.up().then(function(){
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
});

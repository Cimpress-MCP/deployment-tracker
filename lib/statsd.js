"use strict";

var logger = require("./logger.js").getLogger({"module": __filename});

module.exports.init = function(config) {
  try {
    var StatsD = require("node-statsd"),
      statsdClient = new StatsD(config.statsd);

    statsdClient.socket.on("error", function(err) {
      logger.error("Error in statsd socket: ", err);
    });

    return statsdClient;
  } catch(e) {
    logger.fatal(e, "Unable to create statsd_client targeting host %s", config.statsd.host);
  }
};

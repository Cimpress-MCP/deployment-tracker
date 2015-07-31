"use strict";

var logger = Logger.getLogger({"module": __filename});

module.exports.init = function(config) {
  try {
    var StatsD = require("node-statsd"),
      statsdClient = new StatsD(config);

    statsdClient.socket.on("error", function(err) {
      logger.error("Error in statsd socket: ", err);
    });

    statsdClient.escape = function(s) {
      return s.replace(".", "_");
    };

    return statsdClient;
  } catch(e) {
    logger.fatal(e, "Unable to create statsd_client targeting host %s", config.host);
  }
};

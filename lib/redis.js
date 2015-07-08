"use strict";

var logger = require("./logger.js").getLogger({"module": __filename});
var _ = require("lodash");

module.exports.init = function(config) {
  try {

    var redisClient;
    if (process.env.DEPLOYMENT_TRACKER_MOCK_REDIS || "" !== "") {
      var MockRedis = require("redis-mock");
      redisClient = MockRedis.createClient();
    } else {
      var Redis = require("ioredis");
      redisClient = new Redis(config);
    }

    redisClient.on("connect", function() {
        logger.info("connected to redis");
    });

    redisClient.on("error", function (err) {
      logger.error(err, "Error caught from redis_client.");
    });

    redisClient.key = config.key || "logstash";

    // Add index and addtional_fields to the log message and return it
    redisClient.updateLogMessage = function(message) {
      message.index = config.index || "deployment-tracker";
      _.assign(message, config.additional_fields || {});
      return message;
    };

    return redisClient;
  } catch(e) {
    logger.fatal(e, "Unable to create redis_client targeting host %s", config.redis.host);
  }
};

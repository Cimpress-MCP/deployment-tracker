"use strict";

var logger = require("./logger.js").getLogger({"module": __filename});

module.exports.init = function(config) {
  try {
    var Redis = require("ioredis"),
        redisClient = new Redis(config);

    redisClient.on("connect", function() {
        logger.info("connected to redis");
    });

    redisClient.on("error", function (err) {
      logger.error(err, "Error caught from redis_client.");
    });

    return redisClient;
  } catch(e) {
    logger.fatal(e, "Unable to create redis_client targeting host %s", config.redis.host);
  }
};

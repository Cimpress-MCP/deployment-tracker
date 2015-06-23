var logger = require('./logger.js').getLogger({'module': __filename});

module.exports.init = function(config) {
  try {
    var redis = require("ioredis"),
        redis_client = new redis({ port: config.redis.port || 6379, host: config.redis.host });

    redis_client.on("connect", function() {
        logger.info("connected to redis");
    });

    redis_client.on('error', function (err) {
      logger.error(err, 'Error caught from redis_client.');
    });

    return redis_client;
  } catch(e) {
    logger.fatal(e, 'Unable to create redis_client targeting host %s', config.redis.host);
  }
};

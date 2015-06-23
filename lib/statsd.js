var logger = require('./logger.js').getLogger({'module': __filename});

module.exports.init = function(config) {
  try {
    var StatsD = require('node-statsd'),
      statsd_client = new StatsD(config.statsd);

    statsd_client.socket.on('error', function(err) {
      logger.error("Error in statsd socket: ", err);
    });

    return statsd_client;
  } catch(e) {
    logger.fatal(e, 'Unable to create statsd_client targeting host %s', config.statsd.host);
  }
};

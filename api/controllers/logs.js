'use strict';

var logger = require('../../lib/logger.js').getLogger({'module': __filename});

var util = require('util');
var statsd_client = app.get('statsd');
var redis_client = app.get('redis');
var db = app.get('db');

module.exports = {
  postLogs: postLogs
};

function postLogs(req, res) {
  var message = req.swagger.params.body.value;
  message.deployment_id = req.swagger.params.id.value;
  redis_client.rpush("logstash", JSON.stringify(message));
  statsd_client.increment("log_message");
  res.status(201).end();
}

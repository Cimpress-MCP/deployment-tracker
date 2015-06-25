"use strict";

var logger = require("../../lib/logger.js").getLogger({"module": __filename});

var util = require("util");
var statsdClient = app.get("statsd");
var redisClient = app.get("redis");
var db = app.get("db");

module.exports = {
  postLogs: postLogs
};

function postLogs(req, res) {
  var message = req.swagger.params.body.value;
  message.deployment_id = req.swagger.params.id.value;
  redisClient.rpush("deployment-tracker", JSON.stringify(message));
  statsdClient.increment("log_message");
  res.status(201).end();
}

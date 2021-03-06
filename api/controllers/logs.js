"use strict";

var logger = Logger.getLogger({"module": __filename});

var util = require("util");
var statsdClient = app.get("statsd");
var redisClient = app.get("redis");
var db = app.get("db");

module.exports = {
  postLogs: postLogs
};

function postLogs(req, res) {
  var messages = req.swagger.params.body.value;
  messages.forEach(function(message) {
    message.deployment_id = req.swagger.params.id.value;
    message = redisClient.updateLogMessage(message);
    redisClient.rpush(redisClient.key, JSON.stringify(message), function(err, result) {
      if (err) {
        res.status(500).json({ "error" : err.message});
      } else {
        statsdClient.increment("logs.message");
      }
    });
  });
  res.status(201).end();
}

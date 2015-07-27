"use strict";

var util = require("util"),
    statsdClient = app.get("statsd"),
    redisClient = app.get("redis"),
    db = app.get("db"),
    redactor = require("loofah").object_keys(["password"]);

module.exports = {
  config: config,
  healthcheck: healthcheck
};

function config(req, res) {
  res.json(redactor(req.app.get("config")));
}

function healthcheck(req, res) {
  require("../../lib/healthcheck/index.js")()
    .then(function(results){
      // If any tests have failed, return with a 503
      var failures = [];
      Object.keys(results.tests).forEach(function (key) {
        var value = results.tests[key];
        if (value.result === "failed") {
          failures.push(value);
        }
      });
      res.status((failures.length > 0) ? 503 : 200).json(results);
    }).catch(function(results){
      res.status(503).json(results);
    });
}

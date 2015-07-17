"use strict";

var util = require("util"),
    statsdClient = app.get("statsd"),
    redisClient = app.get("redis"),
    db = app.get("db"),
    Scrubbers = require("loofah");

module.exports = {
  config: config,
  healthcheck: healthcheck
};

function config(req, res) {
  var redact_passwords = Scrubbers.object_keys(["password"]);
  res.json(redact_passwords(req.app.get("config")));
}

function healthcheck(req, res) {
  require("../../lib/healthcheck/index.js")()
    .then(function(results){
      // If any tests have failed, return with a 503
      var failures = results.tests.filter(function(e) {
        return e.test_result === "failed";
      });

      res.status((failures.length > 0) ? 503 : 200).json(results);
    }).catch(function(results){
      res.status(503).json(results);
    });
}

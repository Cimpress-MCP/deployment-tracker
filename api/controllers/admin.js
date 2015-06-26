"use strict";

var util = require("util");
var statsdClient = app.get("statsd");
var redisClient = app.get("redis");
var db = app.get("db");

module.exports = {
  config: config,
  healthcheck: healthcheck
};

function config(req, res) {
  res.json(req.app.get("config"));
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

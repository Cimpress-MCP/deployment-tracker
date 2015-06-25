"use strict";

var util = require("util");
var statsdClient = app.get("statsd");
var redisClient = app.get("redis");
var db = app.get("db");

// Store the last state of the different healthcheck tests that we run. The
// /heathcheck route will return a 503 on the first failed check, but we can
// at least return the statuses of the other checks, even if they are out of date.
var tests = {
  redis: {
    test_name: "redis"
  },
  statsd: {
    test_name: "statsd"
  },
  db: {
    test_name: "database"
  }
};

module.exports = {
  config: config,
  healthcheck: healthcheck
};

function config(req, res) {
  res.json(req.app.get("config"));
}

function healthcheck(req, res) {
  var reportStart = process.hrtime();
  var report = {
    report_as_of: new Date().toISOString(),
    duration_millis: 0,
    tests: []
  };

  var redisStart = process.hrtime();
  tests.redis.tested_at = new Date().toISOString();
  redisClient.ping(function(err, result) {
    tests.redis.duration_millis = elapsed_time(redisStart);
    if (err) {
      tests.redis.test_result = "failed";
      finalizeReport(report, reportStart);
      res.status(503).json(report);
    } else {
      tests.redis.test_result = "passed";

      var statsdStart = process.hrtime();
      tests.statsd.tested_at = new Date().toISOString();
      statsdClient.increment("healthcheck", 1, 1, function(err, bytes) {

        tests.statsd.duration_millis = elapsed_time(statsdStart);
        if (err) {
          tests.statsd.test_result = "failed";
          finalizeReport(report, reportStart);
          res.status(503).json(report);
        } else {
          tests.statsd.test_result = "passed";
          var dbStart = process.hrtime();
          tests.db.tested_at = new Date().toISOString();
          db.Deployment.findOne().catch(function(error) {
            tests.db.duration_millis = elapsed_time(dbStart);
            tests.db.test_result = "failed";
            finalizeReport(report, reportStart);
            res.status(503).json(report);
          }).then(function(deployment) {
            tests.db.duration_millis = elapsed_time(dbStart);
            tests.db.test_result = "passed";
            finalizeReport(report, reportStart);
            res.json(report);
          });
        }
      });
    }
  });
}

function finalizeReport(report, reportStart) {
  report.tests.push(tests.redis);
  report.tests.push(tests.statsd);
  report.tests.push(tests.db);
  report.duration_millis = elapsed_time(reportStart);
}

var elapsed_time = function(start){
  return (process.hrtime(start)[1] / 1000000).toFixed(1); // divide by a million to get nano to milli
};

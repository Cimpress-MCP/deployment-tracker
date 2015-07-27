"use strict";

var config = require("../../config.json"),
    statsdClient = require("../../lib/statsd.js").init(config.statsd || {});

function elapsed_time (start){
  return (process.hrtime(start)[1] / 1000000).toFixed(1); // divide by a million to get nano to milli
}

function runTest(resolve, reject) {
  var results = { test_name: "statsd" },
      start = process.hrtime();

  results.tested_at = new Date().toISOString();
  try {
    statsdClient.increment("healthcheck", 1, 1, function(err, bytes) {
      if (err) {
        results.error = err.message;
        results.result = "failed";
      } else {
        results.result = "passed";
      }

      results.duration_millis = elapsed_time(start);
      resolve(results);
    });
  } catch(err) {
    results.result = "failed";
    results.error = err.message;
    results.duration_millis = elapsed_time(start);
    resolve(results);
  }
}

module.exports = function() {
  return new Promise(runTest);
};

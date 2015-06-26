"use strict";
var config = require("../../config.js"),
    redisClient = require("../../lib/redis.js").init(config.redis || {});

function elapsed_time (start){
  return (process.hrtime(start)[1] / 1000000).toFixed(1); // divide by a million to get nano to milli
}

function runTest(resolve, reject) {
  var results = { test_name: "redis" },
      start = process.hrtime();

  results.tested_at = new Date().toISOString();
  try{
    redisClient.ping(function(err, result) {
      if (err) {
        results.test_result = "failed";
        results.error = err.message;
      } else {
        results.test_result = "passed";
      }
      results.duration_millis = elapsed_time(start);
      resolve(results);
    });
  } catch(err) {
    results.test_result = "failed";
    results.error = err;
    results.duration_millis = elapsed_time(start);
    resolve(results);
  }
}

module.exports = function() {
  return new Promise(runTest);
};

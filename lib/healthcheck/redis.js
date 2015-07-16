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
    // The ping call seems to go out to lunch and never return if it doesn't have
    // a good redis connection, which means that we can't reason about the state
    // of the other dependencies. I'd rather force a timeout.
    setTimeout(function() {
      results.test_result = "failed";
      results.duration_millis = elapsed_time(start);
      results.error = "timeout";
      resolve(results);
    }, 2000);
    redisClient.ping(function(err, result) {
      clearTimeout();
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

"use strict";

var db = require("../../data/models/index.js");

function elapsed_time (start){
  return (process.hrtime(start)[1] / 1000000).toFixed(1); // divide by a million to get nano to milli
}

function runTest(resolve, reject) {
  var results = { name: "db" },
      dbStart = process.hrtime();

  results.tested_at = new Date().toISOString();
  try {
    db.Deployment.findOne().catch(function(error) {
      results.duration_millis = elapsed_time(dbStart);
      results.error = error.message;
      results.test_result = "failed";
      resolve(results);
    }).then(function(deployment) {
      results.duration_millis = elapsed_time(dbStart);
      results.test_result = "passed";
      resolve(results);
    });
  } catch(err) {
    results.test_result = "failed";
    results.error = err;
    results.duration_millis = elapsed_time(dbStart);
    resolve(results);
  }
}

module.exports = function() {
  return new Promise(runTest);
};

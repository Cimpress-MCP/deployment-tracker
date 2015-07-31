"use strict";

var fs        = require("fs");
var path      = require("path");
var basename  = path.basename(module.filename);
var logger    = Logger.getLogger({"module": __filename});

module.exports = function () {
  var reportStart = process.hrtime();
  var report = {
    generated_at: new Date().toISOString(),
    duration_millis: 0,
    tests: {}
  };

  // Load up an array of promises for each (other) file in this directory
  // All tests should resolve and never reject to avoid breaking other tests
  var tests = [];
  fs.readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== basename);
    })
    .forEach(function(file) {
      logger.info("Running test: " + file);
      tests.push(require("./" + file)());
    });

  // Once all promises have resolved, return the report
  return Promise.all(tests)
      .then(function (results) {
        results.forEach(function(result) {
          report.tests[result.test_name] = result;
        });
        finalizeReport(report, reportStart);
        return report;
      }).catch(function (results) {
        results.forEach(function(result) {
          report.tests[result.test_name] = result;
        });
        finalizeReport(report, reportStart);
        return report;
      });
};

function finalizeReport(report, reportStart) {
  report.duration_millis = elapsed_time(reportStart);
}

var elapsed_time = function(start){
  return (process.hrtime(start)[1] / 1000000).toFixed(1); // divide by a million to get nano to milli
};

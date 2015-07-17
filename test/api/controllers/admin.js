"use strict";

var should = require("should");
var request = require("supertest");
var server = require("../../../app");

process.env.A127_ENV = "test";

describe("controllers", function() {

  // Before running any tests, give the application time to start up.
  // Since we're running migrations at app start, it's possible express
  // wouldn't yet be listening by the time we start running tests against
  // it.
  before(function(done){
    this.timeout(5000);
    setTimeout(function () {
      request(server).get("/")
        .end(function(err,res){
          done();
        });
    }, 2000);
  });
  describe("admin", function() {
    describe("GET /config", function() {
      it("can retrieve config", function(done) {
        request(server)
          .get("/config")
          .end(function(err, res) {
            if (err) {
              throw err;
            }

            res.should.have.property("status", 200);
            var config = require("../../../config.json");

            // We expect differences under database,
            // so only check against config items we know
            // will be the same.
            res.body.redis.should.eql(config.redis);
            res.body.statsd.should.eql(config.statsd);
            res.body.hasOwnProperty("database").should.eql(true);

            done();
          });
      });

      it("should redact passwords", function(done) {
        request(server)
          .get("/config")
          .end(function(err, res) {
            if (err) {
              throw err;
            }

            res.should.have.property("status", 200);

            var config = require("../../../config.json"),
                realPassword = config.database.test_redaction.password,
                returnedPassword = res.body.database.test_redaction.password;

            returnedPassword.should.not.eql(realPassword);
            returnedPassword.should.eql("[REDACTED]");

            done();
          });
      });

    });

    describe("GET /healthcheck", function() {
      it("Can get health check", function(done) {
        request(server)
          .get("/healthcheck")
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.property("status", 200);
            var report = res.body;
            report.should.have.property("report_as_of");
            report.should.have.property("duration_millis");
            report.should.have.property("tests");
            var tests = report.tests;
            tests.length.should.be.above(0);
            for(var index in tests) {
              var test = tests[index];
              test.should.have.property("duration_millis");
              test.duration_millis.should.be.greaterThan(0);
              test.should.have.property("test_name");
              test.should.have.property("test_result");
              test.test_result.should.eql("passed");
              test.should.have.property("tested_at");
            }
            done();
          });
      });
    });
  });
});

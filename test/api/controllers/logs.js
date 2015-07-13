"use strict";

var uuid = require("node-uuid");
var should = require("should");
var request = require("supertest");
var server = require("../../../app");

process.env.A127_ENV = "test";

describe("controllers", function() {
  describe("logs", function() {
    describe("POST /v1/deployments/{id}/logs", function() {
      it("Should be able to post a log message for a deployment", function(done) {
        var log_message = {
          message: "I am a message",
          application: "deployment-tracker-tests",
          host: "localhost",
          guest: "a.server"
        };
        request(server)
          .post("/v1/deployments/" + uuid.v4() + "/logs/")
          .send([log_message, log_message, log_message])
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.property("status", 201);
            done();
          });
      });
    });
  });
});

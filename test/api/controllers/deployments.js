"use strict";

var uuid = require("node-uuid");
var should = require("should");
var request = require("supertest");
var server = require("../../../app");

process.env.A127_ENV = "test";

var deployment_id = uuid.v4();
var deployment = {
  deployment_id: deployment_id,
  engine: "vagrant_orchestrate",
  engine_version: "v",
  host: "localhost",
  user: "cbaldauf",
  environment: "dev",
  package: "test",
  package_url: "http://foo.com",
  version: "4.5.6",
  arguments: "--myarg1 --myarg2"
};

describe("controllers", function() {
  describe("deployments", function() {
    describe("POST /v1/deployments/{id}", function() {
      it("Should create a new deployment", function(done) {
        request(server)
          .post("/v1/deployments/" + deployment_id)
          .send(deployment)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.property("status", 201);
            done();
          });
      });
    });

    describe("GET /v1/deployments/{id}", function() {
      it("Should be able to retrieve a recently created deployment", function(done) {
        request(server)
          .get("/v1/deployments/" + deployment_id)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            var body = res.body;
            body.should.have.property("deployment_id", deployment_id);
            body.should.have.property("engine", "vagrant_orchestrate");
            body.should.have.property("version", "4.5.6");
            body.should.have.property("package_url", "http://foo.com");
            body.should.have.property("arguments", "--myarg1 --myarg2");
            done();
        });
      });
    });

    describe("POST /v1/deployment/{id}/servers", function() {
      it("Should create a server start record", function(done) {
        request(server)
          .post("/v1/deployments/" + deployment_id + "/servers")
          .send({
            deployment_id: deployment_id,
            hostname: "hostname"
          })
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.property("status", 201);
            done();
          });
      });
    });

    describe("PUT /v1/deployments/{id}", function() {
      it("Should be able to update a deployment", function(done) {
        var status = {
          deployment_id: deployment_id,
          result: "success",
          elapsed_seconds: 234,
          assert_empty_server_result: true
        };
        request(server)
          .put("/v1/deployments/" + deployment_id)
          .send(status)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.property("status", 204);
            done();
          });
      });
    });

    describe("GET /v1/deployments", function() {
      it("Should be able to retrieve a list of deployments", function(done) {
        request(server)
          .get("/v1/deployments")
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            var body = res.body;
            // These are reverse-ordered, so the first one should be the one we just created.
            body[0].should.have.property("deployment_id", deployment_id);
            done();
        });
      });

      it("Should support pagination", function(done) {
        request(server)
          .get("/v1/deployments")
          .end(function(err, res) {
            if (err) {
              throw err;
            }

            res.headers.link.should.containEql("/v1/deployments?offset=25&limit=25");

            // This is page zero and should not return a previous page
            res.headers.link.should.not.containEql("rel=\"prev\"");
            done();
        });
      });
    });
  });
});

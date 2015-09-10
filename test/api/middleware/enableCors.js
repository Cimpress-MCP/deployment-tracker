"use strict";

var should = require("should");
var request = require("supertest");
var server = require("../../../app");

process.env.A127_ENV = "test";

describe("middleware", function() {
  describe("CORS", function() {
    it("Should be enabled for /swagger route", function(done) {

      request(server)
        .get("/swagger")
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          res.header.should.have.property("access-control-allow-origin");
          res.header["access-control-allow-origin"].should.eql("*");
          res.header.should.have.property("access-control-allow-headers");
          res.header["access-control-allow-headers"].should.eql("Origin, X-Requested-With, Content-Type, Accept");

          done();
        });
    });

    it("Should note be enabled for other routes", function(done) {
      request(server)
        .get("/v1/deployments")
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          res.header.should.not.have.property("access-control-allow-origin");
          res.header.should.not.have.property("access-control-allow-headers");

          done();
        });
    });
  });
});

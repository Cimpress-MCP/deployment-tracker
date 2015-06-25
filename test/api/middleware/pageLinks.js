"use strict";

var should = require("should");
var request = require("supertest");
var httpMocks = require("node-mocks-http");
var linkGenerator = require("../../../api/middleware/pageLinks");

process.env.A127_ENV = "test";

describe("middleware", function() {
  describe("pagination link generation", function() {
    it("Should keep offset above 0 despite page sizes", function(done) {
      var req = createRequest("/v1/deployments?limit=1", 3);
      var res = createResponse();

      linkGenerator(req,res);

      res.header.should.have.property("links");
      res.header.links.should.containEql("?offset=28&limit=25");
      res.header.links.should.containEql("?offset=0&limit=25");

      done();
    });

    it("Should generate links with the same limit received", function(done) {
      var req = createRequest("/v1/deployments?limit=1", 0, 1);
      var res = createResponse();

      linkGenerator(req,res);

      res.header.should.have.property("links");
      res.header.links.should.containEql("limit=1");
      res.header.links.should.containEql("offset=1");

      done();
    });

    it("Should not generate a previous link on first page", function(done) {
      var req = createRequest("/v1/deployments");
      var res = createResponse();

      linkGenerator(req,res);

      res.header.should.have.property("links");
      res.header.links.should.containEql("next:");
      res.header.links.should.not.containEql("prev:");

      done();
    });
  });
});


function createResponse(){
  var res = httpMocks.createResponse();
  res._headers.links = "";
  res.links = function(obj) {
    for(var link in obj){
      res._headers.links += link + ": "+  obj[link] + ", ";
    }
  };

  res.header = res._headers;

  return res;
}

function createRequest(url, offset, limit) {
  offset = offset || 0;
  limit = limit || 25;
  var req = httpMocks.createRequest({
    url: url,
    host: "localhost"
  });
  req.protocol = "http";
  req.swagger = {
    params: {
      offset: {
        value: offset
      },
      limit: {
        value: limit
      }
    }
  };

  return req;
}

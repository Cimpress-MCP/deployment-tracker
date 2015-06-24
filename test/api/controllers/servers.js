var uuid = require('node-uuid');
var should = require('should');
var request = require('supertest');
var server = require('../../../app');

process.env.A127_ENV = 'test';

var deployment_id = uuid.v4();

describe('controllers', function() {
  describe('servers', function() {

    // Before we begin, we need to enusre we have a deployment
    // for these servers to register with.
    before(function (done) {
      request(server)
        .post('/v1/deployments/' + deployment_id)
        .send({
          deployment_id: deployment_id,
          engine: "vagrant_orchestrate",
          engine_version: "v",
          host: "localhost",
          user: "cbaldauf",
          environment: "dev",
          package: "test",
          version: "4.5.6"
        })
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          done();
        });
    })

    describe('POST /v1/deployments/{id}/servers', function () {
      var testServer = {
        deployment_id: deployment_id,
        hostname: 'localhostzzz',
        ip_address: '127.0.0.1',
        result: "success",
        elapsed_seconds: 123
      };

      it('Should be able to signal the start of a deployment to a server', function (done) {
        request(server)
          .post('/v1/deployments/' + deployment_id + '/servers')
          .send(testServer)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.property('status', 201);
            done();
          });
      });

    });

    describe('PUT /v1/deployments/{id}/servers', function () {
      var status = {
        deployment_id: deployment_id,
        hostname: "localhostzzz",
        result: "success",
        elapsed_seconds: 234
      };
      it('Should be able to signal the completion of a deployment to a server', function(done) {
        request(server)
          .put('/v1/deployments/' + deployment_id + '/servers')
          .send(status)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.property('status', 204);
            done();
          });
      });
    });
  });
});

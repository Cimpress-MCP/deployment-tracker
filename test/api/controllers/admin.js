var should = require('should');
var request = require('supertest');
var server = require('../../../app');

process.env.A127_ENV = 'test';

describe('controllers', function() {
  describe('admin', function() {
    describe('GET /config', function() {
      it('can retrieve config', function(done) {
        request(server)
          .get('/config')
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.property('status', 200);
            var config = require('../../../config.js');
            res.body.should.eql(config);
            done();
          });
      });
    });

    describe('GET /healthcheck', function() {
      it('Can get health check', function(done) {
        request(server)
          .get('/healthcheck')
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.property('status', 200);
            var report = res.body;
            report.should.have.property('report_as_of');
            report.should.have.property('duration_millis');
            report.should.have.property('tests');
            var tests = report.tests;
            tests.length.should.be.above(0);
            for(var index in tests) {
              var test = tests[index];
              test.should.have.property('duration_millis');
              test.duration_millis.should.be.greaterThan(0);
              test.should.have.property('test_name');
              test.should.have.property('test_result');
              test.test_result.should.eql('passed');
              test.should.have.property('tested_at');
            }
            done();
          });
      });
    });
  });
});

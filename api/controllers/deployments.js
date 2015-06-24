'use strict';

var logger = require('../../lib/logger.js').getLogger({'module': __filename});

var util = require('util');
var statsd_client = app.get('statsd');
var redis_client = app.get('redis');
var db = app.get('db');

module.exports = {
  getDeployments: getDeployments,
  postDeployment: postDeployment,
  getDeployment: getDeployment,
  putDeployment: putDeployment
};

function getDeployments(req, res) {
  db.Deployment.findAll().then(function(deployments) {
    for(var i = 0; i < deployments.length; i++) {
      var deployment = deployments[i];
      deleteNullValues(deployment.dataValues);
    }
    res.json(deployments);
  });
}

function postDeployment(req, res) {
  var deployment = req.swagger.params.body.value;
  statsd_client.increment(deployment.environment + "." + deployment.package + ".started");
  db.Deployment.build(deployment).save().then(function(deployment) {
    logger.debug('Successfully created deployment' + deployment.id);
    logger.trace(deployment);
    res.location('/v1/deployments/' + deployment.id);
    res.status(201).end();
  }).catch(function(err) {
    logger.error(err, "Error writing deployment to database");
    logger.error(deployment);
    res.sendStatus(500);
  });
}

function getDeployment(req, res) {
  db.Deployment.findOne({ where: { deployment_id: req.swagger.params.id.value } }).then(function(deployment) {
    if (deployment === null) {
      throw swagger.errors.notFound('id');
    } else {
      res.json(deleteNullValues(deployment.dataValues));
    }
  }).catch(function(err) {
    res.status(500).json(err);
  });
}

function putDeployment(req, res) {
  db.Deployment.findOne({ where: { deployment_id: req.swagger.params.id.value } }).then(function(deployment) {
    if (deployment === null) {
      throw swagger.errors.notFound('id');
    } else {
      var _ = require("lodash");
      _.assign(deployment, req.body);
      deployment.save();
      statsd_client.increment(deployment.environment + "." + deployment.package + "." + deployment.result);
      statsd_client.timing(deployment.environment + "." + deployment.package + ".elapsed", deployment.elapsed_seconds);
      res.status(204).end();
    }
  }).catch(function(err) {
    res.status(500).json(err);
  });
}

// This is gross. Fire me.
function deleteNullValues(deployment) {
  if (deployment.result == null) {
    delete deployment.result;
  }
  if (deployment.elapsed_seconds == null) {
    delete deployment.elapsed_seconds;
  }
  return deployment;
}

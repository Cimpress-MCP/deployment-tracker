"use strict";

var logger = require("../../lib/logger.js").getLogger({"module": __filename});

var util = require("util");
var statsdClient = app.get("statsd");
var redisClient = app.get("redis");
var db = app.get("db");

module.exports = {
  getDeployments: getDeployments,
  postDeployment: postDeployment,
  getDeployment: getDeployment,
  putDeployment: putDeployment
};

function getDeployments(req, res, next) {
  db.Deployment.findAll({
    include: [{ model: db.Server, as: "servers" }],
    limit: req.swagger.params.limit.value,
    offset: req.swagger.params.offset.value,
    order: [ ["createdAt", "DESC"] ]
  }).then(function(deployments) {
    deployments.forEach(function(deployment) {
      deployment.deleteNullValues();
      deployment.servers.forEach(function(server) {
        server.deleteNullValues();
      });
    });

    next();
    res.json(deployments);
  });
}

function postDeployment(req, res) {
  var deployment = req.swagger.params.body.value;
  statsdClient.increment("deployments.started");
  var prefix = "deployments.environments." + statsdClient.escape(deployment.environment) + ".packages." + statsdClient.escape(deployment.package) + ".";
  statsdClient.increment(prefix + ".started");
  deployment.message = "Deployment Tracker recording deployment start for deployment " + deployment.deployment_id;
  redisClient.rpush("deployment-tracker", JSON.stringify(deployment));
  db.Deployment.build(deployment).save().then(function(deployment) {
    logger.debug("Successfully created deployment" + deployment.id);
    logger.trace(deployment);
    res.location("/v1/deployments/" + deployment.id);
    res.status(201).end();
  }).catch(function(err) {
    logger.error(err, "Error writing deployment to database");
    logger.error(deployment);
    res.sendStatus(500);
  });
}

function getDeployment(req, res) {
  db.Deployment.findOne({
    where: { "deployment_id": req.swagger.params.id.value },
    include: [
      { model: db.Server, as: "servers" }
    ]
  }).then(function(deployment) {
    if (deployment === null) {
      throw new ReferenceError("Deployment Id " + req.swagger.params.id.value + " not found!");
    } else {
      deployment.servers.forEach(function(server) {
        server.deleteNullValues();
      });
      res.json(deployment.deleteNullValues());
    }
  }).catch(function(err) {
    res.status(500).json({ "Error": err.message });
  });
}

function putDeployment(req, res) {
  db.Deployment.findOne({
    where: { "deployment_id": req.swagger.params.id.value }
  }).then(function(deployment) {
    if (deployment === null) {
      throw new ReferenceError("Deployment Id " + req.swagger.params.id.value + " not found!");
    } else {
      var _ = require("lodash");
      _.assign(deployment, req.body);
      deployment.save();

      if ((deployment.result !== null) && deployment.assert_empty_server_result) {
        assertEmptyServerResult(deployment.deployment_id, deployment.result);
      }

      deployment.message = "Deployment Tracker recording deployment end for deployment " + deployment.deployment_id;
      redisClient.rpush("deployment-tracker", JSON.stringify(deployment));

      statsdClient.increment("deployments." + deployment.result);
      statsdClient.timing("deployments.elapsed", deployment.elapsed_seconds);
      var prefix = "deployments.environments." + statsdClient.escape(deployment.environment) + ".packages." + statsdClient.escape(deployment.package) + ".";
      statsdClient.increment(prefix + deployment.result);
      statsdClient.timing(prefix + ".elapsed", deployment.elapsed_seconds);
      res.status(204).end();
    }
  }).catch(function(err) {
    res.status(500).json({ "Error": err.message });
  });
}

/**
 * Assert a given result to any server that is both associated with the given
 * deployment_id and currently has an empty (null) result.
 **/
function assertEmptyServerResult(deploymentId, result) {
  db.Server.update(
    { result: result },
    { where:
      db.Sequelize.and (
        { deployment_id: deploymentId },
        { result: null }
      )
    }
  ).then(function(count) {
    if (count > 0) {
      logger.info("Updated " + count + " empty server results for deployment " + deploymentId);
    }
  }).catch(function(err) {
    logger.error(err, "Error updaring empty server results for deployment " + deploymentId);
    throw err;
  });
}

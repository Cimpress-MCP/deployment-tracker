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
    deployments.map(function(deployment) {
      deployment.deleteNullValues();
      deployment.servers.map(function(server) {
        server.deleteNullValues();
      });
    });

    next();
    res.json(deployments);
  });
}

function postDeployment(req, res) {
  var deployment = req.swagger.params.body.value;
  statsdClient.increment(deployment.environment + "." + deployment.package + ".started");
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
      deployment.servers.map(function(server) {
        server.deleteNullValues();
      });
      res.json(deployment.deleteNullValues());
    }
  }).catch(function(err) {
    res.status(500).json({ "Error": err.message });
  });
}

function putDeployment(req, res) {
  db.Deployment.findOne({ where: { "deployment_id": req.swagger.params.id.value } }).then(function(deployment) {
    if (deployment === null) {
      throw new ReferenceError("Deployment Id " + req.swagger.params.id.value + " not found!");
    } else {
      var _ = require("lodash");
      _.assign(deployment, req.body);
      deployment.save();
      deployment.message = "Deployment Tracker recording deployment end for deployment " + deployment.deployment_id;
      redisClient.rpush("deployment-tracker", JSON.stringify(deployment));
      statsdClient.increment(deployment.environment + "." + deployment.package + "." + deployment.result);
      statsdClient.timing(deployment.environment + "." + deployment.package + ".elapsed", deployment.elapsed_seconds);
      res.status(204).end();
    }
  }).catch(function(err) {
    res.status(500).json({ "Error": err.message });
  });
}

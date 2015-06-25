'use strict';

var logger = require('../../lib/logger.js').getLogger({'module': __filename});

var util = require('util');
var statsd_client = app.get('statsd');
var redis_client = app.get('redis');
var db = app.get('db');

module.exports = {
  postServer: postServer,
  putServer: putServer,
  getAllServers: getAllServers,
  getServerByHostname: getServerByHostname
};

function postServer(req, res) {
    var server = req.swagger.params.body.value;
    db.Server.build(server).save()
      .then(function(server) {
        statsd_client.increment(server.hostname + ".started");
        res.location('/deployments/' + server.deployment_id + '/servers/' + server.hostname);
        res.status(201).end();
      })
      .catch(function (err) {
        logger.error(err, "Error recording server in the database.");
        logger.error(server);
        res.sendStatus(500);
      });
}

function putServer(req, res) {
  var server = req.swagger.params.body.value;

  db.Server.update(server, {
    where: {
      hostname: server.hostname,
      deployment_id: server.deployment_id
    }
  }).then(function (server) {
    statsd_client.increment(server.hostname + "." + server.result);
    statsd_client.timing(server.hostname + ".elapsed", server.elapsed_seconds);
    res.status(204).end();
  }).catch(function (err) {
    logger.error(err, "Error updating server status in the database.");
    logger.error(server);
    res.sendStatus(500);
  });
}

function getAllServers (req, res) {
  // Sequelize #findAll has no way to SELECT Distinct (without also counting or
  // aggregating in some other way). https://github.com/sequelize/sequelize/issues/2996
  db.sequelize.query('SELECT DISTINCT(`hostname`) FROM Servers', {})
    .then(function (servers) {

      if (servers !== null) {
        servers = servers[0].map(function (e) {
          return e.hostname;
        });
      }

      res.json(servers);
    })
    .catch(function (err) {
      logger.info(err);
      res.status(500).json({ "Error": err.message });
    });
}

function getServerByHostname (req, res) {
  var hostname = req.swagger.params.hostname.value;

  db.Server.findAll({
    where: { hostname: hostname },
    order: "`createdAt` DESC"
  })
    .then(function (servers) {
        if (servers.length === 0) {
          throw new ReferenceError("Could not find any deployments for hostname " + hostname);
        }

        res.json(servers);
    })
    .catch(function(err){
      logger.info(err);
      res.status(500).json({ "Error": err.message });
    });
}

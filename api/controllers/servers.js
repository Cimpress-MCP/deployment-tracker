"use strict";

var logger = Logger.getLogger({"module": __filename});

var util = require("util");
var statsdClient = app.get("statsd");
var redisClient = app.get("redis");
var db = app.get("db");

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
        statsdClient.increment("servers.hostname." + statsdClient.escape(server.hostname) + ".started");
        res.location("/deployments/" + server.deployment_id + "/servers/" + server.hostname);
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
  }).then(function (count) {
    var hostname = statsdClient.escape(server.hostname);
    statsdClient.increment("servers.hostname." + hostname + "." + server.result);
    statsdClient.timing("servers.hostname." + hostname + ".elapsed", server.elapsed_seconds);

    res.status(204).end();
  }).catch(function (err) {
    logger.error(err, "Error updating server status in the database.");
    logger.error(server);
    res.sendStatus(500);
  });
}

function getAllServers (req, res, next) {
  // Sequelize #findAll has no way to SELECT Distinct (without also counting or
  // aggregating in some other way). https://github.com/sequelize/sequelize/issues/2996
  /* jshint multistr: true */
  db.sequelize.query("SELECT DISTINCT(`hostname`) \
                      FROM Servers \
                      ORDER BY `hostname` DESC \
                      LIMIT :limit OFFSET :offset", {
                        replacements: {
                          limit: req.swagger.params.limit.value,
                          offset: req.swagger.params.offset.value
                        }
                      })
    .then(function (servers) {

      if (servers !== null) {
        servers = servers[0].map(function (e) {
          return e.hostname;
        });
      }

      next();
      res.json(servers);

    })
    .catch(function (err) {
      logger.info(err);
      res.status(500).json({ "Error": err.message });
    });
    /* jshint multistr: false */
}

function getServerByHostname (req, res, next) {
  var hostname = req.swagger.params.hostname.value;

  db.Server.findAll({
    where: { hostname: hostname },
    limit: req.swagger.params.limit.value,
    offset: req.swagger.params.offset.value,
    order: "`createdAt` DESC"
  })
    .then(function (servers) {
        if (servers.length === 0) {
          throw new ReferenceError("Could not find any deployments for hostname " + hostname);
        }
        servers.forEach(function(server) {
          server.deleteNullValues();
        });

        next();
        res.json(servers);
    })
    .catch(function(err){
      logger.info(err);
      res.status(500).json({ "Error": err.message });
    });
}

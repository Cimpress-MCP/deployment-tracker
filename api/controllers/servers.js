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
    db.Server.build(server).save().then(function(server) {
      statsd_client.increment(server.hostname + ".started");
      res.location('/deployments/' + server.deployment_id + '/servers/' + server.hostname);
      res.status(201).end();
    })

}

function putServer(req, res) {
  var server = req.swagger.params.body.value;

  db.Server.update(server, {
    where: {
      hostname: server.hostname,
      deployment_id: server.deployment_id
    }
  }).then(function(server) {
    statsd_client.increment(server.hostname + "." + server.result);
    statsd_client.timing(server.hostname + ".elapsed", server.elapsed_seconds);
    res.status(204).end();
  });
}

function getAllServers (req, res) {
  // Sequelize #findAll has no way to SELECT Distinct (without also counting or
  // aggregating in some other way). https://github.com/sequelize/sequelize/issues/2996
  db.sequelize.query('SELECT DISTINCT(`hostname`) FROM Servers', {})
    .then(function (servers) {
        servers = servers[0].map(function (e) {
          return {
            hostname: e.hostname,
            links: [
              { serverInfo: "/v1/servers/" + e.hostname }
            ]
          };
        })
        res.json(servers);
    })
    .catch(function(err){
      res.json({"Status": "error", "Error": err});
    });
}

function getServerByHostname (req, res) {
  db.Server.findAll({
    where: { hostname: req.swagger.params.hostname.value },
    order: "`createdAt` DESC"
  })
    .then(function (servers) {
        res.json(servers);
    })
    .catch(function(err){
      res.json({"Status": "error", "Error": err});
    });
}

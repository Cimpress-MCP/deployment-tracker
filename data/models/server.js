"use strict";

module.exports = function (sequelize, DataTypes) {
  var Server = sequelize.define("Server", {

    hostname: {
      type: DataTypes.STRING,
      primaryKey: true
    },

    deployment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: "Deployments",
      referencesKey: "deployment_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    },

    ip_address: DataTypes.STRING,
    result: DataTypes.STRING,
    elapsed_seconds: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models){
        Server.belongsTo(models.Deployment, { foreignKey: 'deployment_id' });
      }
    }
  });

  return Server;
}

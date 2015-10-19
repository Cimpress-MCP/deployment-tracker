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
      model: "Deployments",
      key: "deployment_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    },

    ip_address: DataTypes.STRING,
    result: DataTypes.STRING,
    elapsed_seconds: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models){
        Server.belongsTo(models.Deployment, { foreignKey: "deployment_id" });
      }
    },
    instanceMethods: {
      deleteNullValues: function() {
        var dataValues = this.dataValues;
        Object.keys(dataValues).forEach(function(key) {
          if (dataValues[key] === null) {
            delete dataValues[key];
          }
        });
        this.dataValues = dataValues;
        return this;
      }
    }
  });

  return Server;
};

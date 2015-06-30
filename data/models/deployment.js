"use strict";
module.exports = function (sequelize, DataTypes) {
    var Deployment = sequelize.define("Deployment", {
        deployment_id: {
          type: DataTypes.UUID,
          primaryKey: true
        },
        engine: DataTypes.STRING,
        engine_version: DataTypes.STRING,
        host: DataTypes.STRING,
        user: DataTypes.STRING,
        environment: DataTypes.STRING,
        package: DataTypes.STRING,
        version: DataTypes.STRING,
        result: DataTypes.STRING,
        elapsed_seconds: DataTypes.INTEGER
    }, {
      classMethods: {
        associate: function(models) {
          Deployment.hasMany(models.Server, { foreignKey: "deployment_id", as: "servers" });
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

    return Deployment;
};

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
          if (this.dataValues.result === null) {
            delete this.dataValues.result;
          }
          if (this.dataValues.elapsed_seconds === null) {
            delete this.dataValues.elapsed_seconds;
          }
          return this;
        }
      }
    });

    return Deployment;
};

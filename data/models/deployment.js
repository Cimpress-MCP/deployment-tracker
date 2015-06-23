"use strict";
module.exports = function (sequelize, DataTypes) {
    var Deployment = sequelize.define("Deployment", {
        deployment_id: DataTypes.UUID,
        engine: DataTypes.STRING,
        engine_version: DataTypes.STRING,
        host: DataTypes.STRING,
        user: DataTypes.STRING,
        environment: DataTypes.STRING,
        package: DataTypes.STRING,
        version: DataTypes.STRING,
        result: DataTypes.STRING,
        elapsed_seconds: DataTypes.INTEGER
    });
    return Deployment;
};

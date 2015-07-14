"use strict";

module.exports = {
  up: function (queryInterface, DataTypes) {
    queryInterface.createTable("Deployments", {
      deployment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      engine: DataTypes.STRING,
      engine_version: DataTypes.STRING,
      host: DataTypes.STRING,
      user: DataTypes.STRING,
      environment: DataTypes.STRING,
      package: DataTypes.STRING,
      package_url: DataTypes.STRING,
      version: DataTypes.STRING,
      arguments: DataTypes.STRING,
      result: DataTypes.STRING,
      elapsed_seconds: DataTypes.INTEGER,
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });

    queryInterface.createTable("Servers", {
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
      elapsed_seconds: DataTypes.INTEGER,
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: function (queryInterface, Sequelize) {
    queryInterface.dropTable("Servers");
    queryInterface.dropTable("Deployments");
  }
};

'use strict';

module.exports = {
  up: function (queryInterface, DataTypes) {
    queryInterface.createTable("Deployments", {
      deployment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      engine: {
        type: DataTypes.STRING
      },
      engine_version: {
        type: DataTypes.STRING
      },
      host: {
        type: DataTypes.STRING
      },
      user: {
        type: DataTypes.STRING
      },
      environment: {
        type: DataTypes.STRING
      },
      package: {
        type: DataTypes.STRING
      },
      version: {
        type: DataTypes.STRING
      },
      result: {
        type: DataTypes.STRING
      },
      elapsed_seconds: {
        type: DataTypes.INTEGER
      },
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
    queryInterface.dropTable('Deployments');
  }
};

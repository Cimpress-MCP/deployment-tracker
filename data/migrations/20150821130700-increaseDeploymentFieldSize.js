"use strict";

module.exports = {
  up: function (migration, DataTypes) {
    migration.changeColumn('Deployments','package_url', {
        type:DataTypes.STRING(2048)
    });

    migration.changeColumn('Deployments','arguments', {
        type:DataTypes.STRING(2048)
    });
  },
  down: function (migration, Sequelize) {
    migration.changeColumn('Deployments','package_url', DataTypes.STRING)
    migration.changeColumn('Deployments','arguments', DataTypes.STRING)
  }
};

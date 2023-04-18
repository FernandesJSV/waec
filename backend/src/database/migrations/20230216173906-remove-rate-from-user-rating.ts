import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("UserRatings", "rate");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("UserRatings", "rate", {
      type: DataTypes.INTEGER,
      defaultValue: 0
    });
  }
};

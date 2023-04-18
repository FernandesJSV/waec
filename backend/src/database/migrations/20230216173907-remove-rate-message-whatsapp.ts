import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Whatsapps", "ratingMessage");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Whatsapps", "ratingMessage", {
      type: DataTypes.TEXT
    });
  }
};

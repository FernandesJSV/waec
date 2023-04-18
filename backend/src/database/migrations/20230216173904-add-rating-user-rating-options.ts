import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("UserRatings", "ratingIdOption", {
      type: DataTypes.INTEGER,
      references: { model: "RatingsOptions", key: "id" },
      onUpdate: "RESTRICT",
      onDelete: "RESTRICT",
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("UserRatings", "ratingIdOption");
  }
};

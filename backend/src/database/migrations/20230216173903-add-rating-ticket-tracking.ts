import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("TicketTraking", "ratingId", {
      type: DataTypes.INTEGER,
      references: { model: "Ratings", key: "id" },
      onUpdate: "RESTRICT",
      onDelete: "RESTRICT",
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("TicketTraking", "ratingId");
  }
};

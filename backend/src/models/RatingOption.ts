import {
  Table,
  Column,
  Model,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";
import Rating from "./Rating";

@Table({
  tableName: "RatingsOptions"
})
class RatingOptions extends Model<RatingOptions> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Rating)
  @Column
  ratingId: number;

  @Column
  name: string;

  @Column
  value: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default RatingOptions;

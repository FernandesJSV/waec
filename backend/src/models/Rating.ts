import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import RatingOptions from "./RatingOption";

@Table({
  tableName: "Ratings"
})
class Rating extends Model<Rating> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  name: string;

  @Column
  message: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => RatingOptions)
  options: RatingOptions[];
}

export default Rating;

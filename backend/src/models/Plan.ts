import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique
} from "sequelize-typescript";

@Table
class Plan extends Model<Plan> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @Column
  users: number;

  @Column
  connections: number;

  @Column
  queues: number;

  @Column
  amount: string;   

  @Column
  useWhatsapp: boolean;   

  @Column
  useFacebook: boolean;   

  @Column
  useInstagram: boolean;   
  
  @Column
  useCampaigns: boolean;   

  @Column
  useSchedules: boolean;   

  @Column
  useInternalChat: boolean;   
  
  @Column
  useExternalApi: boolean;   

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Plan;

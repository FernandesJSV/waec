import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    Default,
    ForeignKey,
    DataType
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Integrations extends Model<Integrations> {
    @PrimaryKey
    @Column
    id: number;

    @ForeignKey(() => Company)
    @Column
    companyId: number;

    @Column
    name: string;

    @Default(false)
    @Column
    isActive: boolean;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
    dataValues: string | PromiseLike<string>;

    @Column(DataType.TEXT)
    token: string;

    @Column
    foneContact: string;

    @Column
    userLogin: string;

    @Column
    passLogin: string;

    @Column
    initialCurrentMonth: number;

    @Column
    finalCurrentMonth: number;
}

export default Integrations;

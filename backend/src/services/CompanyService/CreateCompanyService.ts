import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import Setting from "../../models/Setting";
import sequelize from "../../database";

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
  companyUserName?: string;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    password,
    email,
    status,
    planId,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    companyUserName
  } = companyData;

  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
  });

  try {
    await companySchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const t = await sequelize.transaction();

  try {
    const company = await Company.create({
      name,
      phone,
      email,
      status,
      planId,
      dueDate,
      recurrence,
      document,
      paymentMethod
    },
      { transaction: t }
    );

    await User.create({
      name: companyUserName ? companyUserName : name,
      email: company.email,
      password: password ? password : "mudar123",
      profile: "admin",
      companyId: company.id
    },
      { transaction: t }
    );

    // Fechamento automatico de ticket
    await Setting.create({
      companyId: company.id,
      key: "hoursCloseTicketsAuto",
      value: "9999999999"
    },
      { transaction: t }
    )

    // Aceitar msg de grupos
    await Setting.create({
      companyId: company.id,
      key: "CheckMsgIsGroup",
      value: "enabled"
    },
      { transaction: t }
    )

    // Aviso sobre ligação
    await Setting.create({
      companyId: company.id,
      key: "acceptCallWhatsapp",
      value: "disabled"
    },
      { transaction: t }
    )

    // Agendamento de expediente
    await Setting.create({
      companyId: company.id,
      key: "scheduleType",
      value: "disabled"
    },
      { transaction: t }
    )

    // Avaliações
    await Setting.create({
      companyId: company.id,
      key: "userRating",
      value: "disabled"
    },
      { transaction: t }
    )

    // Tipo do Chatbot
    await Setting.create({
      companyId: company.id,
      key: "chatBotType",
      value: "text"
    },
      { transaction: t }
    )

    // Escolher atendente aleatoriamente
    await Setting.create({
      companyId: company.id,
      key: "userRandom",
      value: "disabled"
    },
      { transaction: t }
    )

    // Enviar mensagem de transferencia
    await Setting.create({
      companyId: company.id,
      key: "sendMsgTransfTicket",
      value: "disabled"
    },
      { transaction: t }
    )

    // Enviar mensagem ao aceitar ticket
    await Setting.create({
      companyId: company.id,
      key: "sendGreetingAccepted",
      value: "disabled"
    },
      { transaction: t }
    )

    await t.commit();

    return company;
  } catch (error) {
    await t.rollback();
    throw new AppError("Não foi possível criar a empresa!");
  }
};

export default CreateCompanyService;
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { isEmpty, isNil } from "lodash";
import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import SimpleListService from "../services/UserServices/SimpleListService";
import CreateCompanyService from "../services/CompanyService/CreateCompanyService";
import { SendMail } from "../helpers/SendMail";
import { useDate } from "../utils/useDate";
import GetWhatsappWbot from "../helpers/GetWhatsappWbot";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import { getWbot } from "../libs/wbot";
import FindCompaniesWhatsappService from "../services/CompanyService/FindCompaniesWhatsappService";
import User from "../models/User";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type ListQueryParams = {
  companyId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId, profile } = req.user;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    companyId,
    profile
  });

  return res.json({ users, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    email,
    password,
    name,
    phone,
    profile,
    companyId: bodyCompanyId,
    queueIds,
    companyName,
    planId,
    startWork,
    endWork
  } = req.body;
  let userCompanyId: number | null = null;

  const { dateToClient } = useDate();

  if (req.user !== undefined) {
    const { companyId: cId } = req.user;
    userCompanyId = cId;
  }

  if (
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const companyUser = bodyCompanyId || userCompanyId;

  if (!companyUser) {

    const dataNowMoreTwoDays = new Date();
    dataNowMoreTwoDays.setDate(dataNowMoreTwoDays.getDate() + 3);

    const date = dataNowMoreTwoDays.toISOString().split("T")[0];

    const companyData = {
      name: companyName,
      email: email,
      phone: phone,
      planId: planId,
      status: true,
      dueDate: date,
      recurrence: "",
      document: "",
      paymentMethod: "",
      password: password,
      companyUserName: name,
      startWork: startWork,
      endWork: endWork
    };

    const user = await CreateCompanyService(companyData);

    try {
      const _email = {
        to: email,
        subject: `Login e senha da Empresa ${companyName}`,
        text: `Olá ${name}, este é um email sobre o cadastro da ${companyName}!<br><br>
        Segue os dados da sua empresa:<br><br>Nome: ${companyName}<br>Email: ${email}<br>Senha: ${password}<br>Data Vencimento Trial: ${dateToClient(date)}`
      }

      await SendMail(_email)
    } catch (error) {
      console.log('Não consegui enviar o email')
    }

    try {
      const company = await ShowCompanyService(1);
      const whatsappCompany = await FindCompaniesWhatsappService(company.id)

      if (whatsappCompany.whatsapps[0].status === "CONNECTED" && (phone !== undefined || !isNil(phone) || !isEmpty(phone))) {
        const whatsappId = whatsappCompany.whatsapps[0].id
        const wbot = getWbot(whatsappId);

        const body = `Olá ${name}, este é uma mensagem sobre o cadastro da ${companyName}!\n\nSegue os dados da sua empresa:\n\nNome: ${companyName}\nEmail: ${email}\nSenha: ${password}\nData Vencimento Trial: ${dateToClient(date)}`

        await wbot.sendMessage(`55${phone}@s.whatsapp.net`, { text: body });
      }
    } catch (error) {
      console.log('Não consegui enviar a mensagem')
    }

    return res.status(200).json(user);
  }

  if (companyUser) {
    const user = await CreateUserService({
      email,
      password,
      name,
      profile,
      companyId: companyUser,
      queueIds,
      startWork,
      endWork
    });

    const io = getIO();
    io.emit(`company-${userCompanyId}-user`, {
      action: "create",
      user
    });

    return res.status(200).json(user);
  }
};

// export const store = async (req: Request, res: Response): Promise<Response> => {
//   const {
//     email,
//     password,
//     name,
//     profile,
//     companyId: bodyCompanyId,
//     queueIds
//   } = req.body;
//   let userCompanyId: number | null = null;

//   if (req.user !== undefined) {
//     const { companyId: cId } = req.user;
//     userCompanyId = cId;
//   }

//   if (
//     req.url === "/signup" &&
//     (await CheckSettingsHelper("userCreation")) === "disabled"
//   ) {
//     throw new AppError("ERR_USER_CREATION_DISABLED", 403);
//   } else if (req.url !== "/signup" && req.user.profile !== "admin") {
//     throw new AppError("ERR_NO_PERMISSION", 403);
//   }

//   const user = await CreateUserService({
//     email,
//     password,
//     name,
//     profile,
//     companyId: bodyCompanyId || userCompanyId,
//     queueIds
//   });

//   const io = getIO();
//   io.emit(`company-${userCompanyId}-user`, {
//     action: "create",
//     user
//   });

//   return res.status(200).json(user);
// };

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;

  const user = await ShowUserService(userId);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { id: requestUserId, companyId } = req.user;
  const { userId } = req.params;
  const userData = req.body;

  const user = await UpdateUserService({
    userData,
    userId,
    companyId,
    requestUserId: +requestUserId
  });

  const io = getIO();
  io.emit(`company-${companyId}-user`, {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { companyId, id, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await User.findOne({
    where: { id: userId }
  });

  if (companyId !== user.companyId) {
    return res.status(400).json({ error: "Você não possui permissão para acessar este recurso!" });
  } else {
    await DeleteUserService(userId, companyId);

    const io = getIO();
    io.emit(`company-${companyId}-user`, {
      action: "delete",
      userId
    });

    return res.status(200).json({ message: "User deleted" });
  }

};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.query;
  const { companyId: userCompanyId } = req.user;

  const users = await SimpleListService({
    companyId: companyId ? +companyId : userCompanyId
  });

  return res.status(200).json(users);
};

import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CheckSettingsHelper from "../helpers/CheckSettings";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Queue from "../models/Queue";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

import sendFaceMedia from "../services/FacebookServices/sendFacebookMessageMedia";
import sendFaceMessage from "../services/FacebookServices/sendFacebookMessage";
import ListSettingsServiceOne from "../services/SettingServices/ListSettingsServiceOne";
import ShowPlanCompanyService from "../services/CompanyService/ShowPlanCompanyService";
import ListMessagesServiceAll from "../services/MessageServices/ListMessagesServiceAll";

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
  number?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;
  const { companyId, profile } = req.user;
  const queues: number[] = [];

  if (profile !== "admin") {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Queue, as: "queues" }]
    });
    user.queues.forEach(queue => {
      queues.push(queue.id);
    });
  }

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId,
    companyId,
    queues
  });

  if (ticket.channel === "whatsapp") {
    SetTicketMessagesAsRead(ticket);
  }

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;

  const ticket = await ShowTicketService(ticketId, companyId);

  if (ticket.channel === "whatsapp") {
    SetTicketMessagesAsRead(ticket);
  }

  try {
    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          if (ticket.channel === "whatsapp") {
            await SendWhatsAppMedia({ media, ticket });
          }

          if (ticket.channel === "facebook" || ticket.channel === "instagram") {
            try {
              await sendFaceMedia({
                media,
                ticket
              });
            } catch (error) {
              console.log(error);
            }
          }
        })
      );
    } else {
      if (ticket.channel === "whatsapp") {
        await SendWhatsAppMessage({ body, ticket, quotedMsg });
      }

      if (ticket.channel === "facebook" || ticket.channel === "instagram") {
        await sendFaceMessage({ body, ticket, quotedMsg });
      }
    }
    return res.send();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
    action: "update",
    message
  });

  return res.send();
};

export const allMe = async (req: Request, res: Response): Promise<Response> => {

  const dateStart: any = req.query.dateStart;
  const dateEnd: any = req.query.dateEnd;
  const fromMe: any = req.query.fromMe;

  const { companyId } = req.user;

  const { count } = await ListMessagesServiceAll({
    companyId,
    fromMe,
    dateStart,
    dateEnd
  });

  return res.json({ count });
};

export const send = async (req: Request, res: Response): Promise<Response> => {
  const messageData: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  try {

    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");

    const whatsapp = await Whatsapp.findOne({ where: { token } });
    const companyId = whatsapp.companyId;
    const company = await ShowPlanCompanyService(companyId);
    const sendMessageWithExternalApi = company.plan.useExternalApi

    if (sendMessageWithExternalApi) {

      if (!whatsapp) {
        throw new Error("Não foi possível realizar a operação");
      }

      if (messageData.number === undefined) {
        throw new Error("O número é obrigatório");
      }

      const number = messageData.number;
      const body = messageData.body;

      if (medias) {
        await Promise.all(
          medias.map(async (media: Express.Multer.File) => {
            req.app.get("queues").messageQueue.add(
              "SendMessage",
              {
                whatsappId: whatsapp.id,
                data: {
                  number,
                  body: media.originalname.replace('/','-'),
                  mediaPath: media.path
                }
              },
              { removeOnComplete: true, attempts: 3 }
            );
          })
        );
      } else {
        req.app.get("queues").messageQueue.add(
          "SendMessage",
          {
            whatsappId: whatsapp.id,
            data: {
              number,
              body
            }
          },
          { removeOnComplete: true, attempts: 3 }
        );
      }
      return res.send({ mensagem: "Mensagem enviada!" });
    }
    return res.status(400).json({ error: 'Essa empresa não tem permissão para usar a API Externa. Entre em contato com o Suporte para verificar nossos planos!' });

  } catch (err: any) {

    console.log(err);
    if (Object.keys(err).length === 0) {
      throw new AppError(
        "Não foi possível enviar a mensagem, tente novamente em alguns instantes"
      );
    } else {
      throw new AppError(err.message);
    }
  }
};

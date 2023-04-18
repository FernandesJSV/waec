import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import Message from "../models/Message";
import Whatsapp from "../models/Whatsapp";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import { getWbot } from "../libs/wbot";
import SendWhatsAppMessageLink from "../services/WbotServices/SendWhatsAppMessageLink";
import SendWhatsAppMessageAPI from "../services/WbotServices/SendWhatsAppMessageAPI";
import SendWhatsAppMediaImage from "../services/WbotServices/SendWhatsappMediaImage";
import ApiUsages from "../models/ApiUsages";
import { useDate } from "../utils/useDate";
import moment from "moment";
import path from "path";

type WhatsappData = {
  whatsappId: number;
};

export class OnWhatsAppDto {
  constructor(public readonly jid: string, public readonly exists: boolean) { }
}

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
  number?: string;
};

interface ContactData {
  number: string;
}

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

const createContact = async (
  whatsappId: number | undefined,
  companyId: number | undefined,
  newContact: string
) => {

  await CheckIsValidContact(newContact, companyId);

  const validNumber: any = await CheckContactNumber(newContact, companyId);

  const profilePicUrl = await GetProfilePicUrl(validNumber, companyId);

  const number = validNumber;

  const contactData = {
    name: `${number}`,
    number,
    profilePicUrl,
    isGroup: false,
    companyId
  };

  const contact = await CreateOrUpdateContactService(contactData);

  let whatsapp: Whatsapp | null;

  if (whatsappId === undefined) {
    whatsapp = await GetDefaultWhatsApp(companyId);
  } else {
    whatsapp = await Whatsapp.findByPk(whatsappId);

    if (whatsapp === null) {
      throw new AppError(`whatsapp #${whatsappId} not found`);
    }
  }

  const createTicket = await FindOrCreateTicketService(
    contact,
    whatsapp.id,
    0,
    companyId
  );

  const ticket = await ShowTicketService(createTicket.id, companyId);

  SetTicketMessagesAsRead(ticket);

  return ticket;
};

function formatBRNumber(jid: string) {
  const regexp = new RegExp(/^(\d{2})(\d{2})\d{1}(\d{8})$/);
  if (regexp.test(jid)) {
    const match = regexp.exec(jid);
    if (match && match[1] === '55' && Number.isInteger(Number.parseInt(match[2]))) {
      const ddd = Number.parseInt(match[2]);
      if (ddd < 31) {
        return match[0];
      } else if (ddd >= 31) {
        return match[1] + match[2] + match[3];
      }
    }
  } else {
    return jid;
  }
}

function createJid(number: string) {
  if (number.includes('@g.us') || number.includes('@s.whatsapp.net')) {
    return formatBRNumber(number) as string;
  }
  return number.includes('-')
    ? `${number}@g.us`
    : `${formatBRNumber(number)}@s.whatsapp.net`;
}

// export const send = async (req: Request, res: Response): Promise<Response> => {
//     const messageData: MessageData = req.body;
//     const medias = req.files as Express.Multer.File[];

//     try {

//         const authHeader = req.headers.authorization;
//         const [, token] = authHeader.split(" ");

//         const whatsapp = await Whatsapp.findOne({ where: { token } });
//         const companyId = whatsapp.companyId;
//         const company = await ShowPlanCompanyService(companyId);
//         const sendMessageWithExternalApi = company.plan.useExternalApi

//         if (sendMessageWithExternalApi) {

//             if (!whatsapp) {
//                 throw new Error("Não foi possível realizar a operação");
//             }

//             if (messageData.number === undefined) {
//                 throw new Error("O número é obrigatório");
//             }

//             const number = messageData.number;
//             const body = messageData.body;

//             if (medias) {
//                 await Promise.all(
//                     medias.map(async (media: Express.Multer.File) => {
//                         req.app.get("queues").messageQueue.add(
//                             "SendMessage",
//                             {
//                                 whatsappId: whatsapp.id,
//                                 data: {
//                                     number,
//                                     body: media.originalname,
//                                     mediaPath: media.path
//                                 }
//                             },
//                             { removeOnComplete: true, attempts: 3 }
//                         );
//                     })
//                 );
//             } else {
//                 req.app.get("queues").messageQueue.add(
//                     "SendMessage",
//                     {
//                         whatsappId: whatsapp.id,
//                         data: {
//                             number,
//                             body
//                         }
//                     },
//                     { removeOnComplete: true, attempts: 3 }
//                 );
//             }
//             return res.send({ mensagem: "Mensagem enviada!" });
//         }
//         return res.status(400).json({ error: 'Essa empresa não tem permissão para usar a API Externa. Entre em contato com o Suporte para verificar nossos planos!' });

//     } catch (err: any) {

//         console.log(err);
//         if (Object.keys(err).length === 0) {
//             throw new AppError(
//                 "Não foi possível enviar a mensagem, tente novamente em alguns instantes"
//             );
//         } else {
//             throw new AppError(err.message);
//         }
//     }
// };

export const indexLink = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const newContact: ContactData = req.body;
  const { whatsappId }: WhatsappData = req.body;
  const { msdelay }: any = req.body;
  const url = req.body.url;
  const caption = req.body.caption;

  const authHeader = req.headers.authorization;
  const [, token] = authHeader.split(" ");
  const whatsapp = await Whatsapp.findOne({ where: { token } });
  const companyId = whatsapp.companyId;

  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const contactAndTicket = await createContact(whatsappId, companyId, newContact.number);

  await SendWhatsAppMessageLink({ ticket: contactAndTicket, url, caption, msdelay });

  setTimeout(async () => {
    await UpdateTicketService({
      ticketId: contactAndTicket.id,
      ticketData: { status: "closed", sendFarewellMessage: false, amountUsedBotQueues: 0 },
      companyId,
      ratingId: undefined
    });
  }, 200);

  setTimeout(async () => {
    const { dateToClient } = useDate();

    const hoje: string = dateToClient(new Date())
    const timestamp = moment().format();

    const exist = await ApiUsages.findOne({
      where: {
        dateUsed: hoje,
        companyId: companyId
      }
    });

    if (exist) {
      await exist.update({
        usedPDF: exist.dataValues["usedPDF"] + 1,
        UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
        updatedAt: timestamp
      });
    } else {
      const usage = await ApiUsages.create({
        companyId: companyId,
        dateUsed: hoje,
      });

      await usage.update({
        usedPDF: usage.dataValues["usedPDF"] + 1,
        UsedOnDay: usage.dataValues["UsedOnDay"] + 1,
        updatedAt: timestamp
      });
    }

  }, 100);

  return res.send({ status: "SUCCESS" });
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  const { whatsappId }: WhatsappData = req.body;
  const { msdelay }: any = req.body;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const authHeader = req.headers.authorization;
  const [, token] = authHeader.split(" ");
  const whatsapp = await Whatsapp.findOne({ where: { token } });
  const companyId = whatsapp.companyId;

  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const contactAndTicket = await createContact(whatsappId, companyId, newContact.number);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ body, media, ticket: contactAndTicket });
      })
    );
  } else {
    await SendWhatsAppMessageAPI({ body, ticket: contactAndTicket, quotedMsg, msdelay });
  }

  setTimeout(async () => {
    await UpdateTicketService({
      ticketId: contactAndTicket.id,
      ticketData: { status: "closed", sendFarewellMessage: false, amountUsedBotQueues: 0 },
      companyId,
      ratingId: undefined
    });
  }, 100);

  setTimeout(async () => {
    const { dateToClient } = useDate();

    const hoje: string = dateToClient(new Date())
    const timestamp = moment().format();

    const exist = await ApiUsages.findOne({
      where: {
        dateUsed: hoje,
        companyId: companyId
      }
    });

    if (exist) {
      if (medias) {
        await Promise.all(
          medias.map(async (media: Express.Multer.File) => {
            console.log('media', media)
            const type = path.extname(media.originalname)
            console.log('type', type)

            if (media.mimetype.includes("pdf")) {
              await exist.update({
                usedPDF: exist.dataValues["usedPDF"] + 1,
                UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
              });
            } else if (media.mimetype.includes("image")) {
              await exist.update({
                usedImage: exist.dataValues["usedImage"] + 1,
                UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
              });
            } else if (media.mimetype.includes("video")) {
              await exist.update({
                usedVideo: exist.dataValues["usedVideo"] + 1,
                UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
              });
            } else {
              await exist.update({
                usedOther: exist.dataValues["usedOther"] + 1,
                UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
              });
            }

          })
        )
      } else {
        await exist.update({
          usedText: exist.dataValues["usedText"] + 1,
          UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
          updatedAt: timestamp
        });
      }
    } else {
      await ApiUsages.create({
        companyId: companyId,
        dateUsed: hoje,
      });

      if (medias) {
        await Promise.all(
          medias.map(async (media: Express.Multer.File) => {
            console.log('media', media)
            const type = path.extname(media.originalname)
            console.log('type', type)

            if (media.mimetype.includes("pdf")) {
              await exist.update({
                usedPDF: exist.dataValues["usedPDF"] + 1,
                UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
              });
            } else if (media.mimetype.includes("image")) {
              await exist.update({
                usedImage: exist.dataValues["usedImage"] + 1,
                UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
              });
            } else if (media.mimetype.includes("video")) {
              await exist.update({
                usedVideo: exist.dataValues["usedVideo"] + 1,
                UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
              });
            } else {
              await exist.update({
                usedOther: exist.dataValues["usedOther"] + 1,
                UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
              });
            }

          })
        )
      } else {
        await exist.update({
          usedText: exist.dataValues["usedText"] + 1,
          UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
          updatedAt: timestamp
        });
      }
    }

  }, 100);

  return res.send({ status: "SUCCESS" });
};

export const indexImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const newContact: ContactData = req.body;
  const { whatsappId }: WhatsappData = req.body;
  const { msdelay }: any = req.body;
  const url = req.body.url;
  const caption = req.body.caption;

  const authHeader = req.headers.authorization;
  const [, token] = authHeader.split(" ");
  const whatsapp = await Whatsapp.findOne({ where: { token } });
  const companyId = whatsapp.companyId;

  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const contactAndTicket = await createContact(whatsappId, companyId, newContact.number);

  if (url) {
    await SendWhatsAppMediaImage({ ticket: contactAndTicket, url, caption, msdelay });
  }

  setTimeout(async () => {
    await UpdateTicketService({
      ticketId: contactAndTicket.id,
      ticketData: { status: "closed", sendFarewellMessage: false, amountUsedBotQueues: 0 },
      companyId,
      ratingId: undefined
    });
  }, 100);

  setTimeout(async () => {
    const { dateToClient } = useDate();

    const hoje: string = dateToClient(new Date())
    const timestamp = moment().format();

    const exist = await ApiUsages.findOne({
      where: {
        dateUsed: hoje,
        companyId: companyId
      }
    });

    if (exist) {
      await exist.update({
        usedImage: exist.dataValues["usedImage"] + 1,
        UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
        updatedAt: timestamp
      });
    } else {
      const usage = await ApiUsages.create({
        companyId: companyId,
        dateUsed: hoje,
      });

      await usage.update({
        usedImage: usage.dataValues["usedImage"] + 1,
        UsedOnDay: usage.dataValues["UsedOnDay"] + 1,
        updatedAt: timestamp
      });
    }

  }, 100);

  return res.send({ status: "SUCCESS" });
};

export const checkNumber = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;

  const authHeader = req.headers.authorization;
  const [, token] = authHeader.split(" ");
  const whatsapp = await Whatsapp.findOne({ where: { token } });
  const companyId = whatsapp.companyId;

  const number = newContact.number.replace("-", "").replace(" ", "");

  const whatsappDefault = await GetDefaultWhatsApp(companyId);
  const wbot = getWbot(whatsappDefault.id);
  const jid = createJid(number);

  try {
    const [result] = (await wbot.onWhatsApp(jid)) as {
      exists: boolean;
      jid: string;
    }[];

    if (result.exists) {

      setTimeout(async () => {
        const { dateToClient } = useDate();

        const hoje: string = dateToClient(new Date())
        const timestamp = moment().format();

        const exist = await ApiUsages.findOne({
          where: {
            dateUsed: hoje,
            companyId: companyId
          }
        });

        if (exist) {
          await exist.update({
            usedCheckNumber: exist.dataValues["usedCheckNumber"] + 1,
            UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
            updatedAt: timestamp
          });
        } else {
          const usage = await ApiUsages.create({
            companyId: companyId,
            dateUsed: hoje,
          });

          await usage.update({
            usedCheckNumber: usage.dataValues["usedCheckNumber"] + 1,
            UsedOnDay: usage.dataValues["UsedOnDay"] + 1,
            updatedAt: timestamp
          });
        }

      }, 100);

      return res.status(200).json({ existsInWhatsapp: true, number: number, numberFormatted: result.jid });
    }

  } catch (error) {
    return res.status(400).json({ existsInWhatsapp: false, number: jid, error: "Not exists on Whatsapp" });
  }

};

// export const indexVideo = async (
//     req: Request,
//     res: Response
// ): Promise<Response> => {
//     const newContact: ContactData = req.body;
//     const { whatsappId }: WhatsappData = req.body;
//     const url = req.body.url;
//     const caption = req.body.caption;

//     newContact.number = newContact.number.replace("-", "").replace(" ", "");

//     const schema = Yup.object().shape({
//         number: Yup.string()
//             .required()
//             .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
//     });

//     try {
//         await schema.validate(newContact);
//     } catch (err: any) {
//         throw new AppError(err.message);
//     }

//     const contactAndTicket = await createContact(whatsappId, newContact.number);

//     await SendWhatsAppMediaVideo({ ticket: contactAndTicket, url, caption });

//     setTimeout(async () => {
//         await UpdateTicketService({
//             ticketId: contactAndTicket.id,
//             ticketData: { status: "closed" }
//         });
//     }, 1000);

//     return res.send({ status: "SUCCESS" });
// };

// export const indexToMany = async (
//     req: Request,
//     res: Response
// ): Promise<Response> => {
//     const to: string = req.body.to;
//     const { whatsappId }: WhatsappData = req.body;
//     const { body, quotedMsg }: MessageData = req.body;

//     const myArray = to.split(";");
//     let newContact: ContactData;

//     for (var i = 0; i < myArray.length; i++) {
//         const number = myArray[i];
//         newContact = { number: number };
//         console.log("newContact", newContact);

//         const schema = Yup.object().shape({
//             number: Yup.string()
//                 .required()
//                 .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
//         });

//         try {
//             await schema.validate(newContact);
//         } catch (err: any) {
//             throw new AppError(err.message);
//         }

//         const contactAndTicket = await createContact(whatsappId, newContact.number);

//         await SendWhatsAppMessageToMany({
//             body,
//             ticket: contactAndTicket,
//             quotedMsg
//         });

//         setTimeout(async () => {
//             await UpdateTicketService({
//                 ticketId: contactAndTicket.id,
//                 ticketData: { status: "closed" }
//             });
//         }, 1000);
//     }

//     return res.send({ status: "SUCCESS" });
// };

// export const indexToManyLinkPdf = async (
//     req: Request,
//     res: Response
// ): Promise<Response> => {
//     const { whatsappId }: WhatsappData = req.body;
//     const data: MediaUrlMessage = req.body.messageData;

//     // console.log('data', data)
//     let url;
//     let caption;

//     url = data.url;
//     caption = data.caption;

//     const myArray = data.to.split(";");
//     let newContact: ContactData;

//     for (var i = 0; i < myArray.length; i++) {
//         const number = myArray[i];
//         newContact = { number: number };

//         const schema = Yup.object().shape({
//             number: Yup.string()
//                 .required()
//                 .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
//         });

//         try {
//             await schema.validate(newContact);
//         } catch (err: any) {
//             throw new AppError(err.message);
//         }

//         const contactAndTicket = await createContact(whatsappId, newContact.number);
//         console.log("contactAndTicket", contactAndTicket.id);
//         const ticket = contactAndTicket;
//         // await SendWhatsAppMessageToManyPdf({ ticket: contactAndTicket, url, caption });
//         await sendUrlMediaMessage(ticket, data);

//         setTimeout(async () => {
//             await UpdateTicketService({
//                 ticketId: contactAndTicket.id,
//                 ticketData: { status: "closed" }
//             });
//         }, 1000);
//     }

//     return res.send({ status: "SUCCESS" });
// };

// export const indexToManyImage = async (
//     req: Request,
//     res: Response
// ): Promise<Response> => {
//     const { whatsappId }: WhatsappData = req.body;
//     const data: MediaUrlMessage = req.body.messageData;

//     let url;
//     let caption;

//     url = data.url;
//     caption = data.caption;

//     const myArray = data.to.split(";");
//     let newContact: ContactData;

//     for (var i = 0; i < myArray.length; i++) {
//         const number = myArray[i];
//         newContact = { number: number };

//         const schema = Yup.object().shape({
//             number: Yup.string()
//                 .required()
//                 .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
//         });

//         try {
//             await schema.validate(newContact);
//         } catch (err: any) {
//             throw new AppError(err.message);
//         }

//         const contactAndTicket = await createContact(whatsappId, newContact.number);

//         await sendUrlMediaMessageImage(contactAndTicket, data);

//         setTimeout(async () => {
//             await UpdateTicketService({
//                 ticketId: contactAndTicket.id,
//                 ticketData: { status: "closed" }
//             });
//         }, 1000);
//     }

//     return res.send({ status: "SUCCESS" });
// };

export const indexWhatsappsId = async (req: Request, res: Response): Promise<Response> => {
  console.log('req', req)
  console.log('req', req.user)
  return res.status(200).json('oi');

  // const { companyId } = req.user;
  // const whatsapps = await ListWhatsAppsService({ companyId });

  // let wpp = [];

  // if (whatsapps.length > 0) {
  //     whatsapps.forEach(whatsapp => {

  //         let wppString;
  //         wppString = {
  //             id: whatsapp.id,
  //             name: whatsapp.name,
  //             status: whatsapp.status,
  //             isDefault: whatsapp.isDefault,
  //             number: whatsapp.number
  //         }

  //         wpp.push(wppString)

  //     });
  // }

  // return res.status(200).json(wpp);
};




import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import fs from "fs";
import * as Sentry from "@sentry/node";
import { isNil, isNull, head } from "lodash";

import {
  downloadContentFromMessage,
  extractMessageContent,
  getContentType,
  GroupMetadata,
  Contact as ContactBaileys,
  jidNormalizedUser,
  MediaType,
  MessageUpsertType,
  PresenceData,
  proto,
  WAMessage,
  WAMessageStubType,
  WAMessageUpdate,
  WASocket
} from "@adiwajshing/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Settings from "../../models/Setting";

import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { debounce } from "../../helpers/Debounce";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import formatBody from "../../helpers/Mustache";
import { Store } from "../../libs/store";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import moment from "moment";
import Queue from "../../models/Queue";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import { Op } from "sequelize";
import { campaignQueue, parseToMilliseconds, randomValue } from "../../queues";
import User from "../../models/User";
import Setting from "../../models/Setting";
import { sayChatbot } from "./ChatBotListener";
import MarkDeleteWhatsAppMessage from "./MarkDeleteWhatsAppMessage";
import { SendAckBYRemoteJid } from "./SendAck";
import ListUserQueueServices from "../UserQueueServices/ListUserQueueServices";
import ShowChatBotServices from "../ChatBotServices/ShowChatBotServices";
import Rating from "../../models/Rating";
import RatingOption from "../../models/RatingOption";
import ffmpeg from "fluent-ffmpeg";
import { path } from "@ffmpeg-installer/ffmpeg";
import { cacheLayer } from "../../libs/cache";
var axios = require('axios');

ffmpeg.setFfmpegPath(path);

type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMe {
  name: string;
  id: string;
}

const writeFileAsync = promisify(writeFile);

function removeFile(directory) {
  fs.unlink(directory, (error) => {
    if (error) throw error;
  });
}

const getTimestampMessage = (msgTimestamp: any) => {
  return msgTimestamp * 1
}

const multVecardGet = function (param: any) {
  let output = " "

  let name = param.split("\n")[2].replace(";;;", "\n").replace('N:', "").replace(";", "").replace(";", " ").replace(";;", " ").replace("\n", "")
  let inicio = param.split("\n")[4].indexOf('=')
  let fim = param.split("\n")[4].indexOf(':')
  let contact = param.split("\n")[4].substring(inicio + 1, fim).replace(";", "")
  let contactSemWhats = param.split("\n")[4].replace("item1.TEL:", "")
  //console.log(contact);
  if (contact != "item1.TEL") {
    output = output + name + ": 📞" + contact + "" + "\n"
  } else
    output = output + name + ": 📞" + contactSemWhats + "" + "\n"
  return output
}

const contactsArrayMessageGet = (msg: any,) => {
  let contactsArray = msg.message?.contactsArrayMessage?.contacts
  let vcardMulti = contactsArray.map(function (item, indice) {
    return item.vcard;
  });

  let bodymessage = ``
  vcardMulti.forEach(function (vcard, indice) {
    bodymessage += vcard + "\n\n" + ""
  })

  let contacts = bodymessage.split("BEGIN:")

  contacts.shift()
  let finalContacts = ""
  for (let contact of contacts) {
    finalContacts = finalContacts + multVecardGet(contact)
  }

  return finalContacts
}

const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  const msgType = getContentType(msg.message);
  if (msg.message?.viewOnceMessageV2) {
    return "viewOnceMessageV2"
  }
  return msgType
};

const getBodyButton = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg.message.buttonsMessage?.contentText) {
    let bodyMessage = `${msg?.message?.buttonsMessage?.contentText}`;

    for (const buton of msg.message?.buttonsMessage?.buttons) {
      bodyMessage += `\n\n${buton.buttonText?.displayText}`;
    }
    return bodyMessage;
  }

  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `${msg?.message?.viewOnceMessage?.message?.listMessage?.description}`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }

    return bodyMessage;
  }
};
const getBodyList = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg.message.listMessage?.description) {
    let bodyMessage = `${msg.message.listMessage?.description}`;
    for (const buton of msg.message.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }

  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `${msg?.message?.viewOnceMessage?.message?.listMessage?.description}`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }

    return bodyMessage;
  }
};

const msgLocation = (image, latitude, longitude) => {
  if (image) {
    var b64 = Buffer.from(image).toString("base64");
    let data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
    return data;
  }
};

export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
  try {
    let type = getTypeMessage(msg);

    const types = {
      conversation: msg.message?.conversation,
      imageMessage: msg.message?.imageMessage?.caption,
      videoMessage: msg.message?.videoMessage?.caption,
      extendedTextMessage: msg.message.extendedTextMessage?.text,
      buttonsResponseMessage: msg.message.buttonsResponseMessage?.selectedDisplayText,
      listResponseMessage: msg.message.listResponseMessage?.title || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId,
      templateButtonReplyMessage: msg.message?.templateButtonReplyMessage?.selectedId,
      messageContextInfo: msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.title,
      buttonsMessage: getBodyButton(msg) || msg.message.listResponseMessage?.title,
      stickerMessage: "sticker",
      contactMessage: msg.message?.contactMessage?.vcard,
      contactsArrayMessage: (msg.message?.contactsArrayMessage?.contacts) && contactsArrayMessageGet(msg),
      //locationMessage: `Latitude: ${msg.message.locationMessage?.degreesLatitude} - Longitude: ${msg.message.locationMessage?.degreesLongitude}`,
      locationMessage: msgLocation(msg.message?.locationMessage?.jpegThumbnail, msg.message?.locationMessage?.degreesLatitude, msg.message?.locationMessage?.degreesLongitude),
      liveLocationMessage: `Latitude: ${msg.message.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message.liveLocationMessage?.degreesLongitude}`,
      documentMessage: msg.message?.documentMessage?.title,
      audioMessage: "Áudio",
      listMessage: getBodyList(msg) || msg.message.listResponseMessage?.title,
      viewOnceMessage: getBodyButton(msg),
      reactionMessage: msg.message.reactionMessage?.text || "reaction",
      senderKeyDistributionMessage: msg?.message?.senderKeyDistributionMessage?.axolotlSenderKeyDistributionMessage,
      documentWithCaptionMessage: msg.message?.documentWithCaptionMessage?.message?.documentMessage?.caption,
      viewOnceMessageV2: msg.message?.viewOnceMessageV2?.message?.imageMessage?.caption
    };

    const objKey = Object.keys(types).find(key => key === type);

    if (!objKey) {
      logger.warn(`#### Nao achou o type 152: ${type}
${JSON.stringify(msg)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
      Sentry.captureException(
        new Error("Novo Tipo de Mensagem em getTypeMessage")
      );
    }
    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
    Sentry.captureException(error);
    console.log(error);
  }
};

export const getQuotedMessage = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];

  if (!body?.contextInfo?.quotedMessage) return;
  const quoted = extractMessageContent(
    body?.contextInfo?.quotedMessage[
    Object.keys(body?.contextInfo?.quotedMessage).values().next().value
    ]
  );

  return quoted;
};

export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];
  let reaction = msg?.message?.reactionMessage
    ? msg?.message?.reactionMessage?.key?.id
    : "";

  return reaction ? reaction : body?.contextInfo?.stanzaId;
};

const getMeSocket = (wbot: Session): IMe => {
  return {
    id: jidNormalizedUser((wbot as WASocket).user.id),
    name: (wbot as WASocket).user.name
  };
};

const getSenderMessage = (
  msg: proto.IWebMessageInfo,
  wbot: Session
): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;

  const senderId =
    msg.participant || msg.key.participant || msg.key.remoteJid || undefined;

  return senderId && jidNormalizedUser(senderId);
};

const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  const isGroup = msg.key.remoteJid.includes("g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
  return isGroup
    ? {
      id: getSenderMessage(msg, wbot),
      name: msg.pushName
    }
    : {
      id: msg.key.remoteJid,
      name: msg.key.fromMe ? rawNumber : msg.pushName
    };
};

const downloadMedia = async (msg: proto.IWebMessageInfo) => {
  const mineType =
    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage;

  const messageType = msg.message?.documentMessage
    ? "document"
    : mineType.mimetype.split("/")[0].replace("application", "document")
      ? (mineType.mimetype
        .split("/")[0]
        .replace("application", "document") as MediaType)
      : (mineType.mimetype.split("/")[0] as MediaType);

  let stream;
  let contDownload = 0;

  while (contDownload < 10 && !stream) {
    try {
      stream = await downloadContentFromMessage(
        msg.message.audioMessage ||
        msg.message.videoMessage ||
        msg.message.documentMessage ||
        msg.message.imageMessage ||
        msg.message.stickerMessage ||
        msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage ||
        msg.message?.buttonsMessage?.imageMessage ||
        msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
        msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
        msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
        msg.message?.interactiveMessage?.header?.imageMessage ||
        msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
        msg.message?.viewOnceMessageV2?.message?.imageMessage,
        messageType
      );
    } catch (error) {
      contDownload++;
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * contDownload * 2)
      );
      logger.warn(
        `>>>> erro ${contDownload} de baixar o arquivo ${msg?.key.id}`
      );
    }
  }

  let buffer = Buffer.from([]);
  // eslint-disable-next-line no-restricted-syntax
  try {
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
  } catch (error) {
    return { data: "error", mimetype: "", filename: "" };
  }

  if (!buffer) {
    Sentry.setExtra("ERR_WAPP_DOWNLOAD_MEDIA", { msg });
    Sentry.captureException(new Error("ERR_WAPP_DOWNLOAD_MEDIA"));
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }
  let filename = msg.message?.documentMessage?.fileName || "";

  if (!filename) {
    const ext = mineType.mimetype.split("/")[1].split(";")[0];
    filename = `${new Date().getTime()}.${ext}`;
  }
  const media = {
    data: buffer,
    mimetype: mineType.mimetype,
    filename
  };
  return media;
};

const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> => {
  let profilePicUrl: string;
  try {
    profilePicUrl = await wbot.profilePictureUrl(msgContact.id);
  } catch (e) {
    Sentry.captureException(e);
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  const contactData = {
    name: msgContact?.name || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: proto.IWebMessageInfo
): Promise<Message | null> => {
  if (!msg) return null;
  const quoted = getQuotedMessageId(msg);

  if (!quoted) return null;

  const quotedMsg = await Message.findOne({
    where: { id: quoted }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

const verifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const media = await downloadMedia(msg);

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  } else {
    let originalFilename = media.filename ? `-${media.filename}` : ''
    media.filename = `${new Date().getTime()}${originalFilename}`;
  }

  try {

    const folder = `public/company${ticket.companyId}`;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
      fs.chmodSync(folder, 0o777)
    }

    await writeFileAsync(
      join(__dirname, "..", "..", "..", folder, media.filename),
      media.data,
      "base64"
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }

  const body = getBodyMessage(msg);
  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body: body ? body : media.filename,
    fromMe: msg.key.fromMe,
    read: msg.key.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg)
  };

  await ticket.update({
    lastMessage: body || media.filename
  });

  const newMessage = await CreateMessageService({
    messageData,
    companyId: ticket.companyId
  });

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ],
    });

    io.to("closed").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }

  return newMessage;
};

export const verifyMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const body = getBodyMessage(msg);

  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg)
  };
  await ticket.update({
    lastMessage: body
  });

  await CreateMessageService({ messageData, companyId: ticket.companyId });

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ]
    });

    io.to("closed").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }
};

const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) {
      return;
    }

    const ifType =
      msgType === "conversation" ||
      msgType === "extendedTextMessage" ||
      msgType === "audioMessage" ||
      msgType === "videoMessage" ||
      msgType === "imageMessage" ||
      msgType === "documentMessage" ||
      msgType === "stickerMessage" ||
      msgType === "buttonsResponseMessage" ||
      msgType === "buttonsMessage" ||
      msgType === "messageContextInfo" ||
      msgType === "locationMessage" ||
      msgType === "liveLocationMessage" ||
      msgType === "contactMessage" ||
      msgType === "voiceMessage" ||
      msgType === "mediaMessage" ||
      msgType === "contactsArrayMessage" ||
      msgType === "reactionMessage" ||
      msgType === "ephemeralMessage" ||
      msgType === "protocolMessage" ||
      msgType === "listResponseMessage" ||
      msgType === "listMessage" ||
      msgType === "viewOnceMessage" ||
      msgType === "documentWithCaptionMessage" ||
      msgType === "viewOnceMessageV2";

    if (!ifType) {
      logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}
${JSON.stringify(msg?.message)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
      Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
    }

    return !!ifType;
  } catch (error) {
    Sentry.setExtra("Error isValidMsg", { msg });
    Sentry.captureException(error);
  }
};

const verifyQueue = async (
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {
  const { queues, greetingMessage, maxUseBotQueues } = await ShowWhatsAppService(wbot.id!, ticket.companyId);

  console.log('ticket.amountUsedBotQueues', ticket.amountUsedBotQueues)
  let queuePosition = await Setting.findOne({
    where: {
      key: "sendQueuePosition",
      companyId: ticket.companyId
    }
  });

  if (queues.length === 1) {

    const sendGreetingMessageOneQueues = await Setting.findOne({
      where: {
        key: "sendGreetingMessageOneQueues",
        companyId: ticket.companyId
      }
    });

    if (greetingMessage.length > 1 && sendGreetingMessageOneQueues?.value === "enabled") {
      const body = formatBody(`${greetingMessage}`, ticket);

      await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: body
        }
      );
    }

    await UpdateTicketService({
      ticketData: { queueId: queues[0].id },
      ticketId: ticket.id,
      companyId: ticket.companyId,
      ratingId: undefined
    });

    const count = await Ticket.findAndCountAll({
      where: {
        userId: null,
        status: "pending",
        companyId: ticket.companyId,
        queueId: queues[0].id,
        isGroup: false
      }
    });

    if (queuePosition?.value === "enabled") {
      // Lógica para enviar posição da fila de atendimento
      const qtd = count.count === 0 ? 1 : count.count
      const msgFila = `*Asistente virtual:*\n{{ms}} *{{name}}*, posición de su conversación es: *${qtd}*`;
      const bodyFila = formatBody(`${msgFila}`, ticket);
      const debouncedSentMessagePosicao = debounce(
        async () => {
          await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
            }`,
            {
              text: bodyFila
            }
          );
        },
        3000,
        ticket.id
      );
      debouncedSentMessagePosicao();
    }

    return;
  }

  //se existir um valor e se esse valor for diferente de
  //zero e se o valor for maior ou igual ao valor maximo de uso de filas
  // ele vai entrar no if
  if (maxUseBotQueues && maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= maxUseBotQueues) {
    // await UpdateTicketService({
    //   ticketData: { queueId: queues[0].id },
    //   ticketId: ticket.id
    // });

    return;
  }

  // REGRA PARA DESABILITAR O BOT PARA ALGUM CONTATO
  if (contact.disableBot) {
    return;
  }

  const selectedOption =
    msg?.message?.buttonsResponseMessage?.selectedButtonId ||
    msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
    getBodyMessage(msg);

  const choosenQueue = queues[+selectedOption - 1];

  const buttonActive = await Setting.findOne({
    where: {
      key: "chatBotType",
      companyId: ticket.companyId
    }
  });

  const typeBot = buttonActive?.value || "text";

  // Serviço p/ escolher consultor aleatório para o ticket, ao selecionar fila.
  let randomUserId;

  if (choosenQueue) {
    try {
      const userQueue = await ListUserQueueServices(choosenQueue.id);

      if (userQueue.userId > -1) {
        randomUserId = userQueue.userId;
      }

    } catch (error) {
      console.error(error);
    }
  }

  // Ativar ou desativar opção de escolher consultor aleatório.
  let settingsUserRandom = await Setting.findOne({
    where: {
      key: "userRandom",
      companyId: ticket.companyId
    }
  });

  const botText = async () => {
    if (choosenQueue) {

      // if (settingsUserRandom?.value === "enabled") {
      //   await UpdateTicketService({
      //     ticketData: { queueId: choosenQueue.id, userId: randomUserId },
      //     ticketId: ticket.id,
      //     companyId: ticket.companyId,
      //     ratingId: undefined
      //   });
      // }
      // else {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
      // }

      if (choosenQueue.chatbots.length > 0) {
        let options = "";
        choosenQueue.chatbots.forEach((chatbot, index) => {
          options += `*${index + 1}* - ${chatbot.name}\n`;
        });

        const body = formatBody(
          `${choosenQueue.greetingMessage}\n\n${options}\n*#* Volver al menú principal`,
          ticket
        );

        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact);

        if (settingsUserRandom?.value === "enabled") {
          await UpdateTicketService({
            ticketData: { userId: randomUserId },
            ticketId: ticket.id,
            companyId: ticket.companyId,
            ratingId: undefined
          });
        }
      }

      if (!choosenQueue.chatbots.length && choosenQueue.greetingMessage.length !== 0) {

        const body = formatBody(
          `${choosenQueue.greetingMessage}`,
          ticket
        );
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact);
      }

      const count = await Ticket.findAndCountAll({
        where: {
          userId: null,
          status: "pending",
          companyId: ticket.companyId,
          queueId: choosenQueue.id,
          isGroup: false
        }
      });

      console.log('ticket.queueId2', ticket.queueId)
      console.log('count2', count.count)

      if (queuePosition?.value === "enabled" && !choosenQueue.chatbots.length) {
        // Lógica para enviar posição da fila de atendimento
        const qtd = count.count === 0 ? 1 : count.count
        const msgFila = `*Asistente virtual:*\n{{ms}} *{{name}}*, posición de su conversación es:  *${qtd}*`;
        const bodyFila = formatBody(`${msgFila}`, ticket);
        const debouncedSentMessagePosicao = debounce(
          async () => {
            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
              }`,
              {
                text: bodyFila
              }
            );
          },
          3000,
          ticket.id
        );
        debouncedSentMessagePosicao();
      }

    } else {

      let options = "";

      queues.forEach((queue, index) => {
        options += `*${index + 1}* - ${queue.name}\n`;
      });

      const body = formatBody(
        `${greetingMessage}\n\n${options}`,
        ticket
      );

      const debouncedSentMessage = debounce(
        async () => {
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            {
              text: body
            }
          );

          verifyMessage(sentMessage, ticket, contact);
        },
        1000,
        ticket.id
      );

      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });

      debouncedSentMessage();
    }
  };

  const botButton = async () => {
    if (choosenQueue) {

      // if (settingsUserRandom?.value === "enabled") {
      //   await UpdateTicketService({
      //     ticketData: { queueId: choosenQueue.id, userId: randomUserId },
      //     ticketId: ticket.id,
      //     companyId: ticket.companyId,
      //     ratingId: undefined
      //   });
      // }
      // else {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
      // }

      if (choosenQueue.chatbots.length > 0) {
        const buttons = [];
        choosenQueue.chatbots.forEach((queue, index) => {
          buttons.push({
            buttonId: `${index + 1}`,
            buttonText: { displayText: queue.name },
            type: 1
          });
        });

        const buttonMessage = {
          text: formatBody(`${choosenQueue.greetingMessage}`, ticket),
          buttons: buttons,
          headerType: 4
        };

        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          buttonMessage
        );

        await verifyMessage(sendMsg, ticket, contact);
      }

      if (!choosenQueue.chatbots.length) {
        const body = formatBody(
          `${choosenQueue.greetingMessage}`,
          ticket
        );
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact);
      }
    } else {
      const buttons = [];
      queues.forEach((queue, index) => {
        buttons.push({
          buttonId: `${index + 1}`,
          buttonText: { displayText: queue.name },
          type: 4
        });
      });

      const buttonMessage = {
        text: formatBody(`${greetingMessage}`, ticket),
        buttons:  buttons,
        headerType: 4
      };

      const sendMsg = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        buttonMessage
      );

      await verifyMessage(sendMsg, ticket, contact);

      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });

    }
  };

  const botList = async () => {
    if (choosenQueue) {

      // if (settingsUserRandom?.value === "enabled") {
      //   await UpdateTicketService({
      //     ticketData: { queueId: choosenQueue.id, userId: randomUserId },
      //     ticketId: ticket.id,
      //     companyId: ticket.companyId,
      //     ratingId: undefined
      //   });
      // }
      // else {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
      // }

      if (choosenQueue.chatbots.length > 0) {
        const sectionsRows = [];
        choosenQueue.chatbots.forEach((queue, index) => {
          sectionsRows.push({
            title: queue.name,
            rowId: `${index + 1}`
          });
        });

        const sections = [
          {
            title: "Menu",
            rows: sectionsRows
          }
        ];

        const listMessage = {
          text: formatBody(`${choosenQueue.greetingMessage}`, ticket),
          buttonText: "Escoge una opción",
          sections
        };

        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          listMessage
        );

        await verifyMessage(sendMsg, ticket, contact);
      }

      if (!choosenQueue.chatbots.length) {
        const body = formatBody(
          `${choosenQueue.greetingMessage}`,
          ticket
        );

        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact);
      }
    } else {
      const sectionsRows = [];

      queues.forEach((queue, index) => {
        sectionsRows.push({
          title: queue.name,
          rowId: `${index + 1}`
        });
      });

      const sections = [
        {
          title: "Menu",
          rows: sectionsRows
        }
      ];

      const listMessage = {
        text: formatBody(`${greetingMessage}`, ticket),
        buttonText: "Escoge una opción",
        sections
      };

      const sendMsg = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        listMessage
      );

      await verifyMessage(sendMsg, ticket, contact);

      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
    }
  };

  if (typeBot === "text") {
    return botText();
  }

  if (typeBot === "button" && queues.length > 3) {
    return botText();
  }

  if (typeBot === "button" && queues.length <= 3) {
    return botButton();
  }

  if (typeBot === "list") {
    return botList();
  }
};

const verifyRating = (ticketTraking: TicketTraking) => {
  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.userId !== null &&
    ticketTraking.ratingAt !== null
  ) {
    return true;
  }
  return false;
};

const handleRating = async (
  msg: WAMessage,
  ticket: Ticket,
  ticketTraking: TicketTraking
) => {
  const io = getIO();
  let rate: any | null = null;

  if (msg.message?.conversation) {
    rate = +msg.message?.conversation;
  }

  if (!isNull(rate) && ticketTraking.ratingId) {
    const { complationMessage } = await ShowWhatsAppService(
      ticket.whatsappId,
      ticket.companyId
    );

    const optionRating = rate;
    const rating = await Rating.findByPk(ticketTraking.ratingId, {
      include: [
        {
          model: RatingOption,
          as: "options",
        }
      ]
    });
    if (rating) {
      const ratingOptionsSelected = rating.options.filter(
        option => `${option.value}` === `${optionRating}`
      );

      let sendFarewellWaitingTicket = await Setting.findOne({
        where: {
          key: "sendFarewellWaitingTicket",
          companyId: ticket.companyId
        }
      });

      if (ratingOptionsSelected.length > 0) {
        await UserRating.create({
          ticketId: ticketTraking.ticketId,
          companyId: ticketTraking.companyId,
          userId: ticketTraking.userId,
          ratingId: ticketTraking.ratingId,
          ratingIdOption: ratingOptionsSelected[0].id
        });

        if (!isNil(complationMessage) && complationMessage !== "") {
          if ((ticket.status !== 'pending') || (ticket.status === 'pending' && sendFarewellWaitingTicket?.value === 'enabled')) {
            const body = `\u200e${complationMessage}`;
            await SendWhatsAppMessage({ body, ticket });
          }
        }

        await ticketTraking.update({
          finishedAt: moment().toDate(),
          rated: true
        });

        await ticket.update({
          queueId: null,
          userId: null,
          status: "closed",
          amountUsedBotQueues: 0
        });

        io.to("open").emit(`company-${ticket.companyId}-ticket`, {
          action: "delete",
          ticket,
          ticketId: ticket.id
        });

        io.to(ticket.status)
          .to(ticket.id.toString())
          .emit(`company-${ticket.companyId}-ticket`, {
            action: "update",
            ticket,
            ticketId: ticket.id
          });
      } else {

        if (!isNil(complationMessage) && complationMessage !== "") {
          if ((ticket.status !== 'pending') || (ticket.status === 'pending' && sendFarewellWaitingTicket?.value === 'enabled')) {
            const body = `\u200e${complationMessage}`;
            await SendWhatsAppMessage({ body, ticket });
          }
        }

        await ticketTraking.update({
          finishedAt: moment().toDate(),
          rated: true
        });

        await ticket.update({
          queueId: null,
          userId: null,
          status: "closed",
          amountUsedBotQueues: 0
        });

        io.to("open").emit(`company-${ticket.companyId}-ticket`, {
          action: "delete",
          ticket,
          ticketId: ticket.id
        });

        io.to(ticket.status)
          .to(ticket.id.toString())
          .emit(`company-${ticket.companyId}-ticket`, {
            action: "update",
            ticket,
            ticketId: ticket.id
          });
      }
    }
  }
};

const handleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number
): Promise<void> => {
  if (!isValidMsg(msg)) {
    return;
  }

  try {
    let msgContact: IMe;
    let groupContact: Contact | undefined;
    const bodyMessage = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);
    if (msgType === "protocolMessage") return; // Tratar isso no futuro para excluir msgs se vor REVOKE

    const hasMedia =
      msg.message?.audioMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.documentMessage ||
      msg.message.stickerMessage ||
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
      msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
      msg.message?.viewOnceMessageV2?.message?.imageMessage

    if (msg.key.fromMe) {
      if (
        !hasMedia &&
        msgType !== "conversation" &&
        msgType !== "extendedTextMessage" &&
        msgType !== "vcard" &&
        msgType !== "reactionMessage" &&
        msgType !== "ephemeralMessage" &&
        msgType !== "protocolMessage" &&
        msgType !== "viewOnceMessage"
      )
        return;
      msgContact = await getContactMessage(msg, wbot);
    } else {
      msgContact = await getContactMessage(msg, wbot);
    }

    const isGroup = msg.key.remoteJid?.endsWith("@g.us");

    // IGNORAR MENSAGENS DE GRUPO
    const msgIsGroupBlock = await Settings.findOne({
      where: { key: "CheckMsgIsGroup", companyId }
    });

    if (msgIsGroupBlock?.value === "enabled" && isGroup) return;

    if (isGroup) {
      const grupoMeta = await wbot.groupMetadata(msg.key.remoteJid);
      const msgGroupContact = {
        id: grupoMeta.id,
        name: grupoMeta.subject
      };
      groupContact = await verifyContact(msgGroupContact, wbot, companyId);
    }

    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);

    const contact = await verifyContact(msgContact, wbot, companyId);

    let unreadMessages = 0;

    if (msg.key.fromMe) {
      await cacheLayer.set(`contacts:${contact.id}:unreads`, "0");
    } else {
      const unreads = await cacheLayer.get(`contacts:${contact.id}:unreads`);
      unreadMessages = +unreads + 1;
      await cacheLayer.set(
        `contacts:${contact.id}:unreads`,
        `${unreadMessages}`
      );
    }

    // contador
    // if (msg.key.fromMe && count?.unreadCount > 0) {
    //   let remoteJid = msg.key.remoteJid;
    //   SendAckBYRemoteJid({ remoteJid, companyId });
    // }

    // CONFIRMAR
    const _ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      companyId,
      groupContact
    );

    if (
      unreadMessages === 0 &&
      whatsapp.farewellMessage &&
      formatBody(whatsapp.farewellMessage, _ticket) === bodyMessage
    ) {
      return;
    }

    const ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      companyId,
      groupContact
    );

    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: whatsapp?.id
    });

    try {
      if (!msg.key.fromMe) {
        /**
         * Tratamento para avaliação do atendente
         */
        if (ticketTraking !== null && verifyRating(ticketTraking)) {
          handleRating(msg, ticket, ticketTraking);
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    if (hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    const currentSchedule = await VerifyCurrentSchedule(companyId);

    const scheduleType = await Setting.findOne({
      where: {
        companyId,
        key: "scheduleType"
      }
    });

    try {
      if (!msg.key.fromMe && scheduleType) {
        /**
         * Tratamento para envio de mensagem quando a empresa está fora do expediente
         */
        if (
          scheduleType.value === "company" &&
          !isNil(currentSchedule) &&
          (!currentSchedule || currentSchedule.inActivity === false)
        ) {

          if (whatsapp.outOfHoursMessage !== "") {

            const body = `${whatsapp.outOfHoursMessage}`;

            const debouncedSentMessage = debounce(
              async () => {
                await wbot.sendMessage(
                  `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                  }`,
                  {
                    text: body
                  }
                );
              },
              1000,
              ticket.id
            );
            debouncedSentMessage();
            return;

          }
          return;
        }

      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }


    if (
      !ticket.queue &&
      !isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1
    ) {
      await verifyQueue(wbot, msg, ticket, contact);
    }

    // Verificação se aceita audio do contato
    if (
      getTypeMessage(msg) === "audioMessage" &&
      !msg.key.fromMe &&
      !isGroup &&
      !contact.acceptAudioMessage
    ) {
      const sentMessage = await wbot.sendMessage(
        `${contact.number}@c.us`,
        {
          text: "*Asistente virtual*:\nDesafortunadamente, no podemos escuchar o enviar audio a través de este canal de servicio, envíe un mensaje de *texto*."
        },
        {
          quoted: {
            key: msg.key,
            message: {
              extendedTextMessage: msg.message.extendedTextMessage
            }
          }
        }
      );
      await verifyMessage(sentMessage, ticket, contact);
    }

    if (ticket.queue && ticket.queueId && !msg.key.fromMe) {
      if (!ticket.user) {
        await sayChatbot(ticket.queueId, wbot, ticket, contact, msg);
      }
    }

    await ticket.reload();

    try {
      if (!msg.key.fromMe && scheduleType && ticket.queueId !== null) {
        /**
         * Tratamento para envio de mensagem quando a fila está fora do expediente
         */
        const queue = await Queue.findByPk(ticket.queueId);

        const { schedules }: any = queue;
        const now = moment();
        const weekday = now.format("dddd").toLowerCase();
        let schedule = null;

        if (Array.isArray(schedules) && schedules.length > 0) {
          schedule = schedules.find(
            s =>
              s.weekdayEn === weekday &&
              s.startTime !== "" &&
              s.startTime !== null &&
              s.endTime !== "" &&
              s.endTime !== null
          );
        }

        if (
          scheduleType.value === "queue" &&
          queue.outOfHoursMessage !== null &&
          queue.outOfHoursMessage !== "" &&
          !isNil(schedule)
        ) {
          const startTime = moment(schedule.startTime, "HH:mm");
          const endTime = moment(schedule.endTime, "HH:mm");

          if (now.isBefore(startTime) || now.isAfter(endTime)) {
            const body = `${queue.outOfHoursMessage}`;
            const debouncedSentMessage = debounce(
              async () => {
                await wbot.sendMessage(
                  `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                  }`,
                  {
                    text: body
                  }
                );
              },
              1000,
              ticket.id
            );
            debouncedSentMessage();
            return;
          }
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

const handleMsgAck = async (
  msg: WAMessage,
  chat: number | null | undefined
) => {
  await new Promise(r => setTimeout(r, 500));
  const io = getIO();

  try {
    const messageToUpdate = await Message.findByPk(msg.key.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });

    if (!messageToUpdate) return;

    // CRIAR CAMPO DELIVERYAT
    //   if (chat === 3) {
    //     await messageToUpdate.update({
    //         ack: chat,
    //         deliveredAt: moment().format("YYYY-MM-DD HH:mm:ss")
    //     });
    // } else if (chat === 4 || chat === 5) {
    //     if (messageToUpdate.deliveredAt === null) {
    //         await messageToUpdate.update({
    //             ack: chat,
    //             deliveredAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    //             readAt: moment().format("YYYY-MM-DD HH:mm:ss")
    //         });
    //     } else {
    //         await messageToUpdate.update({
    //             ack: chat,
    //             readAt: moment().format("YYYY-MM-DD HH:mm:ss")
    //         });
    //     }
    // }

    await messageToUpdate.update({ ack: chat });
    io.to(messageToUpdate.ticketId.toString()).emit(
      `company-${messageToUpdate.companyId}-appMessage`,
      {
        action: "update",
        message: messageToUpdate
      }
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};

const verifyRecentCampaign = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  if (!isValidMsg(message)) {
    return;
  }
  if (!message.key.fromMe) {
    const number = message.key.remoteJid.replace(/\D/g, "");
    const campaigns = await Campaign.findAll({
      where: { companyId, status: "EM_ANDAMENTO", confirmation: true }
    });
    if (campaigns) {
      const ids = campaigns.map(c => c.id);
      const campaignShipping = await CampaignShipping.findOne({
        where: { campaignId: { [Op.in]: ids }, number, confirmation: null }
      });

      if (campaignShipping) {
        await campaignShipping.update({
          confirmedAt: moment(),
          confirmation: true
        });
        await campaignQueue.add(
          "DispatchCampaign",
          {
            campaignShippingId: campaignShipping.id,
            campaignId: campaignShipping.campaignId
          },
          {
            delay: parseToMilliseconds(randomValue(0, 10))
          }
        );
      }
    }
  }
};

const verifyCampaignMessageAndCloseTicket = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  if (!isValidMsg(message)) {
    return;
  }
  const io = getIO();
  const body = getBodyMessage(message);
  const isCampaign = /\u200c/.test(body);
  if (message.key.fromMe && isCampaign) {
    const messageRecord = await Message.findOne({
      where: { id: message.key.id!, companyId }
    });
    const ticket = await Ticket.findByPk(messageRecord.ticketId);
    await ticket.update({ status: "closed", amountUsedBotQueues: 0 });

    io.to("open").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }
};

const filterMessages = (msg: WAMessage): boolean => {
  if (msg.message?.protocolMessage) return false;

  if (
    [
      WAMessageStubType.REVOKE,
      WAMessageStubType.E2E_DEVICE_CHANGED,
      WAMessageStubType.E2E_IDENTITY_CHANGED,
      WAMessageStubType.CIPHERTEXT
    ].includes(msg.messageStubType as WAMessageStubType)
  )
    return false;

  return true;
};

const wbotMessageListener = (wbot: Session, companyId: number): void => {
  wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {
    const messages = messageUpsert.messages
      .filter(filterMessages)
      .map(msg => msg);

    if (!messages) return;

    messages.forEach(async (message: proto.IWebMessageInfo) => {
      const messageExists = await Message.count({
        where: { id: message.key.id!, companyId }
      });

      if (!messageExists) {
        await handleMessage(message, wbot, companyId);
        await verifyRecentCampaign(message, companyId);
        await verifyCampaignMessageAndCloseTicket(message, companyId);
      }
    });
  });

  wbot.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {
    if (messageUpdate.length === 0) return;
    messageUpdate.forEach(async (message: WAMessageUpdate) => {
      (wbot as WASocket)!.readMessages([message.key])
      const msgUp = { ...messageUpdate }
      if (msgUp['0']?.update.messageStubType === 1 && msgUp['0']?.key.remoteJid !== 'status@broadcast') {
        MarkDeleteWhatsAppMessage(msgUp['0']?.key.remoteJid, null, msgUp['0']?.key.id, companyId)
      }
      handleMsgAck(message, message.update.status);
    });
  });

  wbot.ev.on("groups.update", (groupUpdate: GroupMetadata[]) => {
    if (groupUpdate.length === 0) return;
    groupUpdate.forEach(async (group: GroupMetadata) => {
      const number = group.id.replace(/\D/g, "");
      const nameGroup = group.subject || number;

      const contactData = {
        name: nameGroup,
        number: number,
        isGroup: true,
        companyId: companyId
      };

      const contact = await CreateOrUpdateContactService(contactData);

    });
  })
};

export { wbotMessageListener, handleMessage };

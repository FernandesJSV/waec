import * as Sentry from "@sentry/node";

import { Contact as BContact, WASocket, BinaryNode, } from "@adiwajshing/baileys";
import { Op } from "sequelize";

import Whatsapp from "../../models/Whatsapp";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";

import { logger } from "../../utils/logger";
import { Store } from "../../libs/store";
import { getIO } from "../../libs/socket";

import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateMessageService from "../MessageServices/CreateMessageService";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface IContact {
  contacts: Contact[];
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  const io = getIO();
  const sessionName = whatsapp.name;

  try {

    wbot.ws.on("CB:call", async (node: BinaryNode) => {
      const content = node.content[0] as any;

      if (content.tag === "offer") {
        const { from, id } = node.attrs;
        console.log(`${from} is calling you with id ${id}`);
      }

      if (content.tag === "terminate") {
        const sendMsgCall = await Setting.findOne({
          where: { key: "acceptCallWhatsapp", companyId: companyId }
        });

        if (sendMsgCall?.value === "enabled") {
          await wbot.sendMessage(node.attrs.from, {
            text: "*Asistente Virtual:*\nLas llamadas de voz y video están deshabilitadas para este WhatsApp, envíe un mensaje de texto..\n\nMuchas Gracias!"
          });

          const number = node.attrs.from.replace(/\D/g, "");

          const contact = await Contact.findOne({
            where: { number, companyId }
          });

          const ticket = await Ticket.findOne({
            where: {
              contactId: contact.id,
              whatsappId: wbot.id,
              status: { [Op.or]: ["open", "pending"] },
              companyId: companyId
            }
          });
          // se não existir o ticket não faz nada.
          if (!ticket) return;
          const date = new Date();
          const hours = date.getHours();
          const minutes = date.getMinutes();

          const body = `Llamada de voz/video perdida a las ${hours}:${minutes}`;
          const messageData = {
            id: content.attrs["call-id"],
            ticketId: ticket.id,
            contactId: contact.id,
            body,
            fromMe: false,
            mediaType: "call_log",
            read: true,
            quotedMsgId: null,
            ack: 1
          };

          await ticket.update({
            lastMessage: body
          });

          return CreateMessageService({ messageData, companyId });
        }
      }
    });

    wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {
      console.log("upsert", contacts);
      await createOrUpdateBaileysService({
        whatsappId: whatsapp.id,
        contacts
      });
    });

    // USO FUTURO
    // wbot.ev.on("messages.upsert", async () => {
    //   const showStatus = await Setting.findOne({
    //     where: { key: "showOnline" }
    //   });

    //   if (showStatus.value === "disabled") {
    //     await wbot.sendPresenceUpdate('unavailable');
    //   } else {
    //     await wbot.sendPresenceUpdate('available');
    //   }
    // });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;

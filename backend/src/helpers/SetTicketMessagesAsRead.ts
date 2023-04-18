import { proto, WASocket } from "@adiwajshing/baileys";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import { logger } from "../utils/logger";
import GetTicketWbot from "./GetTicketWbot";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  await ticket.update({ unreadMessages: 0 });

  if (ticket.channel === 'whatsapp') {
    try {
      const wbot = await GetTicketWbot(ticket);
      // no baileys temos que marcar cada mensagem como lida
      // não o chat inteiro como é feito no legacy
      const getJsonMessage = await Message.findAll({
        where: {
          ticketId: ticket.id,
          fromMe: false,
          read: false
        },
        order: [["createdAt", "DESC"]]
      });

      if (getJsonMessage.length > 0) {

        getJsonMessage.forEach(async message => {
          const msg: proto.IWebMessageInfo = JSON.parse(message.dataJson);
          if (msg.key && msg.key.fromMe === false) {

            await wbot.readMessages([msg.key])
          }
        });
      }
      await Message.update(
        { read: true },
        {
          where: {
            ticketId: ticket.id,
            read: false
          }
        }
      );
    } catch (err) {
      console.log(err);
      logger.warn(
        `Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`
      );
    }
  }

  const io = getIO();
  io.to(ticket.status).to("notification").emit(`company-${ticket.companyId}-ticket`, {
    action: "updateUnread",
    ticketId: ticket.id
  });
};

export default SetTicketMessagesAsRead;

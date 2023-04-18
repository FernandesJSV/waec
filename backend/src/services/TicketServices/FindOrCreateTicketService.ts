import { add, subHours } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import Message from "../../models/Message";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";

interface TicketData {
  status?: string;
  companyId?: number;
  unreadMessages?: number;
}

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  companyId: number,
  groupContact?: Contact,
  channel?: string
): Promise<Ticket> => {

  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending", "closed"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      companyId
    },
    order: [["id", "DESC"]]
  });

  if (ticket) {
    await ticket.update({
      unreadMessages,
      whatsappId: whatsappId
    });
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages,
        whatsappId: whatsappId,
        companyId,
        isBot: true
      });
      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
    }
  }

  const listSettingsService = await ListSettingsServiceOne({
    companyId,
    key: "timeCreateNewTicket"
  });

  let timeCreateNewTicket = Number(listSettingsService?.value) as number | undefined;
  if (timeCreateNewTicket) timeCreateNewTicket = timeCreateNewTicket;

  if (!ticket && !groupContact) {
    if (timeCreateNewTicket !== 0) {
      ticket = await Ticket.findOne({
        where: {
          updatedAt: {
            [Op.between]: [
              +add(new Date(), {
                seconds: timeCreateNewTicket
              }),
              +new Date()
            ]
          },
          contactId: contact.id,
          companyId
        },
        order: [["updatedAt", "DESC"]]
      });
    }

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages,
        companyId,
        // queueId: timeCreateNewTicket === 0 ? null : ticket.queueId
      });
      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
    }
  }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: "pending",
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId,
      companyId,
      isBot: true,
      channel
    });
    await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId,
      userId: ticket.userId
    });
  }

  ticket = await ShowTicketService(ticket.id, companyId);

  return ticket;
};

export default FindOrCreateTicketService;

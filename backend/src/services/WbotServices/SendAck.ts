import { WASocket } from "@adiwajshing/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import ShowTicketService from "../TicketServices/ShowTicketService";

export const SendAckBYticketId = async ({ ticketId, companyId
}): Promise<Response> => {
    const ticket = await ShowTicketService(ticketId, companyId);
    let unreadMessages = ticket.unreadMessages;
    //console.log("UnreadMessages: ", ticket);
    if (unreadMessages > 0) {

        //console.log("Existem mensagens não lidas");
        let wbot;
        try {
            wbot = await GetTicketWbot(ticket);
            //console.log(wbot);

        } catch (error) {
            console.log("não consegui pegar o wbot")
        }

        if (!ticket) {
            throw new AppError("ERR_NO_TICKET_FOUND", 404);
        }

        const limit = 100;

        const { count, rows: messages } = await Message.findAndCountAll({
            limit,
            include: [
                "contact",
                {
                    model: Message,
                    as: "quotedMsg",
                    include: ["contact"]
                },
                {
                    model: Ticket,
                    where: { contactId: ticket.contactId },
                    required: true
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        messages.forEach(async (message) => {

            if (wbot) {
                const count = wbot.store.chats.get(message.remoteJid);
                (wbot as WASocket)!.readMessages([message])

                let remoteJid = message.remoteJid;
                let ticket = message.ticket;
                ticket.update({ unreadMessages: 0 });
                if (remoteJid && count?.unreadCount > 0) {
                    wbot.store.chats.deleteById(remoteJid)
                    wbot.sendPresenceUpdate('available');
                    setTimeout(() => {
                        wbot.sendPresenceUpdate('unavailable');
                    }, 5000);
                }
                try {
                    // const sentMessage = await (wbot as WASocket)!.sendReadReceipt(
                    //     remoteJid,
                    //     null,
                    //     [messageId],
                    // );

                    // return sentMessage;
                    return true;
                } catch (err) {
                    throw new AppError("ERR_SENDING_WAPP_MSG");
                }
            }
        });

        return
    }
}

export const SendAckBYRemoteJid = async ({ remoteJid, companyId
}): Promise<Response> => {

    const { rows: messages } = await Message.findAndCountAll({
        limit: 1,
        order: [["createdAt", "DESC"]],
        where: {
            remoteJid: remoteJid, ack: 0, companyId: companyId
        }
    });

    messages.forEach(async (message) => {
        let ticketId = message.ticketId;
        // let companyId = message.companyId;
        // console.log(ticketId);
        SendAckBYticketId({ ticketId, companyId });

    });

    return
}
// import { delay, WALegacySocket, WAMessage } from "@adiwajshing/baileys";
import { delay, WAMessage } from "@adiwajshing/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import formatBody from "../../helpers/Mustache";
import path from "path";
import fs from "fs";

interface Request {
    body: string;
    ticket: Ticket;
    quotedMsg?: Message;
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const SendWhatsAppMediaImage = async ({
    ticket,
    url,
    caption,
    msdelay
}): Promise<WAMessage> => {

    const wbot = await GetTicketWbot(ticket);
    const number = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

    try {
        wbot.sendPresenceUpdate('available');
        await delay(msdelay)
        const sentMessage = await wbot.sendMessage(
            `${number}`,
            {
                image: url ? { url } : fs.readFileSync(`${publicFolder}/company${ticket.companyId}/${caption}-${makeid(5)}.png`),
                caption: formatBody(`${caption}`, ticket),
                mimetype: 'image/jpeg'
            }
        );
        wbot.sendPresenceUpdate('unavailable');

        return sentMessage;
    } catch (err) {
        throw new AppError("ERR_SENDING_WAPP_MSG");
    }

};

export default SendWhatsAppMediaImage;

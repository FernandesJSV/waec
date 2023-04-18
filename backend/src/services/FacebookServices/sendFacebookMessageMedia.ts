import fs from "fs";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
// import formatBody from "../../helpers/Mustache";
import { sendAttachment, sendAttachmentFromUrl } from "./graphAPI";
// import cloudinary  from "cloudinary"
import { verifyMessage } from "./facebookMessageListener";

interface Request {
  ticket: Ticket;
  media?: Express.Multer.File;
  body?: string;
  url?: string;
}

export const typeAttachment = (media: Express.Multer.File) => {
  if (media.mimetype.includes("image")) {
    return "image";
  }
  if (media.mimetype.includes("video")) {
    return "video";
  }
  if (media.mimetype.includes("audio")) {
    return "audio";
  }

  return "file";
};

const sendFacebookMessageMedia = async ({
  media,
  url,
  ticket,
  body
}: Request): Promise<any> => {
  try {

    const type = typeAttachment(media);

    const sendMessage = await sendAttachmentFromUrl(
      ticket.contact.number,
      `${process.env.BACKEND_URL}/public/company${ticket.companyId}/${media.filename}`,
      type,
      ticket.whatsapp.facebookUserToken
    );

    await ticket.update({ lastMessage: body || media.filename });

    fs.unlinkSync(media.path);
    await verifyMessage(sendMessage, body || media.filename, ticket, ticket.contact);

    return sendMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export default sendFacebookMessageMedia;

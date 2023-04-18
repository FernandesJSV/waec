import * as Sentry from "@sentry/node";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";
import ShowBaileysService from "../BaileysServices/ShowBaileysService";
import CreateContactService from "../ContactServices/CreateContactService";
import { isString, isArray } from "lodash";
import path from "path";
const fs = require('fs');

const ImportContactsService = async (companyId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);

  const wbot = getWbot(defaultWhatsapp.id);

  let phoneContacts;

  try {
    const contactsString = await ShowBaileysService(wbot.id);
    // console.log('contactsString', contactsString)
    phoneContacts = JSON.parse(JSON.stringify(contactsString.contacts));

    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
    const folder = `${publicFolder}\\contatos_antes.txt`
    fs.writeFile(folder, phoneContacts, (err) => {
      if (err) throw err;
      console.log('O arquivo foi criado!');
    });

    // console.log('phoneContacts', phoneContacts)

    phoneContacts = phoneContacts.replaceAll("'", "");
    phoneContacts = phoneContacts.replaceAll(/\\"/g, ``);
    phoneContacts = phoneContacts.replaceAll(/\//g, " ");
    phoneContacts = phoneContacts.replaceAll(/\\/g, ``);
    phoneContacts = phoneContacts.replaceAll('""', '"');
    phoneContacts = phoneContacts.replaceAll(/""""""/g, ``);
    phoneContacts = phoneContacts.replaceAll(/""""""""""""/g, ``);
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const folder = `${publicFolder}\\contatos_depois.txt`
  fs.writeFile(folder, phoneContacts, (err) => {
    if (err) throw err;
    console.log('O arquivo foi criado!');
  });

  console.log('phoneContacts', phoneContacts)
  const phoneContactsList = isString(phoneContacts)
    ? JSON.parse(phoneContacts)
    : phoneContacts;

  if (isArray(phoneContactsList)) {
    phoneContactsList.forEach(async ({ id, name, notify }) => {
      if (id === "status@broadcast" || id.includes("g.us") === "g.us") return;
      const number = id.replace(/\D/g, "");

      const numberExists = await Contact.findOne({
        where: { number, companyId }
      });

      if (!numberExists) {
        try {
          await CreateContactService({
            number,
            name: name || notify,
            companyId
          });
        } catch (error) {
          Sentry.captureException(error);
          console.log(error);
          logger.warn(
            `Could not get whatsapp contacts from phone. Err: ${error}`
          );
        }
      }
    });
  }
};

export default ImportContactsService;

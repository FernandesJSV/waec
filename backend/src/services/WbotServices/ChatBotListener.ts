import { proto, WASocket } from "@adiwajshing/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { Store } from "../../libs/store";
import { getBodyMessage, verifyMessage } from "./wbotMessageListener";
import ShowDialogChatBotsServices from "../DialogChatBotsServices/ShowDialogChatBotsServices";
import ShowQueueService from "../QueueService/ShowQueueService";
import ShowChatBotServices from "../ChatBotServices/ShowChatBotServices";
import DeleteDialogChatBotsServices from "../DialogChatBotsServices/DeleteDialogChatBotsServices";
import ShowChatBotByChatbotIdServices from "../ChatBotServices/ShowChatBotByChatbotIdServices";
import CreateDialogChatBotsServices from "../DialogChatBotsServices/CreateDialogChatBotsServices";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import formatBody from "../../helpers/Mustache";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import Chatbot from "../../models/Chatbot";
import User from "../../models/User";
import Setting from "../../models/Setting";
import CheckIntegrations from "../../helpers/CheckIntegrations";
import { debounce } from "../../helpers/Debounce";
import ListUserQueueServices from "../UserQueueServices/ListUserQueueServices";

const fs = require('fs')
var axios = require('axios');

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const isNumeric = (value: string) => /^-?\d+$/.test(value);

export const deleteAndCreateDialogStage = async (
  contact: Contact,
  chatbotId: number,
  ticket: Ticket
) => {
  try {
    await DeleteDialogChatBotsServices(contact.id);
    const bots = await ShowChatBotByChatbotIdServices(chatbotId);
    if (!bots) {
      await ticket.update({ isBot: false });
    }
    return await CreateDialogChatBotsServices({
      awaiting: 1,
      contactId: contact.id,
      chatbotId,
      queueId: bots.queueId
    });
  } catch (error) {
    await ticket.update({ isBot: false });
  }
};

const sendMessage = async (
  wbot: Session,
  contact: Contact,
  ticket: Ticket,
  body: string
) => {
  const sentMessage = await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    {
      text: formatBody(body, ticket)
    }
  );
  verifyMessage(sentMessage, ticket, contact);
};

const sendMessageLink = async (
  wbot: Session,
  contact: Contact,
  ticket: Ticket,
  url: string,
  caption: string
) => {

  let sentMessage
  try {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        document: url ? { url } : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
        fileName: caption,
        mimetype: 'application/pdf'
      }
    );
  } catch (error) {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        text: formatBody('\u200eNão consegui enviar o PDF, tente novamente!', ticket)
      }
    );
  }
  verifyMessage(sentMessage, ticket, contact);
};

const sendMessageImage = async (
  wbot: Session,
  contact: Contact,
  ticket: Ticket,
  url: string,
  caption: string
) => {

  let sentMessage
  try {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        image: url ? { url } : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
        fileName: caption,
        caption: caption,
        mimetype: 'image/jpeg'
      }
    );
  } catch (error) {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        text: formatBody('Não consegui enviar o PDF, tente novamente!', ticket)
      }
    );
  }
  verifyMessage(sentMessage, ticket, contact);
};

// const sendDialog = async (
//   choosenQueue: Chatbot,
//   wbot: Session,
//   contact: Contact,
//   ticket: Ticket
// ) => {
//   const showChatBots = await ShowChatBotServices(choosenQueue.id);
//   if (showChatBots.options) {

//     const buttonActive = await Setting.findOne({
//       where: {
//         key: "chatBotType",
//         companyId: ticket.companyId
//       }
//     });

//     const typeBot = buttonActive?.value || "text";

//     const botText = async () => {
//       let options = "";

//       showChatBots.options.forEach((option, index) => {
//         options += `*${index + 1}* - ${option.name}\n`;
//       });

//       const optionsBack =
//         options.length > 0
//           ? `${options}\n*#* Volver al menú principal`
//           : options;

//       if (options.length > 0) {
//         const body = `\u200e${choosenQueue.greetingMessage}\n\n${optionsBack}`;
//         const sendOption = await sendMessage(wbot, contact, ticket, body);
//         return sendOption;
//       }

//       const body = `\u200e${choosenQueue.greetingMessage}`;
//       const send = await sendMessage(wbot, contact, ticket, body);
//       return send;
//     };

//     const botButton = async () => {
//       const buttons = [];
//       showChatBots.options.forEach((option, index) => {
//         buttons.push({
//           buttonId: `${index + 1}`,
//           buttonText: { displayText: option.name },
//           type: 1
//         });
//       });

//       if (buttons.length > 0) {
//         const buttonMessage = {
//           text: `\u200e${choosenQueue.greetingMessage}`,
//           buttons,
//           headerType: 1
//         };

//         // const send = await wbot.sendMessage(
//         //   `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
//         //   buttonMessage
//         // );

//         await wbot.presenceSubscribe(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         await sleep(1500)
//         await wbot.sendPresenceUpdate('composing', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         await sleep(1000)
//         await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         const send = await wbot.sendMessage(
//           `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
//           buttonMessage
//         );

//         await verifyMessage(send, ticket, contact);

//         return send;
//       }

//       const body = `\u200e${choosenQueue.greetingMessage}`;
//       const send = await sendMessage(wbot, contact, ticket, body);

//       return send;
//     };

//     const botList = async () => {
//       const sectionsRows = [];
//       showChatBots.options.forEach((queue, index) => {
//         sectionsRows.push({
//           title: queue.name,
//           rowId: `${index + 1}`
//         });
//       });

//       if (sectionsRows.length > 0) {
//         const sections = [
//           {
//             title: "Menu",
//             rows: sectionsRows
//           }
//         ];

//         const listMessage = {
//           text: formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket),
//           buttonText: "Escoge una opción",
//           sections
//         };

//         await wbot.presenceSubscribe(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         await sleep(1500)
//         await wbot.sendPresenceUpdate('composing', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)
//         await sleep(1000)
//         await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,)

//         const sendMsg = await wbot.sendMessage(
//           `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
//           listMessage
//         );

//         await verifyMessage(sendMsg, ticket, contact);

//         return sendMsg;
//       }

//       const body = `\u200e${choosenQueue.greetingMessage}`;
//       const send = await sendMessage(wbot, contact, ticket, body);

//       return send;
//     };

//     if (typeBot === "text") {
//       return botText();
//     }

//     if (typeBot === "button" && showChatBots.options.length > 3) {
//       return botText();
//     }

//     if (typeBot === "button" && showChatBots.options.length <= 3) {
//       return botButton();
//     }

//     if (typeBot === "list") {
//       return botList();
//     }
//   }
// };

const sendDialog = async (
  choosenQueue: Chatbot,
  wbot: Session,
  contact: Contact,
  ticket: Ticket
) => {
  const showChatBots = await ShowChatBotServices(choosenQueue.id);
  if (showChatBots.options) {

    const buttonActive = await Setting.findOne({
      where: {
        key: "chatBotType",
        companyId: ticket.companyId
      }
    });

    const typeBot = buttonActive?.value || "text";

    const botText = async () => {
      let options = "";

      showChatBots.options.forEach((option, index) => {
        options += `*${index + 1}* - ${option.name}\n`;
      });

      const optionsBack =
        options.length > 0
          ? `${options}\n*#* Volver al menú principal`
          : options;

      if (options.length > 0) {
        const body = `\u200e${choosenQueue.greetingMessage}\n\n${optionsBack}`;
        const sendOption = await sendMessage(wbot, contact, ticket, body);
        return sendOption;
      }

      const body = `\u200e${choosenQueue.greetingMessage}`;
      const send = await sendMessage(wbot, contact, ticket, body);
      return send;
    };

    const botButton = async () => {
      const buttons = [];
      showChatBots.options.forEach((option, index) => {
        buttons.push({
          buttonId: `${index + 1}`,
          buttonText: { displayText: option.name },
          type: 1
        });
      });

      if (buttons.length > 0) {

        const buttonMessage = {
          text: `\u200e${choosenQueue.greetingMessage}`,
          buttons,
          headerType: 1
        };

        const send = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          buttonMessage
        );

        await verifyMessage(send, ticket, contact);

        return send;
      }

      const body = `\u200e${choosenQueue.greetingMessage}`;
      const send = await sendMessage(wbot, contact, ticket, body);

      return send;

    };

    const botList = async () => {
      const sectionsRows = [];
      showChatBots.options.forEach((queue, index) => {
        sectionsRows.push({
          title: queue.name,
          rowId: `${index + 1}`
        });
      });

      if (sectionsRows.length > 0) {
        const sections = [
          {
            title: "Menu",
            rows: sectionsRows
          }
        ];

        const listMessage = {
          text: formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket),
          buttonText: "Escoge una opción",
          sections
        };

        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          listMessage
        );

        await verifyMessage(sendMsg, ticket, contact);

        return sendMsg;
      }

      const body = `\u200e${choosenQueue.greetingMessage}`;
      const send = await sendMessage(wbot, contact, ticket, body);

      return send;
    };

    if (typeBot === "text") {
      return await botText();
    }

    if (typeBot === "button" && showChatBots.options.length > 4) {
      return await botText();
    }

    if (typeBot === "button" && showChatBots.options.length <= 4) {
      return await botButton();
    }

    if (typeBot === "list") {
      return await botList();
    }
  }

};

const backToMainMenu = async (
  wbot: Session,
  contact: Contact,
  ticket: Ticket
) => {
  await UpdateTicketService({
    ticketData: { queueId: null, userId: null },
    ticketId: ticket.id,
    companyId: ticket.companyId,
    ratingId: undefined
  });

  const { queues, greetingMessage } = await ShowWhatsAppService(wbot.id!, ticket.companyId);

  const buttonActive = await Setting.findOne({
    where: {
      key: "chatBotType"
    }
  });

  const botText = async () => {
    let options = "";

    queues.forEach((option, index) => {
      options += `*${index + 1}* - ${option.name}\n`;
    });

    const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);
    await sendMessage(wbot, contact, ticket, body);

    const deleteDialog = await DeleteDialogChatBotsServices(contact.id);
    return deleteDialog;
  };

  const botButton = async () => {
    const buttons = [];
    queues.forEach((queue, index) => {
      buttons.push({
        buttonId: `${index + 1}`,
        buttonText: { displayText: queue.name },
        type: 1
      });
    });

    const buttonMessage = {
      text: formatBody(`\u200e${greetingMessage}`, ticket),
      buttons,
      headerType: 1
    };

    const sendMsg = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      buttonMessage
    );

    await verifyMessage(sendMsg, ticket, contact);

    const deleteDialog = await DeleteDialogChatBotsServices(contact.id);
    return deleteDialog;
  };

  const botList = async () => {
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
      text: formatBody(`\u200e${greetingMessage}`, ticket),
      buttonText: "Escoge una opción",
      sections
    };

    const sendMsg = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      listMessage
    );

    await verifyMessage(sendMsg, ticket, contact);

    const deleteDialog = await DeleteDialogChatBotsServices(contact.id);
    return deleteDialog;
  };

  if (buttonActive.value === "text") {
    return botText();
  }

  if (buttonActive.value === "button" && queues.length > 4) {
    return botText();
  }

  if (buttonActive.value === "button" && queues.length <= 4) {
    return botButton();
  }

  if (buttonActive.value === "list") {
    return botList();
  }
};

function validaCpfCnpj(val) {
  if (val.length == 11) {
    var cpf = val.trim();

    cpf = cpf.replace(/\./g, '');
    cpf = cpf.replace('-', '');
    cpf = cpf.split('');

    var v1 = 0;
    var v2 = 0;
    var aux = false;

    for (var i = 1; cpf.length > i; i++) {
      if (cpf[i - 1] != cpf[i]) {
        aux = true;
      }
    }

    if (aux == false) {
      return false;
    }

    for (var i = 0, p = 10; (cpf.length - 2) > i; i++, p--) {
      v1 += cpf[i] * p;
    }

    v1 = ((v1 * 10) % 11);

    if (v1 == 10) {
      v1 = 0;
    }

    if (v1 != cpf[9]) {
      return false;
    }

    for (var i = 0, p = 11; (cpf.length - 1) > i; i++, p--) {
      v2 += cpf[i] * p;
    }

    v2 = ((v2 * 10) % 11);

    if (v2 == 10) {
      v2 = 0;
    }

    if (v2 != cpf[10]) {
      return false;
    } else {
      return true;
    }
  } else if (val.length == 14) {
    var cnpj = val.trim();

    cnpj = cnpj.replace(/\./g, '');
    cnpj = cnpj.replace('-', '');
    cnpj = cnpj.replace('/', '');
    cnpj = cnpj.split('');

    var v1 = 0;
    var v2 = 0;
    var aux = false;

    for (var i = 1; cnpj.length > i; i++) {
      if (cnpj[i - 1] != cnpj[i]) {
        aux = true;
      }
    }

    if (aux == false) {
      return false;
    }

    for (var i = 0, p1 = 5, p2 = 13; (cnpj.length - 2) > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v1 += cnpj[i] * p1;
      } else {
        v1 += cnpj[i] * p2;
      }
    }

    v1 = (v1 % 11);

    if (v1 < 2) {
      v1 = 0;
    } else {
      v1 = (11 - v1);
    }

    if (v1 != cnpj[12]) {
      return false;
    }

    for (var i = 0, p1 = 6, p2 = 14; (cnpj.length - 1) > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v2 += cnpj[i] * p1;
      } else {
        v2 += cnpj[i] * p2;
      }
    }

    v2 = (v2 % 11);

    if (v2 < 2) {
      v2 = 0;
    } else {
      v2 = (11 - v2);
    }

    if (v2 != cnpj[13]) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(time) {
  await timeout(time);
}

function firstDayOfMonth(month) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() - month, 1);
  return firstDay;
};

function lastDayOfMonth(month) {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + month, 0);
  return lastDay;
};

function dataAtualFormatada(data) {
  var dia = data.getDate().toString(),
    diaF = (dia.length == 1) ? '0' + dia : dia,
    mes = (data.getMonth() + 1).toString(),
    mesF = (mes.length == 1) ? '0' + mes : mes,
    anoF = data.getFullYear();
  return diaF + "/" + mesF + "/" + anoF;
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

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function formatDate(date) {
  return date.substring(8, 10) + '/' + date.substring(5, 7) + '/' + date.substring(0, 4)
}

function sortfunction(a, b) {
  return a.dueDate.localeCompare(b.dueDate);
}

async function sendMsgAndCloseTicket(wbot, contact, ticket) {

  const bodyfinaliza = `¡Estamos terminando esta conversación! Si necesitas hablar con nosotros, contáctanos de nuevo!`
  await sleep(2000)
  await sendMessage(wbot, contact, ticket, bodyfinaliza);

  const ticketUpdateAgent = {
    ticketData: {
      status: "closed",
      userId: 1,
      sendFarewellMessage: false,
      amountUsedBotQueues: 0
    },
    ticketId: ticket.id,
    companyId: ticket.companyId,
    ratingId: undefined
  };

  await sleep(2000)
  await UpdateTicketService(ticketUpdateAgent);
}

export const sayChatbot = async (
  queueId: number,
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  msg: proto.IWebMessageInfo
): Promise<any> => {

  // const selectedOption =
  //   msg?.message?.buttonsResponseMessage?.selectedButtonId ||
  //   msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
  //   getBodyMessage(msg);

  const selectedOption =
    msg?.message?.buttonsResponseMessage?.selectedButtonId ||
    msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
    getBodyMessage(msg);

  if (!queueId && selectedOption && msg.key.fromMe) return;

  const getStageBot = await ShowDialogChatBotsServices(contact.id);

  const queues = await ShowQueueService(queueId, ticket.companyId);

  let enabledIntegrationActive: any

  if (
    queues.name.toLocaleLowerCase().match(/^.*Financeiro$/) ||
    queues.name.toLocaleLowerCase().match(/^.*Boleto$/) ||
    queues.name.toLocaleLowerCase().match(/^.*Boletos$/) ||
    queues.name.toLocaleLowerCase().match(/^.*2º via$/) ||
    queues.name.toLocaleLowerCase().match(/^.*2ª via$/) ||
    queues.name.toLocaleLowerCase().match(/^.*2° via$/) ||
    queues.name.toLocaleLowerCase().match(/^.*2ª via de boletos$/) ||
    queues.name.toLocaleLowerCase().match(/^.*2º via de boletos$/) ||
    queues.name.toLocaleLowerCase().match(/^.*2° via de boletos$/) ||
    queues.name.toLocaleLowerCase().match(/^.*2ª via de boleto$/) ||
    queues.name.toLocaleLowerCase().match(/^.*2º via de boleto$/) ||
    queues.name.toLocaleLowerCase().match(/^.*2° via de boleto$/)
  ) {

    let cpfcnpj
    cpfcnpj = selectedOption;
    cpfcnpj = cpfcnpj.replace(/\./g, '');
    cpfcnpj = cpfcnpj.replace('-', '')
    cpfcnpj = cpfcnpj.replace('/', '')
    cpfcnpj = cpfcnpj.replace(' ', '')
    cpfcnpj = cpfcnpj.replace(',', '')

    const numberCPFCNPJ = cpfcnpj

    //variaveis para a integração
    // SIPROV
    let siprovActive: any
    let siprovToken: any
    let siprovUserLogin: any
    let siprovPassLogin: any
    let siprovFoneContact: any
    let siprovInitialCurrentMonth: any
    let siprovFinalCurrentMonth: any

    // HINOVA
    let hinovaActive: any
    let hinovaToken: any
    let hinovaFoneContact: any
    let hinovaInitialCurrentMonth: any
    let hinovaFinalCurrentMonth: any

    // MIKWEB
    let mikwebActive: any
    let mikwebToken: any
    let mikwebFoneContact: any
    let mikwebInitialCurrentMonth: any
    let mikwebFinalCurrentMonth: any

    // ASAAS
    let asaasActive: any
    let asaasToken: any

    // BLING
    let blingActive: any
    let blingToken: any
    let blingInitialCurrentMonth: any
    let blingFinalCurrentMonth: any

    const enabledIntegration: any = await CheckIntegrations("enabledIntegration", ticket.companyId);
    enabledIntegrationActive = enabledIntegration.isActive

    if (enabledIntegrationActive) {
      const siprov: any = await CheckIntegrations("siprov", ticket.companyId);
      siprovActive = siprov.isActive
      siprovToken = siprov.token
      siprovUserLogin = siprov.userLogin
      siprovPassLogin = siprov.passLogin
      siprovFoneContact = siprov.foneContact
      siprovInitialCurrentMonth = siprov.initialCurrentMonth
      siprovFinalCurrentMonth = siprov.finalCurrentMonth

      const hinova: any = await CheckIntegrations("hinova", ticket.companyId);
      hinovaActive = hinova.isActive
      hinovaToken = hinova.token
      hinovaFoneContact = hinova.foneContact
      hinovaInitialCurrentMonth = hinova.initialCurrentMonth
      hinovaFinalCurrentMonth = hinova.finalCurrentMonth

      const mikweb: any = await CheckIntegrations("mikweb", ticket.companyId);
      mikwebActive = mikweb.isActive
      mikwebToken = mikweb.token
      mikwebFoneContact = mikweb.foneContact
      mikwebInitialCurrentMonth = mikweb.initialCurrentMonth
      mikwebFinalCurrentMonth = mikweb.finalCurrentMonth

      const asaas: any = await CheckIntegrations("asaas", ticket.companyId);
      asaasActive = asaas.isActive
      asaasToken = asaas.token

      const bling: any = await CheckIntegrations("bling", ticket.companyId);
      blingActive = bling.isActive
      blingToken = bling.token
      blingInitialCurrentMonth = bling.initialCurrentMonth
      blingFinalCurrentMonth = bling.finalCurrentMonth

      if (cpfcnpj.length === 11 || cpfcnpj.length === 14) {

        const isCPFCNPJ = validaCpfCnpj(numberCPFCNPJ)

        if (isCPFCNPJ) {

          if (hinovaActive) {

            const body = `*Asistente virtual:*\nAguarde! Estamos consultando na base de dados!`;
            try {
              await sleep(2000)
              await sendMessage(wbot, contact, ticket, body);
            } catch (error) {
              console.log('Não consegui enviar a mensagem!')
            }

            var data = JSON.stringify({
              "cpf_associado": `${numberCPFCNPJ}`,
              "data_vencimento_inicial": `${dataAtualFormatada(firstDayOfMonth(hinovaInitialCurrentMonth))}`,
              "data_vencimento_final": `${dataAtualFormatada(lastDayOfMonth(hinovaFinalCurrentMonth))}`
            });

            var config = {
              method: 'post',
              url: 'https://api.hinova.com.br/api/sga/v2/listar/boleto/periodo',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hinovaToken}`
              },
              data: data
            };

            axios(config)
              .then(async function (response) {

                var qtd = response.data.length

                for (var i = 0; i < qtd; i++) {

                  var qtdVeiculo = response.data[i].veiculo.length

                  for (var y = 0; y < qtdVeiculo; y++) {

                    let situacao_veiculo
                    let modelo_veiculo
                    let placa_veiculo
                    let situacao_boleto
                    let linhaDigitavel
                    let dtVencimento
                    let vlVencimento
                    let linkBoleto

                    linkBoleto = response.data[i].link_boleto
                    situacao_boleto = response.data[i].situacao_boleto
                    linhaDigitavel = response.data[i].linha_digitavel
                    dtVencimento = response.data[i].data_vencimento
                    vlVencimento = response.data[i].valor_boleto

                    situacao_veiculo = response.data[i].veiculo[y].situacao_veiculo
                    modelo_veiculo = response.data[i].veiculo[y].modelo
                    placa_veiculo = response.data[i].veiculo[y].placa

                    var curdate = new Date(dtVencimento)
                    const mesCorreto = curdate.getMonth() + 1
                    const ano = ('0' + curdate.getFullYear()).slice(-4)
                    const mes = ('0' + mesCorreto).slice(-2)
                    const dia = ('0' + curdate.getDate()).slice(-2)
                    const anoMesDia = `${dia}/${mes}/${ano}`

                    if (situacao_veiculo === 'INADIMPLENTE' || situacao_veiculo === 'PENDENTE') {
                      try {
                        const bodyBoleto = `Veículo: *${modelo_veiculo}*\nPlaca: *${placa_veiculo}*\nData Vencimento: *${anoMesDia}*\nValor Boleto: *${vlVencimento}*\nSituação: *${situacao_veiculo}*\n\n\n*SUA SITUAÇÃO ENCONTRA-SE ${situacao_veiculo.toUpperCase()}.*\n\n*FAVOR ENTRAR EM CONTATO COM O SETOR DE COBRANÇA*\n\nTELEFONE: *${hinovaFoneContact}*`
                        await sleep(2000)
                        await sendMessage(wbot, contact, ticket, bodyBoleto);
                      } catch (error) {
                        console.log('Não consegui enviar a mensagem!')
                      }
                    } else if (situacao_veiculo === 'INATIVO') {
                      try {
                        const bodyBoleto = `Veículo: *${modelo_veiculo}*\nPlaca: *${placa_veiculo}*\nData Vencimento: *${anoMesDia}*\nValor Boleto: *${vlVencimento}*\nSituação: *${situacao_veiculo}*\n\n\n*SUA SITUAÇÃO ENCONTRA-SE EM INATIVIDADE.*\n\n*FAVOR ENTRAR EM CONTATO COM O SETOR FINANCEIRO*\n\nTELEFONE: *${hinovaFoneContact}*`
                        await sleep(2000)
                        await sendMessage(wbot, contact, ticket, bodyBoleto);
                      } catch (error) {
                        console.log('Não consegui enviar a mensagem!')
                      }
                    } else if ((situacao_veiculo === 'ATIVO') && situacao_boleto === 'ABERTO') {
                      const bodyBoleto = `Veículo: *${modelo_veiculo}*\nPlaca: *${placa_veiculo}*\nData Vencimento: *${anoMesDia}*\nValor Boleto: *${vlVencimento}*\nSituação: *${situacao_veiculo}*\nLink do Boleto: ${linkBoleto}\n\nSegue abaixo a linha digitavel:`
                      try {
                        await sleep(2000)
                        await sendMessage(wbot, contact, ticket, bodyBoleto);
                        try {
                          await sleep(1000)
                          await sendMessage(wbot, contact, ticket, linhaDigitavel);
                        } catch (error) {
                          console.log('Não consegui enviar a mensagem!')
                        }

                        if (linkBoleto.length >= 5 && linkBoleto !== 'Não foi possível disponibilizar esta informação pois o boleto se encontra na situação 1') {
                          try {
                            await sendMessage(wbot, contact, ticket, 'Segue abaixo o Boleto em PDF:');
                            try {
                              const nomePDF = `${placa_veiculo}-${dia}-${mes}-${ano}.pdf`
                              await sendMessageLink(wbot, contact, ticket, linkBoleto, nomePDF)
                            } catch (error) {
                              await sendMessage(wbot, contact, ticket, 'Não consegui enviar o PDF, tente novamente!');
                            }
                          } catch (error) {
                            await sendMessage(wbot, contact, ticket, 'Não consegui enviar o PDF, tente novamente!');
                          }
                        }

                      } catch (error) {
                        console.log('Não consegui enviar a mensagem!')
                      }
                    } else if (situacao_veiculo === 'INATIVO' && situacao_boleto === 'ABERTO') {
                      try {
                        const bodyBoleto = `Veículo: *${modelo_veiculo}*\nPlaca: *${placa_veiculo}*\nData Vencimento: *${anoMesDia}*\nValor Boleto: *${vlVencimento}*\nSituação: *${situacao_veiculo}*\n\n\n*SUA SITUAÇÃO ENCONTRA-SE EM INATIVIDADE.*\n\n*FAVOR ENTRAR EM CONTATO COM O SETOR FINANCEIRO*\n\nTELEFONE: *${hinovaFoneContact}*`
                        await sleep(2000)
                        await sendMessage(wbot, contact, ticket, bodyBoleto);
                      } catch (error) {
                        console.log('Não consegui enviar a mensagem!')
                      }
                    }
                    else if (situacao_veiculo === 'ATIVO' && situacao_boleto === 'BAIXADO') {
                      try {
                        const bodyBoleto = `Veículo: *${modelo_veiculo}*\nPlaca: *${placa_veiculo}*\nData Vencimento: *${anoMesDia}*\nValor Boleto: *${vlVencimento}*\nSituação: *${situacao_veiculo}*\n\n\n*ESTE VEICULO NÃO POSSUI BOLETO EM ABERTO NESTE MÊS*`
                        await sleep(2000)
                        await sendMessage(wbot, contact, ticket, bodyBoleto);
                      } catch (error) {
                        console.log('Não consegui enviar a mensagem!')
                      }
                    }

                    // verificar se está certo
                    const bodyfinaliza = `¡Estamos terminando esta conversación! Si necesitas hablar con nosotros, contáctanos de nuevo!`
                    await sleep(2000)
                    await sendMessage(wbot, contact, ticket, bodyfinaliza);

                    const ticketUpdateAgent = {
                      ticketData: {
                        status: "closed",
                        userId: 1,
                        sendFarewellMessage: false,
                        amountUsedBotQueues: 0
                      },
                      ticketId: ticket.id,
                      companyId: ticket.companyId,
                      ratingId: undefined
                    };

                    await sleep(2000)
                    await UpdateTicketService(ticketUpdateAgent);

                  }
                }
              })
              .catch(async function (error) {
                // console.log('Deu erro: ', error);
                console.log(error.response.data)
                try {
                  const bodyBoleto = `NÃO CONSEGUIMOS LOCALIZAR NENHUM DADO.\n\n*FAVOR ENTRAR EM CONTATO COM O SETOR FINANCEIRO*\n\nTELEFONE: *${hinovaFoneContact}*`
                  await sleep(2000)
                  await sendMessage(wbot, contact, ticket, bodyBoleto);
                } catch (error) {
                  console.log('Não consegui enviar a mensagem!')
                }

              });

          }

          if (siprovActive) {

            const body = `*Asistente virtual:*\nAguarde! Estamos consultando na base de dados!`;
            try {
              await sleep(2000)
              await sendMessage(wbot, contact, ticket, body);
            } catch (error) {
              console.log('Não consegui enviar a mensagem!')
            }

            var data = JSON.stringify({});

            const token64 = Buffer.from(`${siprovUserLogin}:${siprovPassLogin}`, 'utf8').toString('base64')

            console.log('token64', token64);

            var config = {
              method: 'post',
              url: 'https://api.siprov.com.br/siprov-api/ext/autenticacao',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token64}`
              },
              data
            };

            axios(config)
              .then(async function (response) {
                let tokenSiprov = response.data.authorizationToken;

                // await UpdateIntegrationsService({
                //   integration: 'siprov',
                //   companyId: ticket.companyId,
                //   value: tokenSiprov
                // });

                var data1 = JSON.stringify({
                  matricula: `${numberCPFCNPJ}`
                });

                // regra para identificar ativo ou inativo
                var configAtivoInativo = {
                  method: 'post',
                  url: 'https://api.siprov.com.br/siprov-api/ext/beneficio/validacao',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenSiprov}`
                  },
                  data: data1
                };

                axios(configAtivoInativo)
                  .then(async function (resp) {

                    if (resp.data.status === 'ativo') {

                      var configGet = {
                        method: 'get',
                        url: `https://api.siprov.com.br/siprov-api/ext/financeiro/titulo/boleto`,
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${tokenSiprov}`
                        },
                        params: {
                          cpfCnpj: `${numberCPFCNPJ}`,
                          dataVencimentoInicial: `${dataAtualFormatada(firstDayOfMonth(siprovInitialCurrentMonth))}`,
                          dataVencimentoFinal: `${dataAtualFormatada(lastDayOfMonth(siprovFinalCurrentMonth))}`
                        },
                      };

                      axios(configGet)
                        .then(async function (resp) {

                          const resultText = JSON.stringify(resp.data)

                          if (resultText.length > 50) {
                            var qtd = resp.data.itens.length

                            for (var i = 0; i < qtd; i++) {

                              let nomeLoja
                              let nomePessoa
                              let celular
                              let tipo
                              let descricao
                              let dataEmissao
                              let dataVencimento
                              let valor
                              let linhaDigitavel
                              let urlPdf
                              let nomePDFsiprov

                              nomeLoja = resp.data.itens[i].nomeLoja
                              nomePessoa = resp.data.itens[i].nomePessoa
                              celular = resp.data.itens[i].celular
                              tipo = resp.data.itens[i].tipo
                              descricao = resp.data.itens[i].descricao
                              dataEmissao = resp.data.itens[i].dataEmissao
                              dataVencimento = resp.data.itens[i].dataVencimento
                              valor = resp.data.itens[i].valor
                              linhaDigitavel = resp.data.itens[i].linhaDigitavel
                              urlPdf = resp.data.itens[i].urlPdf

                              nomePDFsiprov = nomePessoa === undefined ? nomeLoja : nomePessoa

                              if (linhaDigitavel.length > 10) {
                                try {
                                  const bodyBoleto = `Nome: *${nomePDFsiprov}*\nDescrição: *${descricao}*\nData Vencimento: *${dataVencimento}*\nValor Boleto: *${valor}*\nLink do Boleto: ${urlPdf}\n\nSegue abaixo a linha digitavel:`
                                  await sleep(2000)
                                  await sendMessage(wbot, contact, ticket, bodyBoleto);
                                  try {
                                    await sleep(1000)
                                    await sendMessage(wbot, contact, ticket, linhaDigitavel);
                                  } catch (error) {
                                    console.log('Não consegui enviar a mensagem!')
                                  }
                                } catch (err) { }

                                if (urlPdf.length > 10) {
                                  try {
                                    await sendMessage(wbot, contact, ticket, 'Segue abaixo o Boleto em PDF:');
                                    try {
                                      const nomePDF = `${nomePDFsiprov}-${dataVencimento.replaceAll('/', '-')}.pdf`
                                      await sendMessageLink(wbot, contact, ticket, urlPdf, nomePDF)
                                    } catch (error) {
                                      await sendMessage(wbot, contact, ticket, 'Não consegui enviar o PDF, tente novamente!');
                                    }
                                  } catch (error) {
                                    await sendMessage(wbot, contact, ticket, 'Não consegui enviar o PDF, tente novamente!');
                                  }
                                }
                              }
                            }
                            const bodyfinaliza = `¡Estamos terminando esta conversación! Si necesitas hablar con nosotros, contáctanos de nuevo!`
                            await sleep(2000)
                            await sendMessage(wbot, contact, ticket, bodyfinaliza);

                            const ticketUpdateAgent = {
                              ticketData: {
                                status: "closed",
                                userId: 1,
                                sendFarewellMessage: false,
                                amountUsedBotQueues: 0
                              },
                              ticketId: ticket.id,
                              companyId: ticket.companyId,
                              ratingId: undefined
                            };

                            await sleep(2000)
                            await UpdateTicketService(ticketUpdateAgent);

                          } else {
                            try {
                              const bodyBoleto = `*Asistente virtual:*\nNão foi localizado nenhum boleto em aberto no mês vigente.\n\nSe deseja receber o boleto do próximo mês, aguarde um de nossos atendentes.`
                              await sleep(2000)
                              await sendMessage(wbot, contact, ticket, bodyBoleto);
                            } catch (error) {
                              console.log('Não consegui enviar a mensagem!')
                            }
                          }
                        })
                        .catch(async function (error) {
                          console.log('error1', error.response.data)
                          try {
                            const bodyBoleto = `*Asistente virtual:*\nNão foi localizado nenhum boleto em aberto no mês vigente.\n\nSe deseja receber o boleto do próximo mês, aguarde um de nossos atendentes.`
                            await sleep(2000)
                            await sendMessage(wbot, contact, ticket, bodyBoleto);
                          } catch (error) {
                            console.log('Não consegui enviar a mensagem!')
                          }
                        })
                    } else if (resp.data.status === 'inativo') {
                      try {
                        const bodyBoleto = `*Asistente virtual:*\nSua situação encontra-se em *Inadimplência*\n\n_Aguarde um momento para falar com um de nossos atendentes!_`
                        await sleep(2000)
                        await sendMessage(wbot, contact, ticket, bodyBoleto);
                      } catch (error) {
                        console.log('Não consegui enviar a mensagem!')
                      }
                    }
                  })
                  .catch(async function (error) {
                    console.log('error2', error.response.data)
                    try {
                      const bodyBoleto = `*Asistente virtual:*\nNão foi localizado nenhum boleto em aberto para você.\n\n_Aguarde um momento para falar com um de nossos atendentes!_`
                      await sleep(2000)
                      await sendMessage(wbot, contact, ticket, bodyBoleto);
                    } catch (error) {
                      console.log('Não consegui enviar a mensagem!')
                    }
                  })
              })
              .catch(async function (error) {
                console.log('error3', error.response.data)
                try {
                  const bodyBoleto = `*Asistente virtual:*\nNão foi localizado nenhum boleto em aberto para você.\n\n_Aguarde um momento para falar com um de nossos atendentes!_`
                  await sleep(2000)
                  await sendMessage(wbot, contact, ticket, bodyBoleto);
                } catch (error) {
                  console.log('Não consegui enviar a mensagem!')
                }
              })
          }

          if (mikwebActive) {

            const body = `*Asistente virtual:*\nAguarde! Estamos consultando na base de dados!`;
            try {
              await sleep(2000)
              await sendMessage(wbot, contact, ticket, body);
            } catch (error) {
              console.log('Não consegui enviar a mensagem!')
            }

            var data = JSON.stringify({});

            var config = {
              method: 'GET',
              url: `https://api.mikweb.com.br/v1/admin/customers?search=${numberCPFCNPJ}`,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mikwebToken}`
              },
              data: data
            };

            axios(config)
              .then(async function (response) {

                // console.log('response.data.customers[0]', response.data.customers[0])

                let clientId
                let full_name
                let zip_code
                let street
                let number
                let neighborhood
                let state
                let city
                let complement
                let status
                let planName
                let planValue
                let customer_group

                clientId = response.data.customers[0].id;
                full_name = response.data.customers[0].full_name;
                zip_code = response.data.customers[0].zip_code;
                street = response.data.customers[0].street;
                number = response.data.customers[0].number;
                neighborhood = response.data.customers[0].neighborhood;
                state = response.data.customers[0].state;
                city = response.data.customers[0].city;
                complement = response.data.customers[0].complement;
                status = response.data.customers[0].status;
                planName = response.data.customers[0].plan.name;
                planValue = response.data.customers[0].plan.value;
                customer_group = response.data.customers[0].customer_group.name;

                if (status === 'Ativo') {

                  let dataVencimentoInicial
                  let dataVencimentoFinal

                  const dateInitial = `${dataAtualFormatada(firstDayOfMonth(mikwebInitialCurrentMonth))}`
                  const dateFinal = `${dataAtualFormatada(lastDayOfMonth(mikwebFinalCurrentMonth))}`

                  dataVencimentoInicial = replaceAll(dateInitial, '/', '-')
                  dataVencimentoFinal = replaceAll(dateFinal, '/', '-')

                  // verifica primeiro registros em abertos
                  var config1 = {
                    method: 'GET',
                    url: `https://api.mikweb.com.br/v1/admin/billings?customer_id=${clientId}&situation_id=2`,
                    headers: {
                      'Authorization': `Bearer ${mikwebToken}`
                    }
                  };

                  axios(config1)
                    .then(async function (response) {
                      // console.log('response.data.billings', response.data.billings)
                      let qtd = response.data.billings.length;
                      // console.log('qtd', qtd)

                      for (var i = 0; i < qtd; i++) {

                        let boletoValue
                        let boletoValuePaid
                        let boletoDatePayment
                        let boletoSituation
                        let boletoReference
                        let boletoDueDay
                        let boletoSituationName
                        let boletoIntegrationLink
                        let boletoDigitableLine

                        boletoValue = response.data.billings[i].value;
                        boletoValuePaid = response.data.billings[i].value_paid;
                        boletoDatePayment = response.data.billings[i].date_payment;
                        boletoSituation = response.data.billings[i].situation_id;
                        boletoReference = response.data.billings[i].reference;
                        boletoDueDay = response.data.billings[i].due_day;
                        boletoSituationName = response.data.billings[i].situation_name;
                        boletoIntegrationLink = response.data.billings[i].integration_link;
                        boletoDigitableLine = response.data.billings[i].digitable_line;

                        if (boletoSituation === 1 || boletoSituation === 2 || boletoSituation === 4) {
                          if (boletoDatePayment === null) {
                            try {

                              const linhaDigitavel = boletoDigitableLine === null ? '' : '\n\nSegue abaixo a linha digitavel:'

                              const bodyBoleto = `Nome: *${full_name.trim()}*\nDescrição: *${boletoReference}*\nData Vencimento: *${formatDate(boletoDueDay)}*\nValor Boleto: *${boletoValue}*\nLink do Boleto: ${boletoIntegrationLink}${linhaDigitavel}`
                              await sleep(2000)
                              await sendMessage(wbot, contact, ticket, bodyBoleto);
                              if (boletoDigitableLine !== null) {
                                try {
                                  await sleep(1000)
                                  await sendMessage(wbot, contact, ticket, boletoDigitableLine);
                                } catch (error) {
                                  console.log('Não consegui enviar a mensagem!')
                                }
                              }
                            } catch (err) { }

                            if (boletoIntegrationLink !== null && boletoDatePayment === null) {
                              try {
                                await sendMessage(wbot, contact, ticket, 'Segue abaixo o Boleto em PDF:');
                                try {
                                  const nomePDF = `${boletoDueDay.replaceAll('/', '-')}-${full_name.trim()}.pdf`
                                  await sendMessageLink(wbot, contact, ticket, boletoIntegrationLink, nomePDF)
                                } catch (error) {
                                  await sendMessage(wbot, contact, ticket, 'Não consegui enviar o PDF, tente novamente!');
                                }
                              } catch (error) {
                                await sendMessage(wbot, contact, ticket, 'Não consegui enviar o PDF, tente novamente!');
                              }
                            }
                          }
                        } else if (boletoSituation === 3 && boletoDatePayment !== null) {
                          try {
                            const bodyBoleto = `*Asistente virtual:*\nNão foi localizado nenhum boleto em aberto no mês vigente.\n\nSe deseja receber o boleto do próximo mês, aguarde um de nossos atendentes.`
                            await sleep(2000)
                            await sendMessage(wbot, contact, ticket, bodyBoleto);
                          } catch (error) {
                            console.log('Não consegui enviar a mensagem!')
                          }
                        }

                      }

                    })
                    .catch(function (error) {
                      console.log(error);
                    });

                }
                else if (status === 'Desativado') {
                  try {
                    const bodyBoleto = `*Asistente virtual:*\nSua situação encontra-se em *Inadimplência*\n\n_Aguarde um momento para falar com um de nossos atendentes!_`
                    await sleep(2000)
                    await sendMessage(wbot, contact, ticket, bodyBoleto);
                  } catch (error) {
                    console.log('Não consegui enviar a mensagem!')
                  }
                }

              })
              .catch(async function (error) {
                console.log('error3', error.response.data)
                try {
                  const bodyBoleto = `*Asistente virtual:*\nNão foi localizado nenhum boleto em aberto para você.\n\n_Aguarde um momento para falar com um de nossos atendentes!_`
                  await sleep(2000)
                  await sendMessage(wbot, contact, ticket, bodyBoleto);
                } catch (error) {
                  console.log('Não consegui enviar a mensagem!')
                }
              })
          }

          if (asaasActive) {
            if (isNumeric(numberCPFCNPJ) === true) {
              if (cpfcnpj.length > 2) {

                const isCPFCNPJ = validaCpfCnpj(numberCPFCNPJ)
                if (isCPFCNPJ) {
                  const body = `Aguarde! Estamos consultando na base de dados!`;
                  try {
                    await sleep(2000)
                    await sendMessage(wbot, contact, ticket, body);
                  } catch (error) { }

                  var optionsc = {
                    method: 'GET',
                    url: 'https://www.asaas.com/api/v3/customers',
                    params: { cpfCnpj: numberCPFCNPJ },
                    headers: {
                      'Content-Type': 'application/json',
                      access_token: asaasToken
                    }
                  };

                  axios.request(optionsc).then(async function (response) {
                    let nome;
                    let id_cliente;
                    let totalCount;

                    nome = response?.data?.data[0]?.name;
                    id_cliente = response?.data?.data[0]?.id;
                    totalCount = response?.data?.totalCount;

                    if (totalCount === 0) {
                      const body = `Cadastro não localizado! *CPF/CNPJ* incorreto ou inválido. Tenta novamente!`;
                      await sleep(2000)
                      await sendMessage(wbot, contact, ticket, body);
                    } else {

                      const body = `Localizei seu Cadastro! \n*${nome}* só mais um instante por favor!`;
                      await sleep(2000)
                      await sendMessage(wbot, contact, ticket, body);

                      var optionsListpaymentOVERDUE = {
                        method: 'GET',
                        url: 'https://www.asaas.com/api/v3/payments',
                        params: { customer: id_cliente, status: 'OVERDUE' },
                        headers: {
                          'Content-Type': 'application/json',
                          access_token: asaasToken
                        }
                      };

                      axios.request(optionsListpaymentOVERDUE).then(async function (response) {
                        let totalCount_overdue;
                        totalCount_overdue = response?.data?.totalCount;

                        if (totalCount_overdue === 0) {

                          const body = `Você não tem nenhuma fatura vencida! \nVou te enviar a proxima fatura. Por favor aguarde!`;
                          await sleep(2000)
                          await sendMessage(wbot, contact, ticket, body);

                          var optionsPENDING = {
                            method: 'GET',
                            url: 'https://www.asaas.com/api/v3/payments',
                            params: { customer: id_cliente, status: 'PENDING' },
                            headers: {
                              'Content-Type': 'application/json',
                              access_token: asaasToken
                            }
                          };

                          axios.request(optionsPENDING).then(async function (response) {

                            const ordenado = response?.data?.data.sort(sortfunction);

                            let id_payment_pending;
                            let value_pending;
                            let description_pending;
                            let invoiceUrl_pending;
                            let dueDate_pending;
                            let invoiceNumber_pending;
                            let totalCount_pending;
                            let value_pending_corrigida;
                            let dueDate_pending_corrigida;
                            let bankSlipUrl;

                            id_payment_pending = ordenado[0]?.id;
                            value_pending = ordenado[0]?.value;
                            description_pending = ordenado[0]?.description;
                            invoiceUrl_pending = ordenado[0]?.invoiceUrl;
                            dueDate_pending = ordenado[0]?.dueDate;
                            invoiceNumber_pending = ordenado[0]?.invoiceNumber;
                            totalCount_pending = response?.data?.totalCount;
                            bankSlipUrl = response?.data?.data[0]?.bankSlipUrl;

                            dueDate_pending_corrigida = dueDate_pending?.split('-')?.reverse()?.join('/');
                            value_pending_corrigida = value_pending.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

                            const bodyBoleto = `Segue a segunda-via da sua Fatura!\n\n*Fatura:* ${invoiceNumber_pending}\n*Nome:* ${nome}\n*Valor:* $ ${value_pending_corrigida}\n*Data Vencimento:* ${dueDate_pending_corrigida}\n*Descrição:* ${description_pending}\n*Link:* ${invoiceUrl_pending}`
                            await sleep(2000)
                            await sendMessage(wbot, contact, ticket, bodyBoleto);

                            //GET DADOS PIX
                            var optionsGetPIX = {
                              method: 'GET',
                              url: `https://www.asaas.com/api/v3/payments/${id_payment_pending}/pixQrCode`,
                              headers: {
                                'Content-Type': 'application/json',
                                access_token: asaasToken
                              }
                            };

                            axios.request(optionsGetPIX).then(async function (response) {
                              let success;
                              let payload;

                              success = response?.data?.success;
                              payload = response?.data?.payload;

                              if (success === true) {
                                const bodyPixCP = `Este é o *PIX Copia e Cola*`;
                                await sleep(2000)
                                await sendMessage(wbot, contact, ticket, bodyPixCP);
                                await sleep(2000)
                                await sendMessage(wbot, contact, ticket, payload);

                                let linkBoleto = `https://chart.googleapis.com/chart?cht=qr&chs=500x500&chld=L|0&chl=${payload}`
                                const nomePDF = ``
                                await sleep(2000)
                                await sendMessageImage(wbot, contact, ticket, linkBoleto, nomePDF)

                                var optionsBoletopend = {
                                  method: 'GET',
                                  url: `https://www.asaas.com/api/v3/payments/${id_payment_pending}/identificationField`,
                                  headers: {
                                    'Content-Type': 'application/json',
                                    access_token: asaasToken
                                  }
                                };

                                axios.request(optionsBoletopend).then(async function (response) {
                                  let codigo_barras
                                  codigo_barras = response.data.identificationField;

                                  if (bankSlipUrl?.length > 10) {
                                    const body = `Este é o *PDF do boleto*!`;
                                    await sleep(2000)
                                    await sendMessage(wbot, contact, ticket, body);

                                    const nomePDF = `${invoiceNumber_pending}-${dueDate_pending_corrigida.replaceAll('/', '-')}.pdf`
                                    await sleep(2000)
                                    await sendMessageLink(wbot, contact, ticket, bankSlipUrl, nomePDF)
                                  }

                                  if (response.data?.errors !== 'invalid_action') {

                                    const bodycodigo = `Este é o *Código de Barras*!`;
                                    await sleep(2000)
                                    await sendMessage(wbot, contact, ticket, bodycodigo);

                                    await sleep(2000)
                                    await sendMessage(wbot, contact, ticket, codigo_barras);

                                    const bodyfinaliza = `¡Estamos terminando esta conversación! Si necesitas hablar con nosotros, contáctanos de nuevo!`
                                    await sleep(2000)
                                    await sendMessage(wbot, contact, ticket, bodyfinaliza);

                                    const ticketUpdateAgent = {
                                      ticketData: {
                                        status: "closed",
                                        userId: 1,
                                        sendFarewellMessage: false,
                                        amountUsedBotQueues: 0
                                      },
                                      ticketId: ticket.id,
                                      companyId: ticket.companyId,
                                      ratingId: undefined
                                    };

                                    await sleep(2000)
                                    await UpdateTicketService(ticketUpdateAgent);
                                  } else {

                                    const bodyfinaliza = `¡Estamos terminando esta conversación! Si necesitas hablar con nosotros, contáctanos de nuevo!`
                                    await sleep(2000)
                                    await sendMessage(wbot, contact, ticket, bodyfinaliza);

                                    const ticketUpdateAgent = {
                                      ticketData: {
                                        status: "closed",
                                        userId: 1,
                                        sendFarewellMessage: false,
                                        amountUsedBotQueues: 0
                                      },
                                      ticketId: ticket.id,
                                      companyId: ticket.companyId,
                                      ratingId: undefined
                                    };

                                    await sleep(2000)
                                    await UpdateTicketService(ticketUpdateAgent);
                                  }

                                }).catch(async function (error) {
                                  const bodyfinaliza = `¡Estamos terminando esta conversación! Si necesitas hablar con nosotros, contáctanos de nuevo!`
                                  await sleep(2000)
                                  await sendMessage(wbot, contact, ticket, bodyfinaliza);

                                  const ticketUpdateAgent = {
                                    ticketData: {
                                      status: "closed",
                                      userId: 1,
                                      sendFarewellMessage: false,
                                      amountUsedBotQueues: 0
                                    },
                                    ticketId: ticket.id,
                                    companyId: ticket.companyId,
                                    ratingId: undefined
                                  };

                                  await sleep(2000)
                                  await UpdateTicketService(ticketUpdateAgent);
                                });
                              }

                            }).catch(async function (error) {
                              const body = `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`;
                              await sleep(2000)
                              await sendMessage(wbot, contact, ticket, body);
                            });

                            /*
                            const bodyfinaliza = `¡Estamos terminando esta conversación! Si necesitas hablar con nosotros, contáctanos de nuevo!`
                            await sleep(2000)
                            await sendMessage(wbot, contact, ticket, bodyfinaliza);
                              const ticketUpdateAgent = {
                                ticketData: {
                                  status: "closed",
                                  userId: 1,
                                  sendFarewellMessage: false,
                                  amountUsedBotQueues: 0
                                },
                                ticketId: ticket.id,
                                ratingId: undefined
                              };
                              await sleep(2000)
                              await UpdateTicketService(ticketUpdateAgent);
                            */

                          }).catch(async function (error) {
                            const body = `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`;
                            await sleep(2000)
                            await sendMessage(wbot, contact, ticket, body);
                          });
                        } else {
                          let id_payment_overdue;
                          let value_overdue;
                          let description_overdue;
                          let invoiceUrl_overdue;
                          let dueDate_overdue;
                          let invoiceNumber_overdue;
                          let bankSlipUrl;
                          let value_overdue_corrigida;
                          let dueDate_overdue_corrigida;

                          id_payment_overdue = response?.data?.data[0]?.id;
                          value_overdue = response?.data?.data[0]?.value;
                          description_overdue = response?.data?.data[0]?.description;
                          invoiceUrl_overdue = response?.data?.data[0]?.invoiceUrl;
                          dueDate_overdue = response?.data?.data[0]?.dueDate;
                          invoiceNumber_overdue = response?.data?.data[0]?.invoiceNumber;
                          bankSlipUrl = response?.data?.data[0]?.bankSlipUrl;
                          dueDate_overdue_corrigida = dueDate_overdue?.split('-')?.reverse()?.join('/');
                          value_overdue_corrigida = value_overdue.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

                          const body = `Você tem *${totalCount_overdue}* fatura(s) vencida(s)! \nVou te enviar. Por favor aguarde!`;
                          await sleep(2000)
                          await sendMessage(wbot, contact, ticket, body);

                          const bodyBoleto = `Segue a segunda-via da sua Fatura!\n\n*Fatura:* ${invoiceNumber_overdue}\n*Nome:* ${nome}\n*Valor:* $ ${value_overdue_corrigida}\n*Data Vencimento:* ${dueDate_overdue_corrigida}\n*Descrição:* ${description_overdue}\n*Link:* ${invoiceUrl_overdue}`
                          await sleep(2000)
                          await sendMessage(wbot, contact, ticket, bodyBoleto);

                          //GET DADOS PIX
                          var optionsGetPIX = {
                            method: 'GET',
                            url: `https://www.asaas.com/api/v3/payments/${id_payment_overdue}/pixQrCode`,
                            headers: {
                              'Content-Type': 'application/json',
                              access_token: asaasToken
                            }
                          };

                          axios.request(optionsGetPIX).then(async function (response) {
                            let success;
                            let payload;

                            success = response?.data?.success;
                            payload = response?.data?.payload;

                            if (success === true) {
                              const bodyPixCP = `Este é o *PIX Copia e Cola*!`;
                              await sleep(2000)
                              await sendMessage(wbot, contact, ticket, bodyPixCP);

                              await sleep(2000)
                              await sendMessage(wbot, contact, ticket, payload);

                              let linkBoleto = `https://chart.googleapis.com/chart?cht=qr&chs=500x500&chld=L|0&chl=${payload}`
                              const nomePDF = ``
                              await sleep(2000)
                              await sendMessageImage(wbot, contact, ticket, linkBoleto, nomePDF)

                              var optionsBoleto = {
                                method: 'GET',
                                url: `https://www.asaas.com/api/v3/payments/${id_payment_overdue}/identificationField`,
                                headers: {
                                  'Content-Type': 'application/json',
                                  access_token: asaasToken
                                }
                              };

                              axios.request(optionsBoleto).then(async function (response) {
                                let codigo_barras
                                codigo_barras = response.data.identificationField;

                                if (bankSlipUrl?.length > 10) {
                                  const body = `Este é o *PDF do boleto*!`;
                                  await sleep(2000)
                                  await sendMessage(wbot, contact, ticket, body);

                                  const nomePDF = `${invoiceNumber_overdue}-${dueDate_overdue_corrigida.replaceAll('/', '-')}.pdf`
                                  await sleep(2000)
                                  await sendMessageLink(wbot, contact, ticket, bankSlipUrl, nomePDF)
                                }

                                if (response.data?.errors?.code !== 'invalid_action') {
                                  const bodycodigo = `Este é o *Código de Barras*!`;
                                  await sleep(2000)
                                  await sendMessage(wbot, contact, ticket, bodycodigo);

                                  await sleep(2000)
                                  await sendMessage(wbot, contact, ticket, codigo_barras);

                                  const bodyfinaliza = `¡Estamos terminando esta conversación! Si necesitas hablar con nosotros, contáctanos de nuevo!`
                                  await sleep(2000)
                                  await sendMessage(wbot, contact, ticket, bodyfinaliza);

                                  const ticketUpdateAgent = {
                                    ticketData: {
                                      status: "closed",
                                      userId: 1,
                                      sendFarewellMessage: false,
                                      amountUsedBotQueues: 0
                                    },
                                    ticketId: ticket.id,
                                    companyId: ticket.companyId,
                                    ratingId: undefined
                                  };

                                  await sleep(2000)
                                  await UpdateTicketService(ticketUpdateAgent);
                                } else {
                                  const bodyfinaliza = `¡Estamos terminando esta conversación! Si necesitas hablar con nosotros, contáctanos de nuevo!`
                                  await sleep(2000)
                                  await sendMessage(wbot, contact, ticket, bodyfinaliza);

                                  const ticketUpdateAgent = {
                                    ticketData: {
                                      status: "closed",
                                      userId: 1,
                                      sendFarewellMessage: false,
                                      amountUsedBotQueues: 0
                                    },
                                    ticketId: ticket.id,
                                    companyId: ticket.companyId,
                                    ratingId: undefined
                                  };

                                  await sleep(2000)
                                  await UpdateTicketService(ticketUpdateAgent);
                                }

                              }).catch(function (error) {
                                //console.error(error);
                              });

                            }
                          }).catch(function (error) { });
                        }

                      }).catch(async function (error) {
                        const body = `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`;
                        await sleep(2000)
                        await sendMessage(wbot, contact, ticket, body);
                      });
                    }
                  }).catch(async function (error) {
                    const body = `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`;
                    await sleep(2000)
                    await sendMessage(wbot, contact, ticket, body);
                  });
                }

              }
            }
          }

          if (blingActive) {

            const body = `*Asistente virtual:*\nAguarde! Estamos consultando na base de dados!`;
            try {
              await sleep(2000)
              await sendMessage(wbot, contact, ticket, body);
            } catch (error) {
              console.log('Não consegui enviar a mensagem!')
            }

            // const firstDay = dataAtualFormatada(firstDayOfMonth(blingInitialCurrentMonth))
            // const lastDay = dataAtualFormatada(lastDayOfMonth(blingFinalCurrentMonth))

            var config1 = {
              method: 'get',
              url: `https://bling.com.br/Api/v2/contasreceber/json?apikey=5d439ce33cfab53ad4b1dd20e93f82409768ee7e5b7d6429ac3b20cc19e77f2b16941040&filters=cnpj[${numberCPFCNPJ}];situacao[aberto]`,
              headers: {}
            };

            axios(config1)
              .then(async function (response) {

                const resultText = JSON.stringify(response?.data?.retorno)

                if (resultText.length < 110) {

                  const error = response?.data?.retorno?.erros[0]?.erro?.msg;

                  if (error && error === 'A informacao desejada nao foi encontrada') {
                    try {
                      const bodyBoleto = `*Opss!!!!*\nOcorreu um erro! Digite *#* e fale com um *Atendente*!`
                      await sleep(2000)
                      await sendMessage(wbot, contact, ticket, bodyBoleto);
                      return
                    } catch (error) {
                      console.log('Não consegui enviar a mensagem!')
                    }
                  }
                }

                var qtd = response?.data?.retorno?.contasreceber?.length;

                for (var i = 0; i < qtd; i++) {

                  let situacao;
                  let dtVencimento;
                  let vlVencimento;
                  let linkBoleto;
                  let historico;
                  let cliente;
                  let idContato;
                  let nroDocumento;
                  let dtVencimentoCorrigido;
                  let dataEmissao;
                  let dataEmissaoCorrigido;

                  let linkNFSe;
                  let numeroNFSe;

                  situacao = response.data.retorno.contasreceber[i].contaReceber.situacao
                  dtVencimento = response.data.retorno.contasreceber[i].contaReceber.vencimento
                  vlVencimento = response.data.retorno.contasreceber[i].contaReceber.valor
                  linkBoleto = response.data.retorno.contasreceber[i].contaReceber.linkBoleto
                  historico = response.data.retorno.contasreceber[i].contaReceber.historico
                  cliente = response.data.retorno.contasreceber[i].contaReceber.cliente.nome
                  idContato = response.data.retorno.contasreceber[i].contaReceber.cliente.idContato
                  nroDocumento = response.data.retorno.contasreceber[i].contaReceber.nroDocumento
                  dataEmissao = response.data.retorno.contasreceber[i].contaReceber.dataEmissao

                  dtVencimentoCorrigido = dtVencimento?.split('-')?.reverse()?.join('/');
                  dataEmissaoCorrigido = dataEmissao?.split('-')?.reverse()?.join('/');

                  var config2 = {
                    method: 'get',
                    url: `https://www.bling.com.br/Api/v2/notasservico/json/?apikey=5d439ce33cfab53ad4b1dd20e93f82409768ee7e5b7d6429ac3b20cc19e77f2b16941040&filters=dataEmissao[${dataEmissaoCorrigido} TO ${dataEmissaoCorrigido}];situacao[2];idContato[${idContato}]`,
                    headers: {}
                  };

                  axios(config2)
                    .then(async function (response) {

                      var qtdNFSe = response?.data?.retorno?.notasservico?.length;

                      for (var y = 0; y < qtdNFSe; y++) {

                        linkNFSe = response.data.retorno.notasservico[y].notaservico.linkNFSe
                        numeroNFSe = response.data.retorno.notasservico[y].notaservico.numeroNFSe

                        if (situacao === 'aberto') {
                          try {

                            if (linkNFSe.length > 10) {
                              const bodyBoleto = `Segue a segunda-via da sua Fatura!\n\n*Fatura:* ${nroDocumento}\n*Número NFSe:* ${numeroNFSe}\n*Nome:* ${cliente}\n*Valor:* $ ${vlVencimento}\n*Data Vencimento:* ${dtVencimentoCorrigido}\n*Descrição:* ${historico}\n*Link Boleto:* ${linkBoleto}\n\n*Link NFSe:* ${linkNFSe}`
                              await sleep(2000)
                              await sendMessage(wbot, contact, ticket, bodyBoleto);
                            } else {
                              const bodyBoleto = `Segue a segunda-via da sua Fatura!\n\n*Fatura:* ${nroDocumento}\n*Nome:* ${cliente}\n*Valor:* $ ${vlVencimento}\n*Data Vencimento:* ${dtVencimentoCorrigido}\n*Descrição:* ${historico}\n*Link Boleto:* ${linkBoleto}`
                              await sleep(2000)
                              await sendMessage(wbot, contact, ticket, bodyBoleto);
                            }

                          } catch (error) {
                            console.log('Não consegui enviar a mensagem!')
                          }
                        }
                      }
                    })
                }
                await sleep(4000)
                await sendMsgAndCloseTicket(wbot, contact, ticket);
              })
              .catch(function (error) {
                console.log(error);
              });
          }

        } else {
          const body = `*Asistente virtual:*\n\nCadastro não localizado! *CPF/CNPJ* incorreto ou inválido. Tenta novamente!`;
          try {
            await sleep(2000)
            await sendMessage(wbot, contact, ticket, body);
          } catch (error) {
            console.log('Não consegui enviar a mensagem!')
          }
        }

        if (selectedOption === "finalizar") {
          const ticketUpdateAgent = {
            ticketData: {
              status: "closed",
              sendFarewellMessage: false,
              amountUsedBotQueues: 0
            },
            ticketId: ticket.id,
            companyId: ticket.companyId,
            ratingId: undefined
          };
          await UpdateTicketService(ticketUpdateAgent);
        }

      }
    }

  }

  if (selectedOption === "#") {
    const backTo = await backToMainMenu(wbot, contact, ticket);
    return backTo;
  }

  if (!getStageBot) {

    // Serviço p/ escolher consultor aleatório para o ticket, ao selecionar fila.
    // let randomUserId;

    // try {
    //   const userQueue = await ListUserQueueServices(queueId);

    //   if (userQueue.userId > -1) {
    //     randomUserId = userQueue.userId;
    //   }

    // } catch (error) {
    //   console.error(error);
    // }

    // // Ativar ou desativar opção de escolher consultor aleatório.
    // let settingsUserRandom = await Setting.findOne({
    //   where: {
    //     key: "userRandom",
    //     companyId: ticket.companyId
    //   }
    // });

    // console.log('randomUserId', randomUserId)

    // if (settingsUserRandom?.value === "enabled") {
    //   await UpdateTicketService({
    //     ticketData: { userId: randomUserId },
    //     ticketId: ticket.id,
    //     companyId: ticket.companyId,
    //     ratingId: undefined
    //   });
    // }

    const queue = await ShowQueueService(queueId, ticket.companyId);

    const selectedOptions =
      msg?.message?.buttonsResponseMessage?.selectedButtonId ||
      msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
      getBodyMessage(msg);

    const choosenQueue = queue.chatbots[+selectedOptions - 1];

    if (!choosenQueue?.greetingMessage) {
      await DeleteDialogChatBotsServices(contact.id);
      return;
    } // nao tem mensagem de boas vindas

    if (choosenQueue) {
      if (choosenQueue.isAgent) {
        try {
          const getUserByName = await User.findOne({
            where: {
              name: choosenQueue.name
            }
          });
          const ticketUpdateAgent = {
            ticketData: {
              userId: getUserByName.id,
              status: "open"
            },
            ticketId: ticket.id
          };
          await UpdateTicketService(
            {
              ticketData: {
                ...ticketUpdateAgent.ticketData,
              },
              ticketId: ticketUpdateAgent.ticketId,
              companyId: ticket.companyId,
              ratingId: undefined
            }

          );
        } catch (error) {
          await deleteAndCreateDialogStage(contact, choosenQueue.id, ticket);
        }
      }
      await deleteAndCreateDialogStage(contact, choosenQueue.id, ticket);

      const send = await sendDialog(choosenQueue, wbot, contact, ticket);
      return send;
    }

  }

  if (getStageBot) {
    const selected = isNumeric(selectedOption) ? selectedOption : 1;
    const bots = await ShowChatBotServices(getStageBot.chatbotId);

    const choosenQueue = bots.options[+selected - 1]
      ? bots.options[+selected - 1]
      : bots.options[0];

    console.log("choosenQueue", choosenQueue?.name);

    if (!choosenQueue.greetingMessage) {
      await DeleteDialogChatBotsServices(contact.id);
      return;
    } // nao tem mensagem de boas vindas

    if (choosenQueue) {
      if (choosenQueue.isAgent) {
        const getUserByName = await User.findOne({
          where: {
            name: choosenQueue.name
          }
        });
        const ticketUpdateAgent = {
          ticketData: {
            userId: getUserByName.id,
            status: "open"
          },
          ticketId: ticket.id
        };
        await UpdateTicketService(
          {
            ticketData: {
              ...ticketUpdateAgent.ticketData,
            },
            ticketId: ticketUpdateAgent.ticketId,
            companyId: ticket.companyId,
            ratingId: undefined
          }

        );
      }
      await deleteAndCreateDialogStage(contact, choosenQueue.id, ticket);
      const send = await sendDialog(choosenQueue, wbot, contact, ticket);
      return send;
    }
  }

};

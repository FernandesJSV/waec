import makeWASocket, {
  AuthenticationState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  WASocket,
  MessageRetryMap,
  delay,
  jidNormalizedUser
} from "@adiwajshing/baileys";

import { FindOptions } from "sequelize/types";
import { Boom } from "@hapi/boom";
import MAIN_LOGGER from "@adiwajshing/baileys/lib/Utils/logger";
import Whatsapp from "../models/Whatsapp";
import Message from "../models/Message";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { Store } from "./store";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import authState from "../helpers/authState";

const msgRetryCounterMap: MessageRetryMap = {};

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "silent";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const sessions: Session[] = [];

const retriesQrCodeMap = new Map<number, number>();

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        sessions[sessionIndex].logout();
        sessions[sessionIndex].ws.close();
      }

      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const restartWbot = async (
  companyId: number,
  session?: any
): Promise<void> => {
  try {
    const options: FindOptions = {
      where: {
        companyId,
      },
      attributes: ["id"],
    }

    const whatsapp = await Whatsapp.findAll(options);

    whatsapp.map(async c => {
      const sessionIndex = sessions.findIndex(s => s.id === c.id);
      if (sessionIndex !== -1) {
        sessions[sessionIndex].ws.close();
      }

    });

  } catch (err) {
    logger.error(err);
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        const io = getIO();

        const { id, name, provider } = whatsapp;
        const { version, isLatest } = await fetchLatestBaileysVersion();

        logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        logger.info(`isMultidevice: ${provider}`);
        logger.info(`Starting session ${name}`);
        let retriesQrCode = 0;

        let wsocket: Session = null;
        const store = makeInMemoryStore({
          logger: loggerBaileys
        });

        const { state, saveState } = await authState(whatsapp);

        wsocket = makeWASocket({
          logger: loggerBaileys,
          printQRInTerminal: true,
          browser: [process.env.BROWSER_CLIENT || "WaZap", process.env.BROWSER_NAME || "Chrome", process.env.BROWSER_VERSION || "10.0"],
          auth: state as AuthenticationState,
          version,
          defaultQueryTimeoutMs: 60_000,
          connectTimeoutMs: 60_000,
          keepAliveIntervalMs: 60_000,
          msgRetryCounterMap,
          // comentado 24/02/2023
          // getMessage: async key => {
          //   const message = await Message.findOne({
          //     where: {
          //       id: key.id
          //     }
          //   });

          //   await delay(1000);
          //   if (!message) return;
          //   return {
          //     conversation: message.body
          //   };
          // },

          // emitOwnEvents: false,
          // generateHighQualityLinkPreview: true,
          // qrTimeout: 15_000,
          // syncFullHistory: true,
          // shouldIgnoreJid: jid => isJidBroadcast(jid)
          // patchMessageBeforeSending: (message) => {
          //   const requiresPatch = !!(
          //     message.buttonsMessage ||
          //     message.templateMessage ||
          //     message.listMessage
          //   );
          //   if (requiresPatch) {
          //     message = {
          //       viewOnceMessage: {
          //         message: {
          //           messageContextInfo: {
          //             deviceListMetadataVersion: 2,
          //             deviceListMetadata: {},
          //           },
          //           ...message,
          //         },
          //       },
          //     };
          //   }
          //   return message;
          // }
        })

        wsocket.ev.on(
          "connection.update",
          async ({ connection, lastDisconnect, qr }) => {
            logger.info(`Socket ${name} Connection Update ${connection || ""} ${lastDisconnect || ""}`);

            const disconect = (lastDisconnect?.error as Boom)?.output?.statusCode;

            if (connection === "close") {
              if (disconect === 403) {
                await whatsapp.update({ status: "PENDING", session: "", number: "" });
                removeWbot(id, false);

                await DeleteBaileysService(whatsapp.id);

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
              }

              if (disconect !== DisconnectReason.loggedOut) {
                removeWbot(id, false);
                setTimeout(() => StartWhatsAppSession(whatsapp, whatsapp.companyId), 2000);
              } else {
                await whatsapp.update({ status: "PENDING", session: "", number: "" });
                await DeleteBaileysService(whatsapp.id);

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                removeWbot(id, false);
                setTimeout(() => StartWhatsAppSession(whatsapp, whatsapp.companyId), 2000);
              }
            }

            if (connection === "open") {
              await whatsapp.update({
                status: "CONNECTED",
                qrcode: "",
                retries: 0,
                number:
                  wsocket.type === "md"
                    ? jidNormalizedUser((wsocket as WASocket).user.id).split("@")[0]
                    : "-"
              });

              io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });

              const sessionIndex = sessions.findIndex(
                s => s.id === whatsapp.id
              );
              if (sessionIndex === -1) {
                wsocket.id = whatsapp.id;
                sessions.push(wsocket);
              }

              resolve(wsocket);
            }

            if (qr !== undefined) {
              if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
                await whatsapp.update({
                  status: "DISCONNECTED",
                  qrcode: ""
                });
                await DeleteBaileysService(whatsapp.id);

                io.of(`${whatsapp.companyId}`).emit("whatsappSession", {
                  action: "update",
                  session: whatsapp
                });
                wsocket.ev.removeAllListeners("connection.update");
                wsocket.ws.close();
                wsocket = null;
                retriesQrCodeMap.delete(id);
              } else {
                logger.info(`Session QRCode Generate ${name}`);
                retriesQrCodeMap.set(id, (retriesQrCode += 1));

                await whatsapp.update({
                  qrcode: qr,
                  status: "qrcode",
                  retries: 0,
                  number: ""
                });
                const sessionIndex = sessions.findIndex(
                  s => s.id === whatsapp.id
                );

                if (sessionIndex === -1) {
                  wsocket.id = whatsapp.id;
                  sessions.push(wsocket);
                }

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
              }
            }
          }
        );
        wsocket.ev.on("creds.update", saveState);

        wsocket.store = store;
        store.bind(wsocket.ev);
      })();
    } catch (error) {
      console.log("Error no init Wbot");
      initWbot(whatsapp);
    }
  });
};

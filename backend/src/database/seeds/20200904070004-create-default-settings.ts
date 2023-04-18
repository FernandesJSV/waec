import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Settings",
      [
        {
          key: "userCreation",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "hoursCloseTicketsAuto",
          value: "9999999999",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "chatBotType",
          value: "text",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "userRandom",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "sendMsgTransfTicket",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "scheduleType",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "CheckMsgIsGroup",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "sendGreetingAccepted",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "acceptCallWhatsapp",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "userRating",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "sendGreetingMessageOneQueues",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "sendSignMessage",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "sendQueuePosition",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "acceptAudioMessageContact",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        {
          key: "sendFarewellWaitingTicket",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {});
  }
};

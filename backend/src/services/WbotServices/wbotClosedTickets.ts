import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";

export const ClosedAllOpenTickets = async (companyId: number): Promise<void> => {

  const io = getIO();
  try {

    const { rows: tickets } = await Ticket.findAndCountAll({
      where: { status: "open", companyId: companyId },
      order: [["updatedAt", "DESC"]]
    });

    tickets.forEach(async ticket => {
      const whatsapp = await Whatsapp.findByPk(ticket?.whatsappId);

      let horasFecharAutomaticamente = whatsapp?.expiresTicket;

      if (horasFecharAutomaticamente &&
        horasFecharAutomaticamente !== undefined &&
        horasFecharAutomaticamente !== 0 &&
        Number(horasFecharAutomaticamente) > 0
      ) {

        let dataLimite = new Date()
        dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente));

        tickets.forEach(async ticket => {

          if (ticket.status === "open") {

            let dataUltimaInteracaoChamado = new Date(ticket.updatedAt)

            if (dataUltimaInteracaoChamado < dataLimite) {

              console.log(`Fechando ticket ${ticket.id} da company ${ticket.companyId}`)

              await ticket.update({
                status: "closed",
                unreadMessages: 0,
                userId: null,
                queueId: null,
                amountUsedBotQueues: 0
              });

              io.to("open").emit(`company-${ticket.companyId}-ticket`, {
                action: "delete",
                ticket,
                ticketId: ticket.id
              });

            }
          }
        })

        logger.info(`Fechando tickets em abertos da companyId: ${companyId}`);
      }

    });

  } catch (e: any) {
    console.log('e', e)
  }

}

import { Op } from "sequelize";
import TicketTraking from "../../models/TicketTraking";

interface Params {
  ticketId: string | number;
  companyId: string | number;
  whatsappId?: string | number;
  userId?: string | number;
  ratingId?: string | number;
}

const FindOrCreateATicketTrakingService = async ({
  ticketId,
  companyId,
  whatsappId,
  userId,
  ratingId
}: Params): Promise<TicketTraking> => {
  const ticketTraking = await TicketTraking.findOne({
    where: {
      ticketId,
      finishedAt: {
        [Op.is]: null
      }
    }
  });

  if (ticketTraking) {
    await TicketTraking.update(
      {
        ratingId,
      },
      {
        where: {
          id: ticketTraking.id
        }
      }
    );
    return ticketTraking;
  }

  const newRecord = await TicketTraking.create({
    ticketId,
    companyId,
    whatsappId,
    userId,
    ratingId
  });

  return newRecord;
};

export default FindOrCreateATicketTrakingService;

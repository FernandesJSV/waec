import Ticket from "../models/Ticket";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

const UpdateDeletedUserOpenTicketsStatus = async (
  tickets: Ticket[],
  companyId: number
): Promise<void> => {
  tickets.forEach(async t => {
    const ticketId = t.id.toString();

    await UpdateTicketService({
      ticketData: { status: "pending" },
      ticketId,
      companyId,
      ratingId: undefined
    });
  });
};

export default UpdateDeletedUserOpenTicketsStatus;

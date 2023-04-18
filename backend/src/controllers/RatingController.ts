import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import CreateService from "../services/RatingServices/CreateService";
import ListService from "../services/RatingServices/ListService";
import UpdateService from "../services/RatingServices/UpdateService";
import ShowService from "../services/RatingServices/ShowService";
import DeleteService from "../services/RatingServices/DeleteService";
import SimpleListService from "../services/RatingServices/SimpleListService";
import DeleteAllService from "../services/RatingServices/DeleteAllService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

type MessageData = {
  ratingId: number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { ratings, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ ratings, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, message, options } = req.body;
  const { companyId } = req.user;

  const rating = await CreateService({
    name,
    message,
    options,
    companyId
  });

  const io = getIO();
  io.emit("rating", {
    action: "create",
    rating
  });

  return res.status(200).json(rating);
};

export const sendRating = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { ticketId } = req.params;
    const { ratingId }: MessageData = req.body;
    const { companyId } = req.user;

    const ticketData = await ShowTicketService(ticketId, companyId);
    ticketData.status = "closed";

    await UpdateTicketService({
      ticketData,
      ticketId,
      companyId,
      ratingId
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new AppError(error.message);
  }

  return res.send();
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ratingId } = req.params;
  const { companyId } = req.user;

  const rating = await ShowService(ratingId, companyId);

  return res.status(200).json(rating);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { ratingId } = req.params;
  const ratingData = req.body;
  const { companyId } = req.user;

  const rating = await UpdateService({ ratingData, id: ratingId, companyId });

  const io = getIO();
  io.emit("rating", {
    action: "update",
    rating
  });

  return res.status(200).json(rating);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ratingId } = req.params;
  const { companyId } = req.user;

  await DeleteService(ratingId, companyId);

  const io = getIO();
  io.emit("rating", {
    action: "delete",
    ratingId
  });

  return res.status(200).json({ message: "Rating deleted" });
};

export const removeAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  await DeleteAllService(companyId);

  return res.send();
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const ratings = await SimpleListService({ searchParam, companyId });

  return res.json(ratings);
};

import Rating from "../../models/Rating";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string | number, companyId: number): Promise<void> => {
  const rating = await Rating.findOne({
    where: { id, companyId }
  });

  if (!rating) {
    throw new AppError("ERR_NO_RATING_FOUND", 404);
  }

  await rating.destroy();
};

export default DeleteService;

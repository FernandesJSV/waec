import Rating from "../../models/Rating";
import AppError from "../../errors/AppError";

const DeleteAllService = async (companyId: number): Promise<void> => {
  await Rating.findAll({
    where: { companyId }
  });

  if (!Rating) {
    throw new AppError("ERR_NO_RATING_FOUND", 404);
  }

  await Rating.destroy({ where: {} });
};

export default DeleteAllService;

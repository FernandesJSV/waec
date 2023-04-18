import Rating from "../../models/Rating";
import AppError from "../../errors/AppError";
import RatingOptions from "../../models/RatingOption";

const RatingService = async (id: string | number, companyId: number): Promise<Rating> => {
  const rating = await Rating.findOne({
    where: { id, companyId },
    attributes: ["id", "name", "message","companyId"],
    include: [
      "options",
      {
        model: RatingOptions,
        as: "options",
        attributes: ["id", "name", "value"]
      }
    ]
  });

  if (!rating) {
    throw new AppError("ERR_NO_RATING_FOUND", 404);
  }

  return rating;
};

export default RatingService;

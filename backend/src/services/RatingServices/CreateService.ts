import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Rating from "../../models/Rating";
import RatingOptions from "../../models/RatingOption";

interface Request {
  name: string;
  companyId: number;
  message: string;
  options?: RatingOptions[];
}

const CreateService = async ({
  name,
  message,
  companyId,
  options
}: Request): Promise<Rating> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(3)
      .test(
        "Check-unique-name",
        "ERR_RATING_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const tagWithSameName = await Rating.findOne({
              where: { name: value }
            });

            return !tagWithSameName;
          }
          return false;
        }
      )
  });

  try {
    await schema.validate({ name });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new AppError(err.message);
  }
  const [rating] = await Rating.findOrCreate({
    where: { name, message },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignores
    defaults: {
      name,
      companyId,
      message,
    },
  });
  if(options && options.length > 0) {
    await Promise.all(
      options.map(async info => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await RatingOptions.upsert({ ...info, ratingId: rating.id });
      })
    );
  }

  await rating.reload({
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

  return rating;
};

export default CreateService;

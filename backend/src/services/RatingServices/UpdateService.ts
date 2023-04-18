import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Rating from "../../models/Rating";
import RatingOptions from "../../models/RatingOption";
import ShowService from "./ShowService";

interface Options {
  id?: number;
  name: string;
  value: string;
}
interface RatingData {
  id?: number;
  name?: string;
  message?: string;
  options?: Options[];
}

interface Request {
  ratingData: RatingData;
  id: string | number;
  companyId: number;
}

const UpdateService = async ({
  ratingData,
  id,
  companyId
}: Request): Promise<Rating | undefined> => {
  const rating = await ShowService(id, companyId);

  const schema = Yup.object().shape({
    name: Yup.string().min(3)
  });

  const { name, message, options } = ratingData;

  try {
    await schema.validate({ name });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (options) {
    await Promise.all(
      options.map(async info => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await RatingOptions.upsert({ ...info, ratingId: rating.id });
      })
    );

    await Promise.all(
      rating.options.map(async oldInfo => {
        const stillExists = options.findIndex(info => info.id === oldInfo.id);

        if (stillExists === -1) {
          await RatingOptions.destroy({ where: { id: oldInfo.id } });
        }
      })
    );
  }

  await rating.update({
    name,
    message
  });

  await rating.reload({
    attributes: ["id", "name", "message","companyId"],
    include: ["options"]
  });
  return rating;
};

export default UpdateService;

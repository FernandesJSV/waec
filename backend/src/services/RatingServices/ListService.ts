import { Op } from "sequelize";
import Rating from "../../models/Rating";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  ratings: Rating[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam,
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  if (searchParam) {
    whereCondition = {
      [Op.or]: [{ name: { [Op.like]: `%${searchParam}%` } }]
    };
  }
  const { count, rows: ratings } = await Rating.findAndCountAll({
    where: {companyId, ...whereCondition},
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + ratings.length;

  return {
    ratings,
    count,
    hasMore
  };
};

export default ListService;

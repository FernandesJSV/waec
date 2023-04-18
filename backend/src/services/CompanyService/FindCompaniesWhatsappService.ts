import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";

const FindCompaniesWhatsappService = async (id: string | number): Promise<Company> => {
  const companies = await Company.findOne({
    where: { id },
    order: [["name", "ASC"]],
    include: [
      { model: Whatsapp, attributes: ["id", "name", "status"], where: { isDefault: true } },
    ]
  });
  return companies;
};

export default FindCompaniesWhatsappService;

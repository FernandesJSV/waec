import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Setting from "../../models/Setting";

const ListCompaniesPlanService = async (): Promise<Company[]> => {
  const companies = await Company.findAll({
    attributes: ["id", "name", "email", "status", "dueDate", "createdAt", "phone", "document", "lastLogin"],
    order: [["name", "ASC"]],
    include: [
      {
        model: Plan, as: "plan",
        attributes: [
          "id",
          "name",
          "users",
          "connections",
          "queues",
          "amount",
          "useWhatsapp",
          "useFacebook",
          "useInstagram",
          "useCampaigns",
          "useSchedules",
          "useInternalChat",
          "useExternalApi"
        ]
      },
    ]
  });
  return companies;
};

export default ListCompaniesPlanService;

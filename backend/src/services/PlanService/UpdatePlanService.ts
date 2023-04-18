import AppError from "../../errors/AppError";
import Plan from "../../models/Plan";

interface PlanData {
  name: string;
  id?: number | string;
  users?: number;
  connections?: number;
  queues?: number;
  amount?: string;
  useWhatsapp?: boolean;
  useFacebook?: boolean;
  useInstagram?: boolean;
  useCampaigns?: boolean;
  useSchedules?: boolean;
  useInternalChat?: boolean;
  useExternalApi?: boolean;
}

const UpdatePlanService = async (planData: PlanData): Promise<Plan> => {
  const { id,
    name,
    users,
    connections,
    queues,
    amount,
    useWhatsapp,
    useFacebook,
    useInstagram,
    useCampaigns,
    useSchedules,
    useInternalChat,
    useExternalApi
  } = planData;

  const plan = await Plan.findByPk(id);

  if (!plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  await plan.update({
    name,
    users,
    connections,
    queues,
    amount,
    useWhatsapp,
    useFacebook,
    useInstagram,
    useCampaigns,
    useSchedules,
    useInternalChat,
    useExternalApi
  });

  return plan;
};

export default UpdatePlanService;

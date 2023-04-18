import AppError from "../../errors/AppError";
import CheckSettings from "../../helpers/CheckSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  acceptAudioMessage?: boolean;
  active?: boolean;
  companyId: number;
  extraInfo?: ExtraInfo[];
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  acceptAudioMessage,
  active,
  companyId,
  extraInfo = []
}: Request): Promise<Contact> => {
  const numberExists = await Contact.findOne({
    where: { number, companyId }
  });

  if (numberExists) {
    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const acceptAudioMessageContact = await CheckSettings("acceptAudioMessageContact")

  const contact = await Contact.create(
    {
      name,
      number,
      email,
      acceptAudioMessage: acceptAudioMessageContact === 'enabled' ? true : false,
      active,
      extraInfo,
      companyId
    },
    {
      include: ["extraInfo"]
    }
  );

  return contact;
};

export default CreateContactService;

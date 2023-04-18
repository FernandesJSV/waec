import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CheckContactNumber = async (
  number: string, companyId: number
): Promise<string> => {
  const wahtsappList = await GetDefaultWhatsApp(companyId);

  const wbot = getWbot(wahtsappList.id);
  const isGroup = number.endsWith("@g.us");
  let numberArray;
  if (isGroup) {
    const grupoMeta = await wbot.groupMetadata(number);
    numberArray = [
      {
        jid: grupoMeta.id,
        exists: true
      }
    ];
  } else {
    numberArray = await wbot.onWhatsApp(`${number}@s.whatsapp.net`);
  }

  const isNumberExit = numberArray;

  if (!isNumberExit[0]?.exists) {
    throw new Error("ERR_CHECK_NUMBER");
  }

  return isGroup ? number.split("@")[0] : isNumberExit[0].jid.split("@")[0];
};

export default CheckContactNumber;

import path from "path";
import multer from "multer";
import fs from "fs";
import Whatsapp from "../models/Whatsapp";
import { isEmpty, isNil } from "lodash";

const publicFolder = path.resolve(__dirname, "..", "..", "public");

export default {
  directory: publicFolder,
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {

      let companyId;
      companyId = req.user?.companyId

      if (companyId === undefined && isNil(companyId) && isEmpty(companyId)) {
        const authHeader = req.headers.authorization;
        const [, token] = authHeader.split(" ");
        const whatsapp = await Whatsapp.findOne({ where: { token } });
        companyId = whatsapp.companyId;
      }

      const folder = `${publicFolder}/company${companyId}/`

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
        fs.chmodSync(folder, 0o777)
      }
      return cb(null, folder);
    },
    filename(req, file, cb) {
      const fileName = new Date().getTime() + '_' + file.originalname.replace('/','-');
      return cb(null, fileName);
    }
  })
};

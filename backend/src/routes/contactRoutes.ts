import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";

const contactRoutes = express.Router();
const upload = multer(uploadConfig);

contactRoutes.post("/contacts/import", isAuth, ImportPhoneContactsController.store);
contactRoutes.get("/contacts", isAuth, ContactController.index);
contactRoutes.get("/contacts/list", isAuth, ContactController.list);
contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);
contactRoutes.post("/contacts", isAuth, ContactController.store);
contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);
contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);
contactRoutes.put("/contacts/toggleAcceptAudio/:contactId", isAuth, ContactController.toggleAcceptAudio);
contactRoutes.get("/contact", isAuth, ContactController.getContactVcard);

contactRoutes.put("/contacts/block/:contactId", isAuth, ContactController.blockUnblock);
contactRoutes.post("/contacts/upload", isAuth, upload.array("file"), ContactController.upload);

export default contactRoutes;

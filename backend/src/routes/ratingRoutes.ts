import express from "express";
import isAuth from "../middleware/isAuth";

import * as RatingController from "../controllers/RatingController";

const ratingRoutes = express.Router();

ratingRoutes.get("/ratings/list", isAuth, RatingController.list);
ratingRoutes.get("/ratings", isAuth, RatingController.index);
ratingRoutes.post("/ratings", isAuth, RatingController.store);
ratingRoutes.put("/ratings/:ratingId", isAuth, RatingController.update);
ratingRoutes.get("/ratings/:ratingId", isAuth, RatingController.show);
ratingRoutes.delete("/ratings/:ratingId", isAuth, RatingController.remove);
ratingRoutes.delete("/ratings", isAuth, RatingController.removeAll);
ratingRoutes.post("/ratings/messages/:ticketId", isAuth, RatingController.sendRating);

export default ratingRoutes;

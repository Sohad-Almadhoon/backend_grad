import express from "express";
import { addReview } from "../controllers/review.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import checkBuyer from "../middlewares/checkBuyer.js";
const router = express.Router();

router.post(
  "/",
  verifyToken,
  checkBuyer("add review"),
  asyncHandler(addReview)
);

export default router;

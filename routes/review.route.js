import express from "express";
import {
  addReview,
  getCarReviews,
} from "../controllers/review.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/:id/reviews", verifyToken, addReview);
router.get("/:id/reviews", verifyToken, getCarReviews);
export default router;

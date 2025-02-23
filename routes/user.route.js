import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  fetchSellerCars,
  fetchUserDetails,
  updateUserDetails,
} from "../controllers/user.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import checkSeller from "../middlewares/checkSeller.js";
const router = express.Router();

router.get(
  "/cars",
  verifyToken,
  checkSeller("view cars"),
  asyncHandler(fetchSellerCars)
);
router.get("/", verifyToken, asyncHandler(fetchUserDetails));
router.put("/", verifyToken, asyncHandler(updateUserDetails));

export default router;

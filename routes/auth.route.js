import express from "express";
import {
  requestOtp,
  verifyOtp,
  login,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/request-otp", asyncHandler(requestOtp));
router.post("/verify-otp", asyncHandler(verifyOtp));
router.post("/reset-password", asyncHandler(resetPassword));

export default router;

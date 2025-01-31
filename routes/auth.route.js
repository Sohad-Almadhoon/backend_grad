import express from "express";
import {
  requestOtp,
  verifyOtp,
  login,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);


export default router;

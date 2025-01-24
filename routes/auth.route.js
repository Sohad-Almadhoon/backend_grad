import express from "express";
import {
  forgetPassword,
  login,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

export default router;

import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  fetchSellerCars,
  fetchUserDetails,
  updateUserDetails,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/cars", verifyToken, fetchSellerCars);
router.get("/:id", verifyToken, fetchUserDetails);
router.put("/:id", verifyToken, updateUserDetails);

export default router;

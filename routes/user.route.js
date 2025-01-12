import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { fetchUserCars } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/cars", verifyToken, fetchUserCars)
export default router;

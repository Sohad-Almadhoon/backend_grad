import express from "express";
import {
  getCars,
  getCarById,
  createCar,
  deleteCar,
  updateCar,
  fetchSellerDetails,
  getCarsStatistics,
} from '../controllers/car.controller.js';
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();
router.get("/statistics",verifyToken, getCarsStatistics); 
router.get("/seller", verifyToken, fetchSellerDetails);
router.get("/", getCars);
router.get("/:id", getCarById);
router.post("/", verifyToken, createCar);
router.put("/:id", verifyToken, updateCar); 
router.delete("/:id", verifyToken, deleteCar); 
export default router;

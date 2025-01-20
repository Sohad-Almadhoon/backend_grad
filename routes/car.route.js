import express from "express";
import {
  getCars,
  getCarById,
  createCar,
  deleteCar,
  addReview,
  getCarReviews,
  updateCar,
  fetchSellerDetails,
} from '../controllers/car.controller.js';
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getCars);
router.get("/:id", getCarById);
router.post("/", verifyToken, createCar);
router.put("/:id", verifyToken, updateCar); 
router.delete("/:id", verifyToken, deleteCar); 
router.post("/:id/reviews", verifyToken, addReview); 
router.get("/:id/reviews", verifyToken, getCarReviews); 
router.get("/:id/seller", verifyToken, fetchSellerDetails);
export default router;

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
  addFavorite,
  getFavorites,
  removeFavorite,
} from '../controllers/car.controller.js';
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();
router.get("/favorites", verifyToken, getFavorites);
router.get("/seller", verifyToken, fetchSellerDetails);
router.get("/", getCars);
router.get("/:id", getCarById);
router.post("/:id/reviews", verifyToken, addReview); 
router.post("/", verifyToken, createCar);
router.put("/:id", verifyToken, updateCar); 
router.delete("/:id", verifyToken, deleteCar); 
router.get("/:id/reviews", verifyToken, getCarReviews); 
router.post("/:id/favorites", verifyToken, addFavorite);
router.delete("/favorites/:id", verifyToken, removeFavorite);
export default router;

import express from "express";
import {
  getCars,
  getCarById,
  createCar,
  deleteCar,
  addComment,
} from '../controllers/car.controller.js';
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", getCars); // Get all cars
router.get("/:id", getCarById); // Get car details
router.post("/", verifyToken, createCar); // Add a new car
router.delete("/:id", verifyToken, deleteCar); // Delete a car
router.post("/:id/comments", verifyToken, addComment); // Add a comment to a car

export default router;

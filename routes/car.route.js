import express from "express";
import {
  getCars,
  getCarById,
  createCar,
  deleteCar,
  updateCar,
  fetchSellerDetails,
  getSoldCarsStatistics,
  getTopSellingCars,
} from "../controllers/car.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { imageUploader } from "../utils/storage.js";
import asyncHandler from "../utils/asyncHandler.js";
import checkSeller from "../middlewares/checkSeller.js";

const router = express.Router();

router.get("/statistics", verifyToken, getSoldCarsStatistics);
router.get("/statistics/top", verifyToken, getTopSellingCars);
router.get("/seller", verifyToken, fetchSellerDetails);
router.get("/", getCars);
router.get("/:id", getCarById);

router.post(
  "/",
  verifyToken,
  imageUploader.array("images"),
  checkSeller("create a car"),
  asyncHandler(createCar)
);

router.put(
  "/:id",
  verifyToken,
  checkSeller("update a car"),
  asyncHandler(updateCar)
);

router.delete(
  "/:id",
  verifyToken,
  checkSeller("delete a car"),
  asyncHandler(deleteCar)
);

export default router;

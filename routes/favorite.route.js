import express from "express";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favorites.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import checkBuyer from "../middlewares/checkBuyer.js";  
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  checkBuyer("view favorites"),
  asyncHandler(getFavorites)
);
router.post(
  "/",
  verifyToken,
  checkBuyer("add favorite"),
  asyncHandler(addFavorite)
); 
router.delete(
  "/:id",
  verifyToken,
  checkBuyer("remove favorite"),
  asyncHandler(removeFavorite)
); 

export default router;

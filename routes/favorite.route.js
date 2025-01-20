import express from "express";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favorites.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();
router.get("/", verifyToken, getFavorites);
router.post("/", verifyToken, addFavorite);
router.delete("/:id", verifyToken, removeFavorite);
export default router;

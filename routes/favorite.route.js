import express from "express";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favorites.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();
router.get("/favorites", verifyToken, getFavorites);
router.post("/:id/favorites", verifyToken, addFavorite);
router.delete("/favorites/:id", verifyToken, removeFavorite);
export default router;

import express from "express";
import { addItemToCart, getCartItems, removeItemFromCart, updateCartItem } from "../controllers/cart.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

router.get("/", verifyToken, getCartItems);
router.post("/", verifyToken, addItemToCart);
router.put("/:id", verifyToken, updateCartItem);
router.delete("/:id", verifyToken, removeItemFromCart);

export default router;

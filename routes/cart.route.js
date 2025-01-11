import express from "express";
import { addItemToCart, getCartItems, removeItemFromCart, updateCartItem } from "../controllers/cart.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

// Route to get all items in the user's cart
router.get("/", verifyToken, getCartItems);

// Route to add an item to the cart
router.post("/", verifyToken, addItemToCart);

// Route to update the quantity of an item in the cart
router.put("/:id", verifyToken, updateCartItem);

// Route to remove an item from the cart
router.delete("/:id", verifyToken, removeItemFromCart);

export default router;

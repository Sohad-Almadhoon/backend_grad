import express from "express";
import {
  addItemToCart,
  getCartItems,
  removeItemFromCart,
  updateCartItem,
} from "../controllers/cart.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import checkBuyer from "../middlewares/checkBuyer.js"; 
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  checkBuyer("view cart"),
  asyncHandler(getCartItems)
); 
router.post(
  "/",
  verifyToken,
  checkBuyer("add items to cart"),
  asyncHandler(addItemToCart)
); 
router.put(
  "/:id",
  verifyToken,
  checkBuyer("update cart item"),
  asyncHandler(updateCartItem)
); 
router.delete(
  "/:id",
  verifyToken,
  checkBuyer("remove item from cart"),
  asyncHandler(removeItemFromCart)
);

export default router;

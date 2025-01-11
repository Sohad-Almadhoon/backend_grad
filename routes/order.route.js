import express from "express";
import { createOrder, deleteOrder, getAllOrders, getOrderById, updateOrderPaymentStatus } from "../controllers/order.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// Create an order
router.post("/:carId", verifyToken ,createOrder);

// Get all orders with user info
router.get("/", verifyToken, getAllOrders);

// Get a single order by ID with user info
router.get("/:id", verifyToken, getOrderById);

// Update order payment status
router.put("/:id", verifyToken, updateOrderPaymentStatus);

// Delete an order
router.delete("/:id", verifyToken, deleteOrder);

export default router;

import express from "express";
import {
  confirmOrder,
  createPaymentIntent,
  getOrders,
} from "../controllers/order.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/buyer", verifyToken, (req, res) => getOrders(req, res, false)); // Buyer orders
router.get("/seller", verifyToken, (req, res) => getOrders(req, res, true)); // Seller orders
router.post("/payment-intent", verifyToken, createPaymentIntent); 
router.post("/confirm", verifyToken, confirmOrder);

export default router;

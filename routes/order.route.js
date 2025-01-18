import express from "express";
import { createOrder, deleteOrder, getAllOrders, updateOrderPaymentStatus } from "../controllers/order.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/:carId", verifyToken ,createOrder);

router.get("/", verifyToken, getAllOrders);


router.put("/:id", verifyToken, updateOrderPaymentStatus);

router.delete("/:id", verifyToken, deleteOrder);

export default router;

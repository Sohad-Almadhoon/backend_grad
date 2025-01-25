import express from "express";
import { confirmOrder, createOrder, getAllOrders } from "../controllers/order.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken ,createOrder);
router.get("/", verifyToken, getAllOrders);
router.post("/confirm" , confirmOrder);
export default router;

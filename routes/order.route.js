import express from "express";
import {
  confirmOrder,
  createPaymentIntent,
  getOrdersForBuyer,
  getOrdersForSeller,
  getRevenueStatistics,
} from "../controllers/order.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import checkBuyer from "../middlewares/checkBuyer.js";
import checkSeller from "../middlewares/checkSeller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/buyer",
  verifyToken,
  checkBuyer("view orders"),
  asyncHandler(getOrdersForBuyer)
);

router.get(
  "/seller",
  verifyToken,
  checkSeller("view seller orders"),
  asyncHandler(getOrdersForSeller)
);


router.post(
  "/payment-intent",
  verifyToken,
  checkBuyer("create payment intent"),
  asyncHandler(createPaymentIntent)
);

router.post(
  "/confirm",
  verifyToken,
  checkBuyer("confirm order"),
  asyncHandler(confirmOrder)
);

router.get(
  "/revenue",
  verifyToken,
  checkSeller("view revenue statistics"),
  asyncHandler(getRevenueStatistics)
);


export default router;

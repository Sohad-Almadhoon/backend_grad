import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import prisma from "../utils/db.js";
import stripe from "../utils/stripe.js";
const router = express.Router();

router.post("/create-payment-intent", verifyToken, async (req, res) => {
  const id = req.userId;
  const { quantity, amount, currency } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * quantity,
      currency,
    });
    res.status(200).json(paymentIntent);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

import prisma from "../utils/db.js";
import stripe from "../utils/stripe.js";

const createPaymentIntent = async (req, res) => {
  const { totalPrice, currency } = req.body;
  try {
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found!" });
    }
    if (car.quantityInStock < quantity) {
      return res.status(400).json({ error: "Not enough stock available!" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,
      currency,
      payment_method_types: ["card"],
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getOrders = async (req, res, isSeller) => {
  try {
    if ((isSeller && !req.isSeller) || (!isSeller && req.isSeller)) {
      return res
        .status(403)
        .json({ error: "You are not allowed to see these orders!" });
    }

    const orders = await prisma.order.findMany({
      where: {
        buyerId: req.userId,
      },
      include: {
        buyer: {
          select: {
            email: true,
            username: true,
          },
        },
        car: {
          select: {
            brand: true,
            coverImage: true,
            price: true,
          },
        },
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: error.message });
  }
};

const confirmOrder = async (req, res) => {
  const { paymentIntentId, carId, totalPrice, cartItemId, quantity } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res
        .status(400)
        .json({ error: `Payment failed: ${paymentIntent.status}` });
    }
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });
    if (!car) return res.status(404).json({ error: "Car not found!" });
    if (car.quantityInStock < quantity) {
      return res
        .status(400)
        .json({ error: `Not enough stock available for ${car.brand}!` });
    }
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: { totalPrice, buyerId: req.userId, cartItemId, carId, quantity },
        include: { car: { select: { id: true } } },
      }),
      prisma.car.update({
        where: { id: carId },
        data: {
          quantitySold: car.quantitySold + quantity,
          quantityInStock: car.quantityInStock - quantity,
        },
      }),
      prisma.cart.delete({ where: { id: cartItemId } }),
    ]);
    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { createPaymentIntent, getOrders, confirmOrder };

import prisma from "../utils/db.js";
import stripe from "../utils/stripe.js";

const createPaymentIntent = async (req, res) => {
  const { totalPrice } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,
      currency: "usd",
      payment_method_types: ["card"],
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getOrdersForCar = async (req, res) => {
  if (!req.isSeller) {
    return res
      .status(403)
      .json({ error: "You are not allowed to see these orders!" });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        car: {
          sellerId: req.userId,
        },
      },
      include: {
        buyer: {
          select: {
            email: true,
            username: true,
          },
        },
        car: true,
      },
    });

    return res.status(200).json({
      length: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders for car:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getOrdersForBuyer = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        buyerId: req.userId,
      },
      include: {
        car: {
          include: {
            seller: {
              select: {
                username: true,
                whatsapp: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      length: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders for buyer:", error);
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

    if (isSeller) {
      return await getOrdersForCar(req, res);
    } else {
      return await getOrdersForBuyer(req, res);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: error.message });
  }
};

const confirmOrder = async (req, res) => {
  const { carId, cartItemId } = req.body;

  try {
    const cartItem = await prisma.cart.findUnique({
      where: { id: cartItemId },
      include: { car: true },
    });

    if (!cartItem)
      return res.status(404).json({ error: "Cart item not found!" });

    const { totalPrice, quantity, car } = cartItem;

    if (!car) return res.status(404).json({ error: "Car not found!" });
    if (car.quantityInStock < quantity) {
      return res.status(400).json({ error: `Not enough stock available!` });
    }

    const order = await prisma.order.create({
      data: { totalPrice, buyerId: req.userId, carId, quantity },
    });

    await prisma.car.update({
      where: { id: carId },
      data: {
        quantitySold: car.quantitySold + quantity,
        quantityInStock: car.quantityInStock - quantity,
      },
    });

    await prisma.cart.delete({ where: { id: cartItemId } });

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { createPaymentIntent, getOrders, confirmOrder };

import prisma from "../utils/db.js";
import stripe from "stripe"; // Ensure Stripe is properly initialized

const createOrder = async (req, res) => {
  const { carId, totalPrice, cartItemId } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  try {
    console.log(req.body);

    // Step 1: Verify car and stock availability
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found!" });
    }
    if (car.quantityInStock < quantity) {
      return res.status(400).json({ error: "Not enough stock available!" });
    }

    // Step 2: Use a Prisma transaction to create order and update inventory
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          totalPrice,
          buyerId: req.userId,
          cartItemId,
          carId,
          quantity,
        },
        include: {
          car: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.car.update({
        where: { id: carId },
        data: {
          quantitySold: car.quantitySold + quantity,
          quantityInStock: car.quantityInStock - quantity,
        },
      }),
      prisma.cart.delete({
        where: { id: cartItemId },
      }),
    ]);

    console.log(order);
    return res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    if (!req.isSeller) {
      return res
        .status(403)
        .json({ error: "You are not allowed to see orders!" });
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
  const { paymentIntentId } = req.body;

  try {
    // Step 1: Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Step 2: Check the payment status
    if (paymentIntent.status === "succeeded") {
      console.log("Payment confirmed for Order:", paymentIntent.id);
      res.status(200).send({ message: "Order confirmed" });
    } else {
      res.status(400).send({ error: "Payment failed" });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};

export { createOrder, getAllOrders, confirmOrder };

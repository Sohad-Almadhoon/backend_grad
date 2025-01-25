import prisma from "../utils/db.js";

const createOrder = async (req, res) => {
  const { carId, paymentIntent, totalPrice, cartItemId, quantity } = req.body;
  try {
    console.log(req.body);
    const order = await prisma.order.create({
      data: {
        paymentIntent,
        totalPrice,
        buyerId: req.userId,
        cartItemId,
        carId,
        // quantity,
      },
      include: {
        car: {
          select: {
            id: true,
          },
        },
      },
    });

    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found!" });
    }
    if (car.quantity < quantity) {
      return res.status(400).json({ error: "Not enough stock available!" });
    }

    await prisma.car.update({
      where: { id: carId },
      data: {
        quantitySold: car.quantitySold + quantity,
        quantityInStock: car.quantity - quantity,
      },
    });
    await prisma.cart.delete({
      where: { id: cartItemId },
    });
    console.log(order);
    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    if (!req.isSeller)
      return res
        .status(403)
        .json({ error: "You are not allowed to see orders!" });
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
    return res.status(500).json({ error: error.message });
  }
};
const confirmOrder = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    // Step 1: Retrieve the payment intent from Stripe to verify payment status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Step 2: Check the payment status
    if (paymentIntent.status === 'succeeded') {
      // Payment was successful, confirm the order
      // You can perform any actions like updating the order status in your database here
      console.log('Payment confirmed for Order:', paymentIntent.id);
      res.status(200).send({ message: 'Order confirmed' });
    } else {
      // Payment was not successful
      res.status(400).send({ error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
}
export { createOrder, getAllOrders , confirmOrder };

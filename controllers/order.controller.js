import prisma from "../utils/db.js";

const createOrder = async (req, res) => {
  const { cartItemId, quantity , paymentIntent} = req.body;

  try {
    const cartItem = await prisma.cart.findUnique({
      where: { id: cartItemId },
      include: {
        car: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    const { car, quantity: availableQuantity } = cartItem;

    if (availableQuantity < quantity) {
      return res
        .status(400)
        .json({ error: "Insufficient car quantity available." });
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          carId: car.id,
          buyerId: req.userId,
          quantity,
          totalPrice: car.price * quantity,
          cartItem: { connect: { id: cartItemId } },
          paymentIntent,
        },
      });

      // Update the quantity of the car in stock after creating the order
      await tx.car.update({
        where: { id: car.id },
        data: {
          quantity: availableQuantity - quantity,
          quantitySold: car.quantitySold + quantity,
        },
      });

      return newOrder;
    });

    res.status(201).json({ message: "Order created successfully.", order });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create order.", details: error.message });
  }
};

const getAllOrders = async (req, res) => {
  if (!req.isSeller)
    return res
      .status(403)
      .json({ error: "You are not allowed to see orders!" });
  try {
    const orders = await prisma.order.findMany({
      where: {
       buyerId: req.userId 
      },
      include: {
        car: {
          select: {
            brand: true,
            coverImage: true,
            price: true,
          },
        },
        buyer: {
          select: {
            username: true,
          },
        },
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { createOrder, getAllOrders };

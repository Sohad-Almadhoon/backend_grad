import prisma from "../utils/db.js";

const createOrder = async (req, res) => {
  const { carId, paymentIntent, totalPrice, cartItemId } = req.body;
  try {
    const order = await prisma.order.create({
      data: {
        paymentIntent,
        totalPrice,
        buyerId: req.userId,
        cartItemId,
        carId,
      },
    });
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found!" });
    }
    await prisma.car.update({
      where: { id: carId },
      data: {
        quantitySold: car.quantitySold + 1,
        quantityInStock: car.quantityInStock - 1,
      },
    });

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

export { createOrder, getAllOrders };

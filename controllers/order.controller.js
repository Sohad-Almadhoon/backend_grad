import prisma from "../utils/db.js";

const createOrder = async (req, res) => {
  const { carId, quantity } = req.body;

  try {
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found." });
    }

    if (car.quantity < quantity) {
      return res
        .status(400)
        .json({ error: "Insufficient car quantity available." });
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          carId,
          buyerId: req.userId,
          quantity,
          totalPrice: car.price * quantity,
        },
      });

      await tx.car.update({
        where: { id: carId },
        data: {
          quantity: car.quantity - quantity,
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

import prisma from "../utils/db.js";

const createOrder = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const order = await prisma.order.create({
      data: {
        cartItems,
      },
      include: {
        buyer,
      },
    });

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  const { isSeller } = req.user;
  if (!isSeller)
    res.status(403).json({ error: "You are not allowed to see orders!" });
  try {
    const orders = await prisma.order.findMany({
      include: {
        car: {
          select: {
            model: true,
            coverImage: true,
            price: true,
          },
        },
        buyer: true,
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: req.body,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { createOrder, getAllOrders, updateOrderPaymentStatus };

import prisma from "../utils/db.js";

const createOrder = async (req, res) => {
  try {
    const { carId } = req.params;
    const { id: userId } = req.user;
    const { orderType, totalPrice, address } = req.body;
    const car = await prisma.car.findUnique({
      where: { id: parseInt(carId) },
    });
    console.log(car);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const order = await prisma.order.create({
      data: {
        carId: car.id,
        orderType,
        totalPrice,
        userId,
        address,
      },
    });

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        car: true,
        user: true,
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        car: true,
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { paymentStatus },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderPaymentStatus,
  deleteOrder,
};

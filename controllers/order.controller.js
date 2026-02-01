import prisma from "../utils/db.js";
import stripe from "../utils/stripe.js";
import AppError from "../utils/AppError.js";

const createPaymentIntent = async (req, res, next) => {
  const { totalPrice } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,
      currency: "usd",
      payment_method_types: ["card"],
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

const getOrdersForSeller = async (req, res, next) => {
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
    next(new AppError(error.message, 500));
  }
};

const getOrdersForBuyer = async (req, res, next) => {
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
    next(new AppError(error.message, 500));
  }
};

const confirmOrder = async (req, res, next) => {
  const { cartItemIds } = req.body; // Accept array of cart item IDs or single ID

  try {
    const itemIds = Array.isArray(cartItemIds) ? cartItemIds : [cartItemIds];

    // Fetch all cart items
    const cartItems = await prisma.cart.findMany({
      where: {
        id: { in: itemIds },
        buyerId: req.userId,
      },
      include: { car: true },
    });

    if (cartItems.length === 0) {
      return next(new AppError("No cart items found!", 404));
    }

    // Validate stock for all items before creating any orders
    for (const item of cartItems) {
      if (!item.car) {
        return next(
          new AppError(`Car not found for cart item ${item.id}!`, 404),
        );
      }
      if (item.car.quantityInStock < item.quantity) {
        return next(
          new AppError(
            `Not enough stock for ${item.car.brand}. Available: ${item.car.quantityInStock}, Requested: ${item.quantity}`,
            400,
          ),
        );
      }
    }

    // Create orders and update stock for each item
    const orders = [];
    for (const cartItem of cartItems) {
      const { totalPrice, quantity, car, carId } = cartItem;

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

      await prisma.cart.delete({ where: { id: cartItem.id } });

      orders.push(order);
    }

    return res.status(201).json({
      message: `Successfully created ${orders.length} order(s)`,
      orders,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

const getRevenueStatistics = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        car: {
          sellerId: req.userId,
        },
      },
      select: {
        totalPrice: true,
        quantity: true,
        createdAt: true,
      },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0,
    );

    const yearlyRevenue = orders.reduce((acc, order) => {
      const year = new Date(order.createdAt).getFullYear();
      acc[year] = (acc[year] || 0) + Number(order.totalPrice);
      return acc;
    }, {});

    const monthlyRevenue = orders.reduce((acc, order) => {
      const month = new Date(order.createdAt).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + Number(order.totalPrice);
      return acc;
    }, {});

    res.status(200).json({ yearlyRevenue, monthlyRevenue, totalRevenue });
  } catch (error) {
    next(new AppError("Failed to fetch revenue statistics.", 500));
  }
};

export {
  createPaymentIntent,
  confirmOrder,
  getRevenueStatistics,
  getOrdersForBuyer,
  getOrdersForSeller,
};

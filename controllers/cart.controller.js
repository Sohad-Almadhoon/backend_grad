import prisma from "../utils/db.js";
import AppError from "../utils/AppError.js";

const getCartItems = async (req, res, next) => {
  try {
    const buyerId = req.userId;
    const cartItems = await prisma.cart.findMany({
      where: { buyerId },
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

    res.status(200).json({
      length: cartItems.length,
      cartItems,
    });
  } catch (error) {
    next(new AppError("Failed to fetch cart items.", 500, error.message));
  }
};

const addItemToCart = async (req, res, next) => {
  const { carId, quantity } = req.body;
  try {
    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car) {
      return next(new AppError("Car not found.", 404));
    }

    const existingCartItem = await prisma.cart.findFirst({
      where: {
        carId,
        buyerId: req.userId,
      },
    });

    if (existingCartItem) {
      return next(new AppError("This item is already in the cart.", 400));
    }

    const cartItem = await prisma.cart.create({
      data: {
        buyerId: req.userId,
        carId,
        quantity,
        totalPrice: car.price * quantity,
      },
    });

    res.status(201).json(cartItem);
  } catch (error) {
    next(new AppError("Failed to add item to cart.", 500, error.message));
  }
};

const updateCartItem = async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(id) },
      include: { car: true },
    });

    if (!cartItem || cartItem.buyerId !== req.userId) {
      return next(new AppError("Cart item not found or access denied.", 404));
    }

    const newTotalPrice = cartItem.car.price * quantity;
    const updatedCartItem = await prisma.cart.update({
      where: { id: parseInt(id) },
      data: {
        quantity,
        totalPrice: newTotalPrice,
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

    res.status(200).json(updatedCartItem);
  } catch (error) {
    next(new AppError("Failed to update cart item.", 500, error.message));
  }
};

const removeItemFromCart = async (req, res, next) => {
  const { id } = req.params;

  try {
    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(id) },
    });

    if (!cartItem || cartItem.buyerId !== req.userId) {
      return next(new AppError("Cart item not found or access denied.", 404));
    }

    await prisma.cart.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).json();
  } catch (error) {
    next(new AppError("Failed to remove item from cart.", 500, error.message));
  }
};

export { getCartItems, addItemToCart, updateCartItem, removeItemFromCart };

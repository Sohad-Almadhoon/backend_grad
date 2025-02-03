import prisma from "../utils/db.js";
const getCartItems = async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
};

const addItemToCart = async (req, res) => {
  const { carId, quantity } = req.body;
  try {
    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car) {
      return res.status(404).json({ error: "Car not found." });
    }
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        carId,
        buyerId: req.userId,
      },
    });

    if (existingCartItem) {
      return res
        .status(400)
        .json({ error: "This item is already in the cart." });
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
    res.status(500).json({ error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(id) },
      include: { car: true },
    });
    if (!cartItem || cartItem.buyerId !== req.userId) {
      return res
        .status(404)
        .json({ error: "Cart item not found or access denied." });
    }

    const newTotalPrice = cartItem.car.price * quantity;
    const updatedCartItem = await prisma.cart.update({
      where: { id: parseInt(id) },
      data: {
        quantity,
        totalPrice: newTotalPrice,
      },
    });

    res.status(200).json(updatedCartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(id) },
    });
    if (!cartItem || cartItem.buyerId !== req.userId) {
      return res
        .status(404)
        .json({ error: "Cart item not found or access denied." });
    }
    await prisma.cart.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export { getCartItems, addItemToCart, updateCartItem, removeItemFromCart };

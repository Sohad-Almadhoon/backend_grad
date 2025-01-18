import prisma from "../utils/db.js";
const getCartItems = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const cartItems = await prisma.cart.findMany({
      where: { buyerId },
      include: {
        car: true,
      },
    });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addItemToCart = async (req, res) => {
  try {
     const buyerId = req.user.id;

    const cartItem = await prisma.cart.create({
      data: {
        buyerId,
        ...req.body,
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

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
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
    await prisma.cart.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export { getCartItems, addItemToCart, updateCartItem, removeItemFromCart };

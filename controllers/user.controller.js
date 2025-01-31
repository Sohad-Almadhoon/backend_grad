import prisma from "../utils/db.js";

const fetchSellerCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        sellerId: req.userId,
      },
      select: {
        brand: true,
        coverImage: true,
        country: true,
        price: true,
      }
    });
    res.status(200).json({
      length: cars.length,
      cars,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars." });
  }
};

const fetchUserDetails = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
      select: {
        email: true,
        username: true,
        whatsapp: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user details." });
  }
};
const updateUserDetails = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: req.body,
    });
    const { username,  whatsapp , email } = user;
    res.status(200).json({ username, whatsapp, email });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user details." });
  }
};


export {
  fetchSellerCars,
  fetchUserDetails,
  updateUserDetails,
};

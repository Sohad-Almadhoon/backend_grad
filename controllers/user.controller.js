import prisma from "../utils/db.js";
import AppError from "../utils/AppError.js"; 

const fetchSellerCars = async (req, res, next) => {
  try {
    const cars = await prisma.car.findMany({
      where: { sellerId: req.userId },
    });
    res.status(200).json({ length: cars.length, cars });
  } catch (error) {
    next(new AppError("Failed to fetch cars.", 500));
  }
};

const fetchUserDetails = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true, username: true, whatsapp: true },
    });

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    res.status(200).json(user);
  } catch (error) {
    next(new AppError("Failed to fetch user details.", 500));
  }
};

const updateUserDetails = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: req.body,
    });

    const { username, whatsapp, email } = user;
    res.status(200).json({ username, whatsapp, email });
  } catch (error) {
    next(new AppError("Failed to update user details.", 500));
  }
};

export { fetchSellerCars, fetchUserDetails, updateUserDetails };

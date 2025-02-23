import prisma from "../utils/db.js";
import AppError from "../utils/AppError.js";

const addReview = async (req, res, next) => {
  const { star, desc, carId } = req.body;
  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        buyerId: req.userId,
        carId,
      },
    });

    if (existingReview) {
      return next(new AppError("You have already reviewed this car.", 400));
    }

    const review = await prisma.review.create({
      data: {
        carId,
        star,
        desc,
        buyerId: req.userId,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    next(new AppError("Failed to add review.", 500));
  }
};

export { addReview };

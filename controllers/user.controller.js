import prisma from "../utils/db.js";
import AppError from "../utils/AppError.js"; 

const getSellerCars = async (req, res, next) => {
  try {
    const cars = await prisma.car.findMany({
      where: { sellerId: req.userId },
    });
    res.status(200).json({ length: cars.length, cars });
  } catch (error) {
    next(new AppError("Failed to fetch cars.", 500));
  }
};


const getSoldCars = async (req, res, next) => {
  try {
    const soldCars = await prisma.car.findMany({
      where: {
        sellerId: req.userId,
        quantitySold: { gt: 0 },
      },
      orderBy: {
        quantitySold: "desc",
      },
      include: {
        orders: {
          select: {
            buyerId: true,
          },
        },
        reviews: {
          select: {
            star: true,
          },
        },
      },
    });

    const groupedCars = {};

    soldCars.forEach((car) => {
      if (!groupedCars[car.brand]) {
        groupedCars[car.brand] = {
          totalSold: 0,
          totalBuyers: new Set(),
          cars: [],
        };
      }

      const reviewCount = car.reviews.length;
      const averageRating =
        reviewCount > 0
          ? car.reviews.reduce((sum, review) => sum + review.star, 0) /
            reviewCount
          : 0;

      groupedCars[car.brand].cars.push({
        reviewCount,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ...car,
      });

      groupedCars[car.brand].totalSold += car.quantitySold;
      car.orders.forEach((order) =>
        groupedCars[car.brand].totalBuyers.add(order.buyerId)
      );
    });

    Object.keys(groupedCars).forEach((brand) => {
      groupedCars[brand].totalBuyers = groupedCars[brand].totalBuyers.size;
    });

    res.status(200).json({ cars: groupedCars });
  } catch (error) {
    next(new AppError("Failed to fetch sold cars.", 500));
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

export { getSellerCars, fetchUserDetails, updateUserDetails, getSoldCars  };

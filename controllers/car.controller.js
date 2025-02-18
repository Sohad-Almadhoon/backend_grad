import prisma from "../utils/db.js";

const getCars = async (req, res) => {
  const { country, brand, color, orderByPrice } = req.query;
  try {
    const cars = await prisma.car.findMany({
      include: {
        seller: {
        select: {
          username: true,
          whatsapp: true,
        },
      },
      },
      where: {
        ...(country && { country: { contains: country, mode: "insensitive" } }),
        ...(color && { color: { equals: color, mode: "insensitive" } }),
        ...(brand && {
          brand: { equals: brand, mode: "insensitive" },
        }),
      },
      orderBy: {
        price: orderByPrice === "desc" ? "desc" : "asc",
      },
    });
    res.status(200).json({
      length: cars.length,
      cars,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch cars.", error: error.message });
  }
};

const getCarById = async (req, res) => {
  const { id } = req.params;
  try {
    const car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: {
          select: {
            username: true,
            email: true,
            whatsapp: true,
          },
        },
        reviews: {
          select: {
            star: true,
            desc: true,
            buyer: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    if (!car) {
      return res
        .status(404)
        .json({ error: "Car not found.", error: error.message });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car details." });
  }
};

const createCar = async (req, res) => {
  if (!req.isSeller)
    return res
      .status(403)
      .json({ error: "You are not allowed to create a car!" });
  try {
    const car = await prisma.car.create({
      data: {
        ...req.body,
        sellerId: req.userId,
      },
    });
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to add car.", error: error.message });
  }
};

const deleteCar = async (req, res) => {
  const { id } = req.params;
  if (!req.isSeller)
    return res
      .status(403)
      .json({ error: "You are not allowed to delete a car!" });
  try {
    const car = await prisma.car.findUnique({ where: { id: parseInt(id) } });
    if (!car) {
      return res.status(404).json({ error: "Car not found." });
    }
    if (car.sellerId !== req.userId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to delete this car." });
    }
    await prisma.car.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Car deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete car.", error: error.message });
  }
};

const updateCar = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.isSeller)
      res.status(403).json({ error: "You are not allowed to update a car!" });
    const car = await prisma.car.findUnique({ where: { id: parseInt(id) } });
    if (car.sellerId !== req.userId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to update this car." });
    }
    const updatedCar = await prisma.car.update({
      where: { id: parseInt(id) },
      data: req.body,
    });

    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to update car", error: error.message });
  }
};

const getCarsStatistics = async (req, res) => {
  if (!req.isSeller) {
    return res
      .status(403)
      .json({ error: "You are not allowed to see these statistics!" });
  }
  try {
    const cars = await prisma.car.findMany({
      where: {
        sellerId: req.userId,
      },
      select: {
        price: true,
        quantityInStock: true,
        quantitySold: true,
        coverImage: true,
        brand: true,
        orders: {
          select: {
            buyer: {
              select: {
                username: true,
                email: true,
                whatsapp: true,
              },
            },
          },
        },
      },
    });

    const totalCars = cars.length;
    const totalQuantity = cars.reduce(
      (sum, car) => sum + car.quantityInStock,
      0
    );
    const totalSoldQuantity = cars.reduce(
      (sum, car) => sum + car.quantitySold,
      0
    );
    const revenue = cars.reduce(
      (sum, car) => sum + car.price * car.quantitySold,
      0
    );
    const remainingCars = cars
      .filter((car) => car.quantityInStock > 0)
      .map((car) => ({
        ...car,
        remainingQuantity: car.quantityInStock,
      }));

    const soldCars = cars
      .filter((car) => car.quantitySold > 0)
      .map((car) => ({
        ...car,
        soldQuantity: car.quantitySold,
      }));

    const soldRatio =
      totalSoldQuantity / (totalQuantity + totalSoldQuantity) || 0;
    const availableRatio =
      totalQuantity / (totalQuantity + totalSoldQuantity) || 0;

    res.status(200).json({
      totalCars,
      revenue,
      totalQuantity,
      totalSoldQuantity,
      soldRatio,
      availableRatio,
      remainingCars,
      soldCars,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch car statistics.", error: error.message });
  }
};
const fetchSellerDetails = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        sellerId: req.userId,
      },
      include: {
        reviews: true,
        seller: {
          select: {
            username: true,
            email: true,
            whatsapp: true,
          },
        },
      },
    });

    if (!cars || cars.length === 0) {
      return res.status(404).json({ error: "No cars found for this seller." });
    }

    // Calculate total reviews and average stars
    let totalReviews = 0;
    let totalStars = 0;

    cars.forEach((car) => {
      totalReviews += car.reviews.length;
      totalStars += car.reviews.reduce((sum, review) => sum + review.star, 0);
    });

    const averageStars = totalReviews > 0 ? totalStars / totalReviews : 0;

    // Structure the response
    res.status(200).json({
      length: cars.length,
      seller: {
        username: cars[0].seller.username,
        email: cars[0].seller.email,
        whatsapp: cars[0].seller.whatsapp,
        averageStars: parseFloat(averageStars.toFixed(2)),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch seller details.", error: error.message });
  }
};

export {
  getCars,
  getCarsStatistics,
  getCarById,
  createCar,
  deleteCar,
  updateCar,
  fetchSellerDetails,
};

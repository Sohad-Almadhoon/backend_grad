import prisma from "../utils/db.js";

const getCars = async (req, res) => {
  const { country, brand, color, minPrice, maxPrice } = req.query;
  try {
    const cars = await prisma.car.findMany({
      where: {
        ...(country && { country: { contains: country, mode: "insensitive" } }),
        ...(color && { color: { equals: color, mode: "insensitive" } }),
        ...(brand && {
          brand: { equals: brand, mode: "insensitive" },
        }),
        ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
        ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      },
    });
    res.status(200).json({
      length: cars.length,
      cars,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars." });
  }
};

const getCarById = async (req, res) => {
  const { id } = req.params;
  try {
    const car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
    });
    if (!car) {
      return res.status(404).json({ error: "Car not found." });
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
    res.status(500).json({ error: "Failed to add car.", error });
  }
};

const deleteCar = async (req, res) => {
  const { id } = req.params;
  const { isSeller } = req.user;
  if (!isSeller)
    return res
      .status(403)
      .json({ error: "You are not allowed to create a car!" });
  try {
    const car = await prisma.car.findUnique({ where: { id: parseInt(id) } });
    if (!car) {
      return res.status(404).json({ error: "Car not found." });
    }

    await prisma.car.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Car deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete car." });
  }
};

const updateCar = async (req, res) => {
  const { id } = req.params;
  const { isSeller } = req.user;
  if (!isSeller)
    res.status(403).json({ error: "You are not allowed to create a car!" });
  try {
    const updatedCar = await prisma.car.update({
      where: { id: parseInt(id) },
      data: req.body,
    });

    res.json({ message: "Car updated successfully", updatedCar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update car" });
  }
};

const getCarsStatistics = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        sellerId: req.userId,
      },
    });

    const totalCars = cars.length;
    const totalQuantity = cars.reduce((sum, car) => sum + car.quantity, 0);
    const totalSoldQuantity = cars.reduce(
      (sum, car) => sum + car.quantitySold,
      0
    );

    const remainingCars = cars
      .filter((car) => car.quantity > 0)
      .map((car) => ({
        ...car,
        remainingQuantity: car.quantity,
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
      totalQuantity,
      totalSoldQuantity,
      soldRatio,
      availableRatio,
      remainingCars,
      soldCars,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car statistics." });
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
    res.status(500).json({ error: "Failed to fetch seller details." });
  }
};

export {
  getCars,
  getCarsStatistics,
  getCarById,
  createCar,
  deleteCar,
  addReview,
  getCarReviews,
  updateCar,
  fetchSellerDetails,
};

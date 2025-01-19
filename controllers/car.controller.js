import prisma from "../utils/db.js";

const getCars = async (req, res) => {
  const { country, brand, color, minPrice, maxPrice } = req.query;
  try {
    const cars = await prisma.car.findMany({
      where: {
        ...(country && { model: { contains: country, mode: "insensitive" } }),
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

const addReview = async (req, res) => {
  const { id: carId } = req.params;

  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        buyerId: req.userId,
        carId,
      },
    });
    if (existingReview)
      return res
        .status(400)
        .json({ message: "You have already reviewed this car!." });

    console.log({ carId: parseInt(carId), ...req.body, buyerId: req.userId });
    const review = await prisma.review.create({
      data: { carId: parseInt(carId), ...req.body, buyerId: req.userId },
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to add review." });
  }
};

const getCarReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: {
        carId: parseInt(id),
      },
      include: {
        buyer: {
          select: {
            username: true,
          },
        },
      },
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews." });
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

export {
  getCars,
  getCarById,
  createCar,
  deleteCar,
  addReview,
  getCarReviews,
  updateCar,
};

import prisma from "../utils/db.js";

const getCars = async (req, res) => {
  const { name, color, isForSale, isForRent } = req.query;
  try {
    const cars = await prisma.car.findMany({
      where: {
        ...(name && { name: { contains: name, mode: "insensitive" } }),
        ...(color && { color: { equals: color, mode: "insensitive" } }),
        ...(isForSale && { isForSale: isForSale === "true" }),
        ...(isForRent && { isForRent: isForRent === "true" }),
      },
    });
    res.status(200).json({
      length: cars.length,
      cars
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
      include: { comments: true },
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
  const userId = req.user.id;
  try {
    const car = await prisma.car.create({
      data: {
        ...req.body,
        userId : parseInt(userId),
      },
    });
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to add car." , error });
  }
};

const deleteCar = async (req, res) => {
  const { id } = req.params;
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

const addComment = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  const { id: carId } = req.params;
  console.log(content, userId, carId);
  try {
    const comment = await prisma.comment.create({
      data: { carId: parseInt(carId), content, userId },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment." });
  }
};

export { getCars, getCarById, createCar, deleteCar, addComment };

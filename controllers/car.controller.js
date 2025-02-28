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
  if (!req.isSeller) {
    return res
      .status(403)
      .json({ error: "You are not allowed to create a car!" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  try {
    // Convert all numeric fields to appropriate types
    const price = parseFloat(req.body.price);
    const quantityInStock = parseInt(req.body.quantityInStock, 10);
    const year = parseInt(req.body.year, 10);
    const battery = parseInt(req.body.battery, 10);
    const speed = parseFloat(req.body.speed);
    const range = parseFloat(req.body.range);
    const seats = parseInt(req.body.seats, 10);
    const climate = req.body.climate === "true";

    const imageUrls = req.files.map((file) => file.path);

    const car = await prisma.car.create({
      data: {
        price: price,
        quantityInStock: quantityInStock,
        year: year,
        battery: battery,
        speed: speed,
        range: range,
        seats: seats,
        color: req.body.color,
        brand: req.body.brand,
        country: req.body.country,
        transmission: req.body.transmission,
        carType: req.body.carType,
        fuelType: req.body.fuelType,
        climate: climate,
        sellerId: req.userId,
        coverImage: imageUrls[0],
        images: imageUrls,
      },
    });
    res.status(201).json(car);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add car.", details: error.message });
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

    let totalReviews = 0;
    let totalStars = 0;

    cars.forEach((car) => {
      totalReviews += car.reviews.length;
      totalStars += car.reviews.reduce((sum, review) => sum + review.star, 0);
    });

    const averageStars = totalReviews > 0 ? totalStars / totalReviews : 0;

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
const getSoldCarsStatistics = async (req, res) => {
  try {
    const soldCars = await prisma.car.findMany({
      where: {
        sellerId: req.userId,
        quantitySold: { gt: 0 },
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

    // Object to store grouped data
    const statisticsByMonth = {};

    soldCars.forEach((car) => {
      const soldMonth = car.orders[0]?.createdAt
        ? new Date(car.orders[0].createdAt).toISOString().slice(0, 7) // Format: YYYY-MM
        : "Unknown";

      if (!statisticsByMonth[soldMonth]) {
        statisticsByMonth[soldMonth] = {};
      }

      if (!statisticsByMonth[soldMonth][car.brand]) {
        statisticsByMonth[soldMonth][car.brand] = {
          soldCars: [],
          totalSold: 0,
          totalRemaining: 0,
        };
      }

      const reviewCount = car.reviews.length;
      const averageRating =
        reviewCount > 0
          ? car.reviews.reduce((sum, review) => sum + review.star, 0) /
            reviewCount
          : 0;

      statisticsByMonth[soldMonth][car.brand].soldCars.push({
        ...car,
        reviewCount,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalBuyers: new Set(car.orders.map((order) => order.buyerId)).size,
      });

      statisticsByMonth[soldMonth][car.brand].totalSold += car.quantitySold;
      statisticsByMonth[soldMonth][car.brand].totalRemaining +=
        car.quantityInStock;
    });

    res.status(200).json({ cars: statisticsByMonth });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch sold car statistics.",
      details: error.message,
    });
  }
};

const getTopSellingCars = async (req, res) => {
  try {
    const topSellingCars = await prisma.car.findMany({
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
    console.log(topSellingCars)
    const groupedCars = {};

    topSellingCars.forEach((car) => {
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
        ...car
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
    res.status(500).json({
      error: "Failed to fetch top-selling car statistics.",
      details: error.message,
    });
  }
};

export {
  getCars,
  getSoldCarsStatistics,
  getTopSellingCars,
  getCarById,
  createCar,
  deleteCar,
  updateCar,
  fetchSellerDetails,
};

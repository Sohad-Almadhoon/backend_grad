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
      return res.status(404).json({ error: "Car not found." });
    }

    // Calculate reviews length and average star rating
    const reviewsLength = car.reviews.length;
    const totalStars = car.reviews.reduce((sum, review) => sum + review.star, 0);
    const averageStars = reviewsLength > 0 ? totalStars / reviewsLength : 0;

    // Count unique buyers
    const uniqueBuyers = new Set(car.reviews.map((review) => review.buyer.username));
    const buyersCount = uniqueBuyers.size;

    res.status(200).json({
      ...car,
      reviewsLength,
      averageStars: parseFloat(averageStars.toFixed(1)), // Rounded to 1 decimal place
      buyersCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car details.", details: error.message });
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
    
    await prisma.order.deleteMany({
    where: { carId: parseInt(id) }
    });
    await prisma.review.deleteMany({
    where: { carId: parseInt(id) }
    });
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
const getTopSellingCars = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required." });
    }

    const monthInt = parseInt(month, 10);
    const yearInt = parseInt(year, 10);

    const startDate = new Date(yearInt, monthInt - 1, 1); // First day of the month
    const endDate = new Date(yearInt, monthInt, 1); // First day of the next month

    // Fetch all orders in the given month for the seller's cars
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
        car: { sellerId: req.userId },
      },
      select: {
        carId: true,
        buyerId: true,
      },
    });

    if (orders.length === 0) {
      return res.status(200).json({ cars: [] });
    }

    // Group orders by carId
    const carOrderMap = {};
    orders.forEach((order) => {
      const carId = order.carId;
      if (!carOrderMap[carId]) {
        carOrderMap[carId] = { totalSold: 0, buyers: new Set() };
      }
      carOrderMap[carId].totalSold += 1;
      carOrderMap[carId].buyers.add(order.buyerId);
    });

    // Fetch car details for the sold cars
    const carIds = Object.keys(carOrderMap).map(Number); // Convert to numbers
    const cars = await prisma.car.findMany({
      where: { id: { in: carIds } },
      include: { reviews: { select: { star: true } } },
    });

    // Group by brand
    const groupedCars = {};
    cars.forEach((car) => {
      if (!groupedCars[car.brand]) {
        groupedCars[car.brand] = {
          brand: car.brand,
          totalSold: 0,
          totalBuyers: new Set(),
          cars: [],
        };
      }

      const { totalSold, buyers } = carOrderMap[car.id] || { totalSold: 0, buyers: new Set() };
      const reviewCount = car.reviews.length;
      const averageRating =
        reviewCount > 0
          ? car.reviews.reduce((sum, review) => sum + review.star, 0) / reviewCount
          : 0;

      groupedCars[car.brand].cars.push({
        ...car,
        quantitySold: totalSold,
        reviewCount,
        averageRating: parseFloat(averageRating.toFixed(1)),
      });

      groupedCars[car.brand].totalSold += totalSold;
      buyers.forEach((buyer) => groupedCars[car.brand].totalBuyers.add(buyer));
    });

    // Convert Set to number
    Object.keys(groupedCars).forEach((brand) => {
      groupedCars[brand].totalBuyers = groupedCars[brand].totalBuyers.size;
    });

    // Sort brands by total sales
    const sortedCars = Object.values(groupedCars).sort((a, b) => b.totalSold - a.totalSold);

    res.status(200).json({ cars: sortedCars });
  } catch (error) {
    console.error("Error fetching top-selling cars:", error);
    res.status(500).json({
      error: "Failed to fetch top-selling cars for the specified month.",
      details: error.message,
    });
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
            createdAt: true,
          },
        },
      },
    });

    const statistics = [];

    soldCars.forEach((car) => {
      car.orders.forEach((order) => {
        const monthName = new Date(order.createdAt).toLocaleString("en-US", {
          month: "short", // Returns "Jan", "Feb", etc.
        });

        let monthEntry = statistics.find((entry) => entry.month === monthName);

        if (!monthEntry) {
          monthEntry = { month: monthName, cars: [] };
          statistics.push(monthEntry);
        }

        const existingCar = monthEntry.cars.find(
          (entry) => entry.id === car.id
        );

        if (existingCar) {
          existingCar.soldQuantity += 1;
          existingCar.remainingQuantity -= 1;
        } else {
          monthEntry.cars.push({
            id: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            remainingQuantity: car.quantityInStock,
            soldQuantity: 1,
          });
        }
      });
    });

    res.status(200).json(statistics);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch sold car statistics.",
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

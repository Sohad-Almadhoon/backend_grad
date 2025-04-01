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
      orderBy: orderByPrice
        ? { price: orderByPrice === "desc" ? "desc" : "asc" }
        : { createdAt: "desc" },
    });
    res.status(200).json({
      length: cars.length,
      cars,
    });
  } catch (error) {
    next(new AppError("Failed to fetch cars.", 500));
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
    if (!car) return next(new AppError("Car not found.", 404));

    // Calculate reviews length and average star rating
    const reviewsLength = car.reviews.length;
    const totalStars = car.reviews.reduce(
      (sum, review) => sum + review.star,
      0
    );
    const averageStars = reviewsLength > 0 ? totalStars / reviewsLength : 0;

    // Count unique buyers
    const uniqueBuyers = new Set(
      car.reviews.map((review) => review.buyer.username)
    );
    const buyersCount = uniqueBuyers.size;

    res.status(200).json({
      ...car,
      reviewsLength,
      averageStars: parseFloat(averageStars.toFixed(1)),
      buyersCount,
    });
  } catch (error) {
    next(new AppError("Failed to fetch car details.", 500));
  }
};

const createCar = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError("No images uploaded", 400));
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
        images: imageUrls.length > 1 ? imageUrls.slice(1) : [],
      },
    });
    res.status(201).json(car);
  } catch (error) {
    next(new AppError("Failed to add car.", 500));
  }
};

const deleteCar = async (req, res) => {
  const { id } = req.params;

  try {
    const car = await prisma.car.findUnique({ where: { id: parseInt(id) } });
    if (!car) return next(new AppError("Car not found.", 404));
    if (car.sellerId !== req.userId)
      return next(new AppError("Not authorized to delete this car.", 403));
    await prisma.order.deleteMany({
      where: { carId: parseInt(id) },
    });
    await prisma.review.deleteMany({
      where: { carId: parseInt(id) },
    });
    await prisma.cart.deleteMany({
      where: { carId: parseInt(id) },
    });
    await prisma.favorite.deleteMany({
      where: { carId: parseInt(id) },
    });
    await prisma.car.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Car deleted successfully." });
  } catch (error) {
    next(new AppError("Failed to delete car.", 500));
  }
};

const updateCar = async (req, res, next) => {
  const { id } = req.params;

  try {
    const car = await prisma.car.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!car) {
      return next(new AppError("Car not found.", 404));
    }

    if (car.sellerId !== req.userId) {
      return next(new AppError("You are not allowed to update this car.", 403));
    }

    const price = req.body.price ? parseFloat(req.body.price) : car.price;
    const quantityInStock = req.body.quantityInStock
      ? parseInt(req.body.quantityInStock, 10)
      : car.quantityInStock;
    const year = req.body.year ? parseInt(req.body.year, 10) : car.year;
    const battery = req.body.battery
      ? parseInt(req.body.battery, 10)
      : car.battery;
    const speed = req.body.speed ? parseFloat(req.body.speed) : car.speed;
    const range = req.body.range ? parseFloat(req.body.range) : car.range;
    const seats = req.body.seats ? parseInt(req.body.seats, 10) : car.seats;
    const climate = req.body.climate
      ? req.body.climate === "true"
      : car.climate;
    let imageUrls = car.images;
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path);
    }

    const updatedCar = await prisma.car.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...req.body,
        price,
        quantityInStock,
        year,
        battery,
        speed,
        range,
        seats,
        color: req.body.color || car.color,
        brand: req.body.brand || car.brand,
        country: req.body.country || car.country,
        transmission: req.body.transmission || car.transmission,
        carType: req.body.carType || car.carType,
        fuelType: req.body.fuelType || car.fuelType,
        climate,
        coverImage: imageUrls.length > 0 ? imageUrls[0] : car.coverImage,
        images: imageUrls.length > 1 ? imageUrls.slice(1) : [],
      },
    });

    res.json(updatedCar);
  } catch (error) {
    next(new AppError("Failed to update car.", 500));
  }
};

const fetchSellerDetails = async (req, res, next) => {
  try {
    const cars = await prisma.car.findMany({
      where: { sellerId: req.userId },
      include: {
        reviews: true,
        seller: {
          select: { username: true, email: true, whatsapp: true },
        },
      },
    });

    if (!cars || cars.length === 0) {
      return next(new AppError("No cars found for this seller.", 404));
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
    next(new AppError("Failed to fetch seller details.", 500));
  }
};

const getTopSellingCars = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return next(new AppError("Month and year are required.", 400));
    }

    const monthInt = parseInt(month, 10);
    const yearInt = parseInt(year, 10);

    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

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

    const carOrderMap = {};
    orders.forEach((order) => {
      const carId = order.carId;
      if (!carOrderMap[carId]) {
        carOrderMap[carId] = { totalSold: 0, buyers: new Set() };
      }
      carOrderMap[carId].totalSold += 1;
      carOrderMap[carId].buyers.add(order.buyerId);
    });

    const carIds = Object.keys(carOrderMap).map(Number);
    const cars = await prisma.car.findMany({
      where: { id: { in: carIds } },
      include: { reviews: { select: { star: true } } },
    });

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

      const { totalSold, buyers } = carOrderMap[car.id] || {
        totalSold: 0,
        buyers: new Set(),
      };
      const reviewCount = car.reviews.length;
      const averageRating =
        reviewCount > 0
          ? car.reviews.reduce((sum, review) => sum + review.star, 0) /
            reviewCount
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

    Object.keys(groupedCars).forEach((brand) => {
      groupedCars[brand].totalBuyers = groupedCars[brand].totalBuyers.size;
    });
    const sortedCars = Object.values(groupedCars).sort(
      (a, b) => b.totalSold - a.totalSold
    );

    res.status(200).json({ soldCars: sortedCars });
  } catch (error) {
    next(new AppError("Failed to fetch top-selling cars for the specified month.", 500));
  }
};

const getSoldCarsStatistics = async (req, res, next) => {
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
          month: "short",
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
          existingCar.quantitySold += 1;
        } else {
          monthEntry.cars.push({
            id: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            quantityInStock: car.quantityInStock,
            quantitySold: 1,
          });
        }
      });
    });

    res.json(statistics);
  } catch (error) {
    next(new AppError("Internal Server Error", 500));
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

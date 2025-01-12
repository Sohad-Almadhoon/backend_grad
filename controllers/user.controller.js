import prisma from "../utils/db.js";

const fetchUserCars = async (req, res) => {
  const userId = req.user.id;
  const { name, color, isForSale, isForRent, minPrice, maxPrice } = req.query;

  try {
    const cars = await prisma.car.findMany({
      where: {
        userId, // Always filter by the logged-in user's ID
        ...(name && { name: { contains: name, mode: "insensitive" } }),
        ...(color && { color: { equals: color, mode: "insensitive" } }),
        ...(isForSale && { isForSale: isForSale === "true" }),
        ...(isForRent && { isForRent: isForRent === "true" }),
        ...(minPrice || maxPrice
          ? {
              price: {
                ...(minPrice && { gte: parseFloat(minPrice) }),
                ...(maxPrice && { lte: parseFloat(maxPrice) }),
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        color: true,
        description: true,
        imageUrl: true,
        price: true,
        rentPerDay: true,
        isForSale: true,
        isForRent: true,
      },
    });

    res.json({
      length: cars.length,
      cars,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user cars" });
  }
};
export { fetchUserCars };
